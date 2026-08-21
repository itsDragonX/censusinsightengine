# pyrefly: ignore [missing-import]
import streamlit as st
import pandas as pd
import geopandas as gpd
# pyrefly: ignore [missing-import]
import plotly.express as px
from data_processor import load_and_process_data
from insight_engine import generate_insights

st.set_page_config(page_title="Census Insight Engine", layout="wide", page_icon="🌍")

@st.cache_data
def get_data():
    df = load_and_process_data()
    df, recommendations = generate_insights(df)
    return df, recommendations

@st.cache_data
def get_geo_data():
    # Load shapefile (simplified for performance)
    try:
        import os
        path_nested = "India-Census-2011-Analysis-master/India_SHP/INDIA.shp"
        path_root = "India_SHP/INDIA.shp"
        shp_path = path_nested if os.path.exists(path_nested) else path_root
        
        gdf = gpd.read_file(shp_path)
        return gdf
    except Exception as e:
        st.warning("Could not load shapefiles for map visualization.")
        return None

# Sidebar
st.sidebar.title("Navigation")
nav_category = st.sidebar.radio("Category", ["Insights & Details", "Search Tools"])

if nav_category == "Insights & Details":
    page = st.sidebar.radio("Go to", ["Overview", "Demographics & Clustering", "Infrastructure Gaps"])
else:
    page = st.sidebar.radio("Go to", ["Search District", "Search by Need"])

# Load Data
with st.spinner("Loading Census Data..."):
    df, recommendations = get_data()

st.title("Census Insight Engine 🌍")
st.markdown("Analyzing India Census 2011 to identify demographic shifts and emerging infrastructure gaps.")

if page == "Overview":
    st.header("Dataset Overview")
    st.write(f"Total Districts Analyzed: {len(df)}")
    st.dataframe(df[['State name', 'District name', 'Population', 'Literacy_Rate', 'Worker_Percentage']].head(20))
    
    st.subheader("Population by State")
    state_pop = df.groupby('State name')['Population'].sum().reset_index().sort_values(by='Population', ascending=False)
    fig = px.bar(state_pop.head(10), x='State name', y='Population', title="Top 10 Most Populous States")
    st.plotly_chart(fig, use_container_width=True)

elif page == "Demographics & Clustering":
    st.header("Demographic Clusters")
    st.markdown("""
    Districts are grouped into 4 clusters based on: **Literacy Rate, Worker Percentage, Youth Percentage, and Digital Penetration.**
    """)
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig1 = px.scatter(df, x='Literacy_Rate', y='Worker_Percentage', color='Demographic_Cluster', 
                          hover_data=['District name', 'State name'], title="Literacy vs Worker Percentage")
        st.plotly_chart(fig1, use_container_width=True)
        
    with col2:
        fig2 = px.scatter(df, x='Youth_Percentage', y='Digital_Penetration', color='Demographic_Cluster',
                          hover_data=['District name', 'State name'], title="Youth vs Digital Penetration")
        st.plotly_chart(fig2, use_container_width=True)

elif page == "Infrastructure Gaps":
    st.header("Priority Infrastructure Gaps")
    st.markdown("Based on demographic factors, here are the regions most in need of specific infrastructure development.")
    
    tab1, tab2, tab3 = st.tabs(["Educational", "Sanitation", "Digital Connectivity"])
    
    with tab1:
        st.subheader("High Priority: Education Infrastructure")
        st.markdown("These districts have a very high proportion of young people (0-29 years) but very low higher education rates.")
        st.dataframe(recommendations['education'])
        
    with tab2:
        st.subheader("High Priority: Sanitation Infrastructure")
        st.markdown("These districts have the highest percentage of households without latrine facilities within premises (relying on open spaces).")
        st.dataframe(recommendations['sanitation'])
        
    with tab3:
        st.subheader("High Priority: Digital Infrastructure")
        st.markdown("These districts have the lowest percentage of households with computers or internet access.")
        st.dataframe(recommendations['digital'])

elif page == "Search District":
    st.header("Search District Details")
    
    # State selection
    states = sorted(df['State name'].unique())
    selected_state = st.selectbox("Select State", states)
    
    # Filter districts by selected state
    state_df = df[df['State name'] == selected_state]
    districts = sorted(state_df['District name'].unique())
    
    # District selection
    selected_district = st.selectbox("Select District", districts)
    
    if selected_district:
        dist_data = state_df[state_df['District name'] == selected_district].iloc[0]
        
        st.subheader(f"Details for {selected_district}, {selected_state}")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Population", f"{dist_data['Population']:,}")
            st.metric("Literacy Rate", f"{dist_data['Literacy_Rate']:.2f}%")
        with col2:
            st.metric("Worker Percentage", f"{dist_data['Worker_Percentage']:.2f}%")
            st.metric("Youth Percentage (0-29)", f"{dist_data['Youth_Percentage']:.2f}%")
        with col3:
            st.metric("Digital Penetration", f"{dist_data['Digital_Penetration']:.2f}%")
            
        st.markdown("---")
        st.subheader("Need Scores")
        score1, score2 = st.columns(2)
        score1.metric("Education Need Score (Higher is more need)", f"{dist_data['Education_Need_Score']:.2f}")
        score2.metric("Sanitation Need Score (Higher is more need)", f"{dist_data['Sanitation_Need_Score']:.2f}")

elif page == "Search by Need":
    st.header("Search by Infrastructure Need")
    
    # 1. Select the Need Type
    need_type = st.selectbox("Select the specific need you are looking for:", 
                             ["Poor Health & Sanitation", "Education Infrastructure", "Digital Connectivity"])
    
    # 2. Select the granularity (Top N)
    top_n = st.slider("How many districts to show?", min_value=5, max_value=100, value=15)
    
    if need_type == "Poor Health & Sanitation":
        # Sort by Sanitation_Need_Score descending
        filtered_df = df.sort_values(by="Sanitation_Need_Score", ascending=False).head(top_n)
        metric_col = "Sanitation_Need_Score"
        st.markdown("Showing districts with the highest percentage of households without latrine/bathing facilities inside premises.")
    elif need_type == "Education Infrastructure":
        filtered_df = df.sort_values(by="Education_Need_Score", ascending=False).head(top_n)
        metric_col = "Education_Need_Score"
        st.markdown("Showing districts with a high youth population but low higher-education access.")
    else: # Digital Connectivity
        # Sort by Digital_Penetration ASCENDING because lower means higher need
        filtered_df = df.sort_values(by="Digital_Penetration", ascending=True).head(top_n)
        metric_col = "Digital_Penetration"
        st.markdown("Showing districts with the lowest percentage of households with internet or computers.")
    
    # Show the dataframe
    display_df = filtered_df[['State name', 'District name', metric_col, 'Population']]
    st.dataframe(display_df, use_container_width=True)
    
    # Display Bar chart
    st.subheader(f"Top {top_n} Districts for: {need_type}")
    fig = px.bar(display_df, x="District name", y=metric_col, color="State name", 
                 title=f"{need_type} by District")
    st.plotly_chart(fig, use_container_width=True)
