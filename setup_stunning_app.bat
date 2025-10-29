@echo off
echo ========================================
echo   🚀 HEAL Platform - Stunning Web App
echo   Setting up Next.js + React Application
echo ========================================
echo.

echo Step 1: Installing Node.js dependencies...
cd web_app
call npm install

echo.
echo Step 2: Installing additional UI packages...
call npm install @tailwindcss/forms @tailwindcss/typography

echo.
echo Step 3: Building the application...
call npm run build

echo.
echo ========================================
echo   ✅ Setup Complete!
echo ========================================
echo.
echo To run the stunning HEAL Platform:
echo   1. cd web_app
echo   2. npm run dev
echo   3. Open http://localhost:3000
echo.
echo Features:
echo   ✅ Beautiful animated UI with Framer Motion
echo   ✅ Step-by-step algorithm visualizations  
echo   ✅ Real-time code execution highlighting
echo   ✅ Interactive performance metrics
echo   ✅ Live MongoDB integration logs
echo   ✅ Self-explanatory interface
echo   ✅ Perfect for judge presentations!
echo.
pause
