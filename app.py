"""
Main Application Entry Point for Healis DSA System
"""
import streamlit as st
import sys
import os
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Import dashboard
from visualizations.dashboard import HealthcareDashboard

def main():
    """Main application entry point"""
    try:
        # Initialize and run dashboard
        dashboard = HealthcareDashboard()
        dashboard.run()
        
    except Exception as e:
        st.error(f"Application Error: {e}")
        st.info("Please check your MongoDB connection and configuration.")

if __name__ == "__main__":
    main()
