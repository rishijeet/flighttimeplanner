import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  Surface,
  useTheme,
  ActivityIndicator,
  Chip,
  Switch,
  Menu,
  Divider,
  IconButton,
  Text,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const FlightTimePlanner = () => {
  const theme = useTheme();
  
  // Form data matching web app structure
  const [formData, setFormData] = useState({
    flightDepartureTime: '',
    departureLocation: '',
    destinationAirport: null,
    flightType: 'Domestic',
    parkingNeeded: false,
    riskTolerance: 'Moderate',
    userLocation: null
  });

  const [airports, setAirports] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  
  // Menu states
  const [flightTypeMenuVisible, setFlightTypeMenuVisible] = useState(false);
  const [riskToleranceMenuVisible, setRiskToleranceMenuVisible] = useState(false);
  const [airportSearchText, setAirportSearchText] = useState('');
  const [filteredAirports, setFilteredAirports] = useState([]);

  useEffect(() => {
    fetchAirports();
    getUserLocation();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('flightPlannerPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setUserPreferences(preferences);
        setFormData(prev => ({
          ...prev,
          riskTolerance: preferences.defaultRiskTolerance || 'Moderate',
          parkingNeeded: preferences.defaultParkingNeeded || false
        }));
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = async (preferences) => {
    try {
      setUserPreferences(preferences);
      await AsyncStorage.setItem('flightPlannerPreferences', JSON.stringify(preferences));
      setFormData(prev => ({
        ...prev,
        riskTolerance: preferences.defaultRiskTolerance || 'Moderate',
        parkingNeeded: preferences.defaultParkingNeeded || false
      }));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };

  const fetchAirports = async () => {
    try {
      // Use emulator localhost address
      const response = await axios.get('http://10.0.2.2:3001/api/airports');
      setAirports(response.data);
      setFilteredAirports(response.data);
    } catch (error) {
      console.error('Error fetching airports:', error);
    }
  };

  const getUserLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to set your current departure point.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Location permission is needed to use your current location.");
          return;
        }
      }
      
      // For demo purposes - in a real app, you would use the device's actual location
      // using react-native-geolocation-service or @react-native-community/geolocation
      setUserLocation({
        lat: 37.7749,
        lng: -122.4194,
        formattedAddress: 'San Francisco, CA, USA'  // Add a display name for the location
      });
    } catch (error) {
      console.log('Geolocation error:', error);
      Alert.alert("Location Error", "Unable to get your current location. Please enter your departure location manually.");
    }
  };

  const useCurrentLocation = () => {
    if (userLocation) {
      setFormData(prev => ({
        ...prev,
        departureLocation: userLocation.formattedAddress || 'Current Location',
        userLocation: userLocation  // Store the full location object for API calls
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const filterAirports = (text) => {
    setAirportSearchText(text);
    if (text.length > 0) {
      const filtered = airports.filter(airport =>
        airport.name.toLowerCase().includes(text.toLowerCase()) ||
        airport.code.toLowerCase().includes(text.toLowerCase()) ||
        airport.city.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAirports(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredAirports([]);
    }
  };

  const selectAirport = (airport) => {
    setFormData(prev => ({
      ...prev,
      destinationAirport: airport
    }));
    setAirportSearchText(`${airport.name} (${airport.code})`);
    setFilteredAirports([]);
  };

  const calculateDepartureTime = async () => {
    if (!formData.flightDepartureTime || !formData.departureLocation || !formData.destinationAirport) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use emulator localhost address
      const response = await axios.post('http://10.0.2.2:3001/api/flight/calculate-departure-time', formData);
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
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.title}>Flight Time Planner</Title>
      </Surface>

      {/* Flight Details Form */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Flight Details</Title>
          
          {/* Flight Departure Time */}
          <TextInput
            label="Flight Departure Time (24h format)"
            value={formData.flightDepartureTime}
            onChangeText={(text) => handleInputChange('flightDepartureTime', text)}
            placeholder="14:30"
            style={styles.input}
            mode="outlined"
          />

          {/* Departure Location */}
          <View style={styles.locationRow}>
            <TextInput
              label="Departure Location"
              value={formData.departureLocation || ''}
              onChangeText={(text) => handleInputChange('departureLocation', text)}
              placeholder="Enter address or use current location"
              style={[styles.input, styles.locationInput]}
              mode="outlined"
              right={
                <TextInput.Icon 
                  icon="crosshairs-gps" 
                  onPress={useCurrentLocation}
                  disabled={!userLocation}
                  color={userLocation ? theme.colors.primary : '#999'}
                />
              }
            />
          </View>

          {/* Airport Search */}
          <TextInput
            label="Destination Airport"
            value={airportSearchText}
            onChangeText={filterAirports}
            placeholder="Search airports..."
            style={styles.input}
            mode="outlined"
          />
          
          {/* Airport Results */}
          {filteredAirports.length > 0 && (
            <View style={styles.airportResults}>
              {filteredAirports.map((airport) => (
                <Button
                  key={airport.code}
                  mode="text"
                  onPress={() => selectAirport(airport)}
                  style={styles.airportItem}
                  contentStyle={styles.airportItemContent}
                >
                  <Text>{airport.name} ({airport.code}) - {airport.city}</Text>
                </Button>
              ))}
            </View>
          )}

          {/* Flight Type */}
          <Menu
            visible={flightTypeMenuVisible}
            onDismiss={() => setFlightTypeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFlightTypeMenuVisible(true)}
                style={styles.input}
              >
                Flight Type: {formData.flightType}
              </Button>
            }
          >
            <Menu.Item onPress={() => { handleInputChange('flightType', 'Domestic'); setFlightTypeMenuVisible(false); }} title="Domestic" />
            <Menu.Item onPress={() => { handleInputChange('flightType', 'International'); setFlightTypeMenuVisible(false); }} title="International" />
          </Menu>

          {/* Risk Tolerance */}
          <Menu
            visible={riskToleranceMenuVisible}
            onDismiss={() => setRiskToleranceMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setRiskToleranceMenuVisible(true)}
                style={styles.input}
              >
                Risk Tolerance: {formData.riskTolerance}
              </Button>
            }
          >
            <Menu.Item onPress={() => { handleInputChange('riskTolerance', 'Relaxed'); setRiskToleranceMenuVisible(false); }} title="Relaxed (+15 mins)" />
            <Menu.Item onPress={() => { handleInputChange('riskTolerance', 'Moderate'); setRiskToleranceMenuVisible(false); }} title="Moderate" />
            <Menu.Item onPress={() => { handleInputChange('riskTolerance', 'Just-in-Time'); setRiskToleranceMenuVisible(false); }} title="Just-in-Time (-15 mins)" />
          </Menu>

          {/* Parking Switch */}
          <View style={styles.switchRow}>
            <Text>Parking needed (+15 mins)</Text>
            <Switch
              value={formData.parkingNeeded}
              onValueChange={(value) => handleInputChange('parkingNeeded', value)}
            />
          </View>

          {/* Calculate Button */}
          <Button
            mode="contained"
            onPress={calculateDepartureTime}
            disabled={loading}
            style={styles.calculateButton}
            icon={loading ? undefined : "calculator"}
          >
            {loading ? 'Calculating...' : 'Calculate Departure Time'}
          </Button>
          
          {loading && <ActivityIndicator style={styles.loader} />}
        </Card.Content>
      </Card>

      {/* Error Display */}
      {error && (
        <Card style={[styles.card, styles.errorCard]}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Your Travel Plan</Title>
            
            {/* Main Result */}
            <Surface style={styles.resultSurface}>
              <Title style={styles.resultTitle}>Leave by: {result.departureTime}</Title>
              <Paragraph style={styles.resultSubtitle}>Flight departs: {result.flightDepartureTime}</Paragraph>
            </Surface>

            {/* Time Breakdown */}
            <Title style={styles.breakdownTitle}>Time Breakdown:</Title>
            <View style={styles.chipContainer}>
              <Chip style={styles.chip} textStyle={styles.chipText}>Travel: {result.breakdown.travel}</Chip>
              <Chip style={styles.chip} textStyle={styles.chipText}>Check-in: {result.breakdown.checkIn}</Chip>
              <Chip style={styles.chip} textStyle={styles.chipText}>Security: {result.breakdown.security}</Chip>
              <Chip style={styles.chip} textStyle={styles.chipText}>Boarding: {result.breakdown.boarding}</Chip>
              {formData.parkingNeeded && (
                <Chip style={styles.chip} textStyle={styles.chipText}>Parking: {result.breakdown.parking}</Chip>
              )}
            </View>

            <Paragraph style={styles.totalBuffer}>
              Total buffer time: {result.breakdown.total}
            </Paragraph>

            <Button
              mode="outlined"
              onPress={recalculate}
              disabled={loading}
              style={styles.recalculateButton}
            >
              Recalculate with Current Traffic
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  input: {
    marginVertical: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInput: {
    flex: 1,
  },
  airportResults: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 2,
  },
  airportItem: {
    justifyContent: 'flex-start',
  },
  airportItemContent: {
    justifyContent: 'flex-start',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  calculateButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  loader: {
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
  resultSurface: {
    padding: 20,
    marginVertical: 16,
    backgroundColor: '#1976d2',
    borderRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
  resultSubtitle: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  breakdownTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  totalBuffer: {
    marginTop: 16,
    fontStyle: 'italic',
  },
  recalculateButton: {
    marginTop: 16,
  },
});

export default FlightTimePlanner;
