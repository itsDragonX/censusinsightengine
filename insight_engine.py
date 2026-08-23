import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

def generate_insights(df):
    """Generates demographic clusters and infrastructure recommendations."""
    
    # 1. Clustering Districts based on Demographics
    # Select features for clustering
    features = ['Literacy_Rate', 'Worker_Percentage', 'Youth_Percentage', 'Digital_Penetration']
    X = df[features].fillna(0)
    
    # Scale data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Apply KMeans
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    df['Demographic_Cluster'] = kmeans.fit_predict(X_scaled)
    
    # 2. Infrastructure Recommendations
    # Identify top districts needing Education Infrastructure
    top_edu_needs = df.sort_values(by='Education_Need_Score', ascending=False).head(10)
    edu_recommendations = top_edu_needs[['District name', 'State name', 'Education_Need_Score', 'Youth_Percentage', 'Higher_Ed_Percentage']]
    
    # Identify top districts needing Sanitation/Healthcare Infrastructure
    top_sanitation_needs = df.sort_values(by='Sanitation_Need_Score', ascending=False).head(10)
    sanitation_recommendations = top_sanitation_needs[['District name', 'State name', 'Sanitation_Need_Score']]
    
    # Identify top districts needing Digital Infrastructure
    top_digital_needs = df.sort_values(by='Digital_Penetration', ascending=True).head(10)
    digital_recommendations = top_digital_needs[['District name', 'State name', 'Digital_Penetration']]
    
    return df, {
        "education": edu_recommendations,
        "sanitation": sanitation_recommendations,
        "digital": digital_recommendations
    }
