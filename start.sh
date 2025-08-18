#!/bin/bash

# CORD-19 IR System Startup Script
echo "🚀 Starting CORD-19 Information Retrieval System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🐍 Starting Python Flask backend..."
cd backend

# Install Python dependencies if not already installed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Start backend in background
echo "🚀 Starting backend server on http://localhost:5002..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:5002/api/health > /dev/null; then
    echo "❌ Backend failed to start. Check the logs above."
    exit 1
fi

echo "✅ Backend is running on http://localhost:5002"

# Start frontend
echo "⚛️  Starting Next.js frontend..."
cd ../frontend

# Install Node.js dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting frontend server on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo "✅ Frontend is running on http://localhost:3000"
echo ""
echo "🎉 CORD-19 IR System is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5002"
echo "📊 API Health: http://localhost:5002/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
