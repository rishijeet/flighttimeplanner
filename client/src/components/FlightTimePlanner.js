import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  IconButton
} from '@mui/material';
import { AccessTime, FlightTakeoff, LocationOn, Calculate, Settings } from '@mui/icons-material';
import axios from 'axios';
import MapWidget from './MapWidget';
import UserPreferences from './UserPreferences';

const FlightTimePlanner = () => {
  const [formData, setFormData] = useState({
    flightDepartureTime: '',
    departureLocation: '',
    destinationAirport: null,
    flightType: 'Domestic',
    parkingNeeded: false,
    riskTolerance: 'Moderate'
  });

  const [airports, setAirports] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState({});

  useEffect(() => {
    fetchAirports();
    getUserLocation();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = () => {
    const saved = localStorage.getItem('flightPlannerPreferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      setUserPreferences(preferences);
      setFormData(prev => ({
        ...prev,
        riskTolerance: preferences.defaultRiskTolerance || 'Moderate',
        parkingNeeded: preferences.defaultParkingNeeded || false
      }));
    }
  };

  const saveUserPreferences = (preferences) => {
    setUserPreferences(preferences);
    localStorage.setItem('flightPlannerPreferences', JSON.stringify(preferences));
    setFormData(prev => ({
      ...prev,
      riskTolerance: preferences.defaultRiskTolerance || 'Moderate',
      parkingNeeded: preferences.defaultParkingNeeded || false
    }));
  };

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/airports');
      setAirports(response.data);
    } catch (error) {
      console.error('Error fetching airports:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const useCurrentLocation = () => {
    if (userLocation) {
      setFormData(prev => ({
        ...prev,
        departureLocation: userLocation
      }));
    }
  };

  const calculateDepartureTime = async () => {
    if (!formData.flightDepartureTime || !formData.departureLocation || !formData.destinationAirport) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/flight/calculate-departure-time', formData);
      setResult(response.data);
      
      // Show warning if using fallback data
      if (response.data.route?.fallback) {
        setError(`⚠️ ${response.data.route.message || 'Using estimated travel time. For accurate results, please enable Google Maps Directions API.'}`);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to calculate departure time');
    } finally {
      setLoading(false);
    }
  };

  const recalculate = () => {
    if (result) {
      calculateDepartureTime();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" align="center" sx={{ flexGrow: 1 }}>
          Flight Time Planner
        </Typography>
        <IconButton
          onClick={() => setPreferencesOpen(true)}
          color="primary"
          size="large"
        >
          <Settings />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FlightTakeoff sx={{ mr: 1 }} />
              Flight Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Flight Departure Time"
                  type="time"
                  value={formData.flightDepartureTime}
                  onChange={(e) => handleInputChange('flightDepartureTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    label="Departure Location"
                    value={typeof formData.departureLocation === 'string' ? formData.departureLocation : 'Current Location'}
                    onChange={(e) => handleInputChange('departureLocation', e.target.value)}
                    placeholder="Enter address or use current location"
                    required
                  />
                  <Button
                    variant="outlined"
                    onClick={useCurrentLocation}
                    disabled={!userLocation}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <LocationOn />
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={airports}
                  getOptionLabel={(option) => `${option.name} (${option.code}) - ${option.city}`}
                  value={formData.destinationAirport}
                  onChange={(event, newValue) => handleInputChange('destinationAirport', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Destination Airport" required />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">
                          {option.name} ({option.code})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.city}, {option.country}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Flight Type</InputLabel>
                  <Select
                    value={formData.flightType}
                    label="Flight Type"
                    onChange={(e) => handleInputChange('flightType', e.target.value)}
                  >
                    <MenuItem value="Domestic">Domestic</MenuItem>
                    <MenuItem value="International">International</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Risk Tolerance</InputLabel>
                  <Select
                    value={formData.riskTolerance}
                    label="Risk Tolerance"
                    onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                  >
                    <MenuItem value="Relaxed">Relaxed (+15 mins)</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="Just-in-Time">Just-in-Time (-15 mins)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.parkingNeeded}
                      onChange={(e) => handleInputChange('parkingNeeded', e.target.checked)}
                    />
                  }
                  label="Parking needed (+15 mins)"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={calculateDepartureTime}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Calculate />}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Calculating...' : 'Calculate Departure Time'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <>
              <MapWidget
                origin={formData.departureLocation}
                destination={formData.destinationAirport}
                route={result.route}
              />
              
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ mr: 1 }} />
                  Your Travel Plan
                </Typography>

                <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h4" align="center">
                      Leave by: {result.departureTime}
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ opacity: 0.9 }}>
                      Flight departs: {result.flightDepartureTime}
                    </Typography>
                  </CardContent>
                </Card>

                <Typography variant="h6" gutterBottom>
                  Time Breakdown:
                </Typography>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Chip
                      label={`Travel: ${result.breakdown.travel}`}
                      color="primary"
                      variant="outlined"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Chip
                      label={`Check-in: ${result.breakdown.checkIn}`}
                      color="secondary"
                      variant="outlined"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Chip
                      label={`Security: ${result.breakdown.security}`}
                      color="warning"
                      variant="outlined"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Chip
                      label={`Boarding: ${result.breakdown.boarding}`}
                      color="info"
                      variant="outlined"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  {formData.parkingNeeded && (
                    <Grid item xs={12}>
                      <Chip
                        label={`Parking: ${result.breakdown.parking}`}
                        color="success"
                        variant="outlined"
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total buffer time: {result.breakdown.total}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={recalculate}
                    disabled={loading}
                    sx={{ mt: 1 }}
                  >
                    Recalculate with Current Traffic
                  </Button>
                </Box>
              </Paper>
            </>
          )}
        </Grid>
      </Grid>

      <UserPreferences
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        onSave={saveUserPreferences}
        currentPreferences={userPreferences}
      />
    </Box>
  );
};

export default FlightTimePlanner;
