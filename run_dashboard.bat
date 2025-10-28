@echo off
echo Starting Healis DSA Dashboard...
echo.
echo Make sure you have:
echo 1. Installed Python dependencies: pip install -r requirements.txt
echo 2. Configured your MongoDB URI in .env file
echo.
pause
echo.
echo Starting Streamlit dashboard...
streamlit run app.py
pause
