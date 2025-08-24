# Flight Time Planner

A comprehensive web application that calculates the ideal time to leave for the airport based on real-time traffic, flight type, and user preferences.

<img width="1080" height="2400" alt="image" src="https://github.com/user-attachments/assets/d9b2dc1d-8916-471a-a9a3-812ba414aba3" />


## Features

- **Real-time Traffic Analysis**: Uses Google Maps API for accurate travel time estimates
- **Smart Buffer Calculations**: Accounts for check-in, security, boarding, and parking times
- **Flight Type Support**: Different buffers for domestic vs international flights
- **Risk Tolerance Settings**: Adjustable timing based on user preference (Relaxed/Moderate/Just-in-Time)
- **Interactive Map**: Visual route display with traffic conditions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory with:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   PORT=5000
   ```

3. **Get Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API and Directions API
   - Create an API key and add it to your `.env` file

4. **Run the Application**:
   ```bash
   npm run dev
   ```

5. **Access the App**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

1. Enter your flight departure time
2. Set your departure location (GPS or manual entry)
3. Select destination airport from the list
4. Choose flight type (Domestic/International)
5. Configure optional settings (parking, risk tolerance)
6. Get your personalized departure time with detailed breakdown

## API Endpoints

- `POST /api/calculate-departure-time` - Calculate optimal departure time
- `GET /api/airports` - Get list of airports
- `POST /api/traffic-estimate` - Get real-time traffic data

## Technology Stack

- **Frontend**: React, Material-UI, Google Maps JavaScript API
- **Backend**: Node.js, Express
- **APIs**: Google Maps Directions API, Places API
