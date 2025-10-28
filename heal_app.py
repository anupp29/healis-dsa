"""
HEAL Platform - Main Application Entry Point
Next-Generation DSA Visualization Platform
"""
import streamlit as st
import sys
import os
from pathlib import Path
import logging

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    """Main application entry point"""
    try:
        # Import the modern dashboard
        from heal_platform.visualization.modern_dashboard import HEALDashboard
        
        # Initialize and run the HEAL dashboard
        dashboard = HEALDashboard()
        dashboard.run()
        
    except ImportError as e:
        st.error(f"Import Error: {e}")
        st.info("Please ensure all dependencies are installed: `pip install -r requirements.txt`")
    except Exception as e:
        st.error(f"Application Error: {e}")
        st.info("Please check your configuration and try again.")

if __name__ == "__main__":
    main()
