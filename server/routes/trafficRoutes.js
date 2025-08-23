const express = require('express');
const axios = require('axios');
const router = express.Router();

// Test endpoint to verify Google Maps API
router.get('/test', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json`;
    const params = {
      origin: 'New York, NY',
      destination: 'Boston, MA',
      key: apiKey
    };

    const response = await axios.get(url, { params });
    res.json({ status: 'API working', data: response.data });
  } catch (error) {
    console.error('API Test Error:', error.message);
    res.status(500).json({ error: 'API test failed', details: error.message });
  }
});

// Get traffic estimate using Google Maps Directions API
router.post('/estimate', async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json`;
    const params = {
      origin: typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
      destination: typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`,
      departure_time: Math.floor(Date.now() / 1000).toString(),
      traffic_model: 'best_guess',
      mode: 'driving',
      key: apiKey
    };

    const response = await axios.get(url, { params });

    if (response.data.status !== 'OK') {
      console.error('Google Maps API Error:', response.data);
      // If API is not enabled, return a fallback estimate
      if (response.data.status === 'REQUEST_DENIED') {
        return res.json({
          duration: 3600, // 1 hour fallback
          durationText: '1 hour (estimated)',
          distance: 50000, // 50km fallback
          distanceText: '50 km (estimated)',
          route: {
            startAddress: 'Your Location',
            endAddress: 'Airport',
            steps: [{ instruction: 'Drive to airport', distance: '50 km', duration: '1 hour' }]
          },
          fallback: true,
          message: 'Using estimated travel time. Please enable Google Maps Directions API for accurate results.'
        });
      }
      throw new Error(`Google Maps API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    const result = {
      duration: leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value,
      durationText: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
      distance: leg.distance.value,
      distanceText: leg.distance.text,
      route: {
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance.text,
          duration: step.duration.text
        }))
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error getting traffic estimate:', error.message);
    console.error('Request details:', { origin, destination });
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to get traffic estimate', details: error.message });
  }
});

// Get real-time traffic conditions for a route
router.post('/conditions', async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    // Get multiple departure times to compare traffic
    const now = new Date();
    const times = [
      Math.floor(now.getTime() / 1000), // Now
      Math.floor((now.getTime() + 30 * 60 * 1000) / 1000), // +30 mins
      Math.floor((now.getTime() + 60 * 60 * 1000) / 1000)  // +60 mins
    ];

    const requests = times.map(time => {
      const url = `https://maps.googleapis.com/maps/api/directions/json`;
      const params = {
        origin: typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
        destination: typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`,
        departure_time: time,
        traffic_model: 'best_guess',
        key: apiKey
      };
      return axios.get(url, { params });
    });

    const responses = await Promise.all(requests);
    
    const conditions = responses.map((response, index) => {
      if (response.data.status === 'OK') {
        const leg = response.data.routes[0].legs[0];
        return {
          departureTime: new Date(times[index] * 1000).toLocaleTimeString(),
          duration: leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value,
          durationText: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ conditions });
  } catch (error) {
    console.error('Error getting traffic conditions:', error);
    res.status(500).json({ error: 'Failed to get traffic conditions' });
  }
});

module.exports = router;
