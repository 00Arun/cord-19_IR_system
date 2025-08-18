@echo off
REM CORD-19 IR System Startup Script for Windows
echo 🚀 Starting CORD-19 Information Retrieval System...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Start backend
echo 🐍 Starting Python Flask backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Start backend in new window
echo 🚀 Starting backend server on http://localhost:5002...
start "CORD-19 Backend" cmd /k "python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo ✅ Backend is starting on http://localhost:5002

REM Start frontend
echo ⚛️ Starting Next.js frontend...
cd ..\frontend

REM Install Node.js dependencies if not already installed
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Start frontend in new window
echo 🚀 Starting frontend server on http://localhost:3000...
start "CORD-19 Frontend" cmd /k "npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 CORD-19 IR System is now starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5002
echo 📊 API Health: http://localhost:5002/api/health
echo.
echo Both services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
