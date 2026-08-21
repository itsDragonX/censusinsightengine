import pandas as pd
import os

DATA_PATH = "India-Census-2011-Analysis-master/india-districts-census-2011.csv"

def load_and_process_data():
    """Loads the census dataset and engineers features for analysis."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
    
    df = pd.read_csv(DATA_PATH)
    
    # Feature Engineering (creating normalized metrics)
    df['Literacy_Rate'] = (df['Literate'] / df['Population']) * 100
    df['Worker_Percentage'] = (df['Workers'] / df['Population']) * 100
    
    # Calculate an 'Education Needs' proxy. 
    # High population of young people + low higher education = need for education infrastructure.
    # We combine 0-29 age group.
    df['Youth_Percentage'] = (df['Age_Group_0_29'] / df['Population']) * 100
    df['Higher_Ed_Percentage'] = (df['Higher_Education'] / df['Population']) * 100
    # Simple metric: higher score means higher need for education infra
    df['Education_Need_Score'] = df['Youth_Percentage'] / (df['Higher_Ed_Percentage'] + 1) # +1 to avoid div by zero
    
    # Digital Infrastructure proxy
    # We use households with computers and internet vs total households
    df['Digital_Penetration'] = ((df['Households_with_Internet'] + df['Households_with_Computer']) / df['Households']) * 100
    
    # Healthcare/Sanitation Need proxy
    # High population without latrine/bathing facilities inside premises
    df['Sanitation_Need_Score'] = (df['Not_having_latrine_facility_within_the_premises_Alternative_source_Open_Households'] / df['Households']) * 100
    
    return df
