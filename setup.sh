#!/bin/bash

echo "🚀 Setting up Flight Time Planner..."

# Install server dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Install root dependencies (for concurrently)
echo "📦 Installing root dependencies..."
npm install

# Create .env files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
fi

if [ ! -f client/.env ]; then
    echo "📝 Creating frontend .env file..."
    echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here" > client/.env
    echo "REACT_APP_API_URL=http://localhost:3001" >> client/.env
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get a Google Maps API key from https://console.cloud.google.com/"
echo "2. Enable Maps JavaScript API and Directions API"
echo "3. Add your API key to both .env files"
echo "4. Run './start.sh' to start the application"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🚀 Starting the application now..."
echo ""

# Start both servers
echo "Starting backend server..."
cd server
npm start &
SERVER_PID=$!
cd ..

echo "Starting frontend server..."
cd client
npm start &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting up!"
echo "📝 Server PIDs: Backend=$SERVER_PID, Frontend=$CLIENT_PID"
echo "🛑 To stop servers, press Ctrl+C or run: kill $SERVER_PID $CLIENT_PID"
