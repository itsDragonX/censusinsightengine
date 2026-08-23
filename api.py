from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import math
import os

from data_processor import load_and_process_data
from insight_engine import generate_insights

app = FastAPI(title="Census Insight Engine API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data once at startup
try:
    df_global = load_and_process_data()
    df_global, recommendations_global = generate_insights(df_global)
    # Convert NaNs to None for JSON serialization
    df_global = df_global.replace({math.nan: None})
except Exception as e:
    print(f"Error loading data: {e}")
    df_global, recommendations_global = None, None

@app.get("/api/overview")
def get_overview():
    if df_global is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    total_districts = len(df_global)
    
    # Overview table
    overview_data = df_global[['State name', 'District name', 'Population', 'Literacy_Rate', 'Worker_Percentage']].head(20).to_dict(orient='records')
    
    # State population
    state_pop = df_global.groupby('State name')['Population'].sum().reset_index().sort_values(by='Population', ascending=False)
    state_pop_data = state_pop.head(10).to_dict(orient='records')
    
    return {
        "total_districts": total_districts,
        "overview_table": overview_data,
        "top_states": state_pop_data
    }

@app.get("/api/clusters")
def get_clusters():
    if df_global is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    clusters_data = df_global[['District name', 'State name', 'Literacy_Rate', 'Worker_Percentage', 'Youth_Percentage', 'Digital_Penetration', 'Demographic_Cluster']].to_dict(orient='records')
    return clusters_data

@app.get("/api/infrastructure")
def get_infrastructure():
    if df_global is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    return {
        "education": recommendations_global['education'].to_dict(orient='records'),
        "sanitation": recommendations_global['sanitation'].to_dict(orient='records'),
        "digital": recommendations_global['digital'].to_dict(orient='records')
    }

@app.get("/api/districts/{state}")
def get_districts(state: str):
    if df_global is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    state_df = df_global[df_global['State name'] == state]
    if state_df.empty:
        raise HTTPException(status_code=404, detail="State not found")
        
    districts = sorted(state_df['District name'].unique())
    return {"districts": districts}

@app.get("/api/states")
def get_states():
    if df_global is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    states = sorted(df_global['State name'].unique())
    return {"states": states}

@app.get("/api/district_details/{state}/{district}")
def get_district_details(state: str, district: str):
    if df_global is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    state_df = df_global[df_global['State name'] == state]
    dist_data = state_df[state_df['District name'] == district]
    
    if dist_data.empty:
        raise HTTPException(status_code=404, detail="District not found")
        
    return dist_data.iloc[0].to_dict()

@app.get("/api/needs/{need_type}")
def get_needs(need_type: str, top_n: int = 15):
    if df_global is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    if need_type == "sanitation":
        filtered_df = df_global.sort_values(by="Sanitation_Need_Score", ascending=False).head(top_n)
        metric_col = "Sanitation_Need_Score"
    elif need_type == "education":
        filtered_df = df_global.sort_values(by="Education_Need_Score", ascending=False).head(top_n)
        metric_col = "Education_Need_Score"
    elif need_type == "digital":
        filtered_df = df_global.sort_values(by="Digital_Penetration", ascending=True).head(top_n)
        metric_col = "Digital_Penetration"
    else:
        raise HTTPException(status_code=400, detail="Invalid need type")
        
    display_df = filtered_df[['State name', 'District name', metric_col, 'Population']].to_dict(orient='records')
    return display_df

# Serve static files from the 'frontend' directory
if os.path.exists("frontend"):
    app.mount("/static", StaticFiles(directory="frontend", html=True), name="static")

    @app.get("/")
    def read_index():
        with open("frontend/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)
