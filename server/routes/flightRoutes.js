const express = require('express');
const axios = require('axios');
const router = express.Router();

// Calculate departure time based on all factors
router.post('/calculate-departure-time', async (req, res) => {
  try {
    const {
      flightDepartureTime,
      departureLocation,
      destinationAirport,
      flightType,
      parkingNeeded = false,
      riskTolerance = 'Moderate'
    } = req.body;

    // Validate required fields
    if (!flightDepartureTime || !departureLocation || !destinationAirport || !flightType) {
      return res.status(400).json({ 
        error: 'Missing required fields: flightDepartureTime, departureLocation, destinationAirport, flightType' 
      });
    }

    // Get traffic estimate from Google Maps
    const trafficResponse = await axios.post(`http://localhost:${process.env.PORT || 3001}/api/traffic/estimate`, {
      origin: departureLocation,
      destination: destinationAirport.address
    });

    const travelTimeMinutes = Math.ceil(trafficResponse.data.duration / 60);

    // Calculate buffers
    const buffers = calculateBuffers(flightType, riskTolerance, parkingNeeded);
    
    // Calculate total time needed before flight
    const totalBufferMinutes = buffers.checkIn + buffers.security + buffers.boarding + buffers.parking;
    const totalTimeNeeded = travelTimeMinutes + totalBufferMinutes;

    // Calculate departure time
    const flightTime = new Date(`1970-01-01T${flightDepartureTime}:00`);
    const departureTime = new Date(flightTime.getTime() - (totalTimeNeeded * 60 * 1000));

    const result = {
      departureTime: formatTime(departureTime),
      flightDepartureTime,
      breakdown: {
        travel: `${travelTimeMinutes} mins`,
        checkIn: `${buffers.checkIn} mins`,
        security: `${buffers.security} mins`,
        boarding: `${buffers.boarding} mins`,
        parking: parkingNeeded ? `${buffers.parking} mins` : 'Not needed',
        total: `${totalTimeNeeded} mins`
      },
      route: trafficResponse.data.route
    };

    res.json(result);
  } catch (error) {
    console.error('Error calculating departure time:', error);
    res.status(500).json({ error: 'Failed to calculate departure time' });
  }
});

function calculateBuffers(flightType, riskTolerance, parkingNeeded) {
  const buffers = {
    checkIn: 30, // Default check-in time
    security: flightType === 'International' ? 120 : 60, // Security/immigration buffer
    boarding: 30, // Boarding cutoff buffer
    parking: parkingNeeded ? 15 : 0 // Parking/drop-off buffer
  };

  // Adjust based on risk tolerance
  const adjustment = getRiskAdjustment(riskTolerance);
  buffers.security += adjustment;

  return buffers;
}

function getRiskAdjustment(riskTolerance) {
  switch (riskTolerance) {
    case 'Relaxed': return 15;
    case 'Just-in-Time': return -15;
    case 'Moderate':
    default: return 0;
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

module.exports = router;
