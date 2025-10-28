@echo off
echo ========================================
echo    🧠 HEAL Platform Launcher 🧠
echo    Next-Generation DSA Visualization
echo ========================================
echo.
echo Prerequisites Check:
echo 1. Python 3.8+ installed ✓
echo 2. Dependencies installed: pip install -r requirements.txt
echo 3. MongoDB URIs configured in .env file
echo.
echo Your MongoDB Configuration:
echo - Healis DB: mongodb://localhost:27017/healis
echo - Admin DB:  mongodb://localhost:27017/healis-admin
echo.
pause
echo.
echo 🚀 Launching HEAL Platform...
echo.
streamlit run heal_app.py --server.port 8502
pause
