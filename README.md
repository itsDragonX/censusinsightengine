# 🌍 Census Insight Engine

An interactive, data-driven intelligence engine built to analyze historical census data, estimate demographic shifts, and identify emerging gaps in public infrastructure across India. 

**[View the Live Application on Streamlit Cloud!](#)** *(Replace this with your actual Streamlit link!)*

---

## 🚀 The Challenge
Census data is collected at a massive scale, but populations change rapidly. Governments need better ways to understand shifting demographics and prioritize where essential services (like schools, healthcare, and digital connectivity) will be most needed. 

This project solves that by transforming raw demographic data (India Census 2011) into actionable, visual insights.

## ✨ Features
- **Demographic Clustering Engine:** Uses K-Means machine learning to group districts based on similarities in literacy, employment, youth population, and digital access.
- **Infrastructure Gap Detection:** Calculates priority "Need Scores" to detect underserved regions across three main pillars:
  - 📚 **Education:** Identifies regions with high youth populations but low higher-education rates.
  - 🏥 **Sanitation & Health:** Flags districts lacking basic latrine and bathing facilities.
  - 💻 **Digital Connectivity:** Highlights areas with the lowest internet and computer penetration.
- **Targeted Search & Analytics:** 
  - **Search by Need:** Select a specific infrastructure need and immediately see the top underserved districts and states visualized on a bar chart.
  - **Search by District:** Drill down into granular metrics for any specific district in India.
- **Geospatial Mapping (Optional):** Pre-configured to support `.shp` shapefiles for mapping underserved regions across state lines.

## 🛠️ Tech Stack
- **Python 3**
- **Streamlit** (Web Application Framework)
- **Pandas & NumPy** (Data Processing & Engineering)
- **Scikit-Learn** (Clustering & Predictive Analytics)
- **Plotly** (Interactive Data Visualization)
- **GeoPandas** (Geospatial Analysis)

---

## 💻 How to Run Locally

If you want to run this engine on your own computer, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/census-insight-engine.git
   cd census-insight-engine
   ```

2. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Launch the Streamlit app:**
   ```bash
   python -m streamlit run app.py
   ```
   *(The dashboard will automatically open in your web browser at `localhost:8501`)*

## 📂 Project Structure
- `app.py`: The main Streamlit dashboard application and UI routing.
- `data_processor.py`: Handles data ingestion, cleaning, and feature engineering (calculating Need Scores).
- `insight_engine.py`: Contains the machine learning logic (K-Means) and ranking algorithms.
- `requirements.txt`: Project dependencies.
- `india-districts-census-2011.csv`: The core demographic dataset.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
