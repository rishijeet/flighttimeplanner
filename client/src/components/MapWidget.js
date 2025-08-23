import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MapWidget = ({ origin, destination, route }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (window.google && origin && destination) {
      initializeMap();
    }
  }, [origin, destination, route]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      center: { lat: 37.7749, lng: -122.4194 }, // Default to SF
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    if (origin && destination) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#1976d2',
          strokeWeight: 4,
        },
      });

      directionsRenderer.setMap(map);

      const request = {
        origin: typeof origin === 'string' ? origin : new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: typeof destination === 'string' ? destination : destination.address,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
        },
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
      });
    }
  };

  // Load Google Maps script if not already loaded
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (origin && destination) {
          initializeMap();
        }
      };
      document.head.appendChild(script);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Google Maps API key not configured. Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Route Map
      </Typography>
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: 300,
          borderRadius: 1,
          bgcolor: 'grey.100',
        }}
      />
      {route && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Route: {route.startAddress} → {route.endAddress}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MapWidget;
