@echo off
echo ========================================
echo   🧪 HEAL Platform - Environment Test
echo ========================================
echo.
echo Step 1: Testing Python environment...
python test_imports.py
echo.
echo Step 2: Testing Streamlit integration...
echo Starting simple test app...
echo Access at: http://localhost:8504
echo.
echo Press Ctrl+C to stop and then run the main app
echo.
streamlit run simple_test.py --server.port 8504
pause
