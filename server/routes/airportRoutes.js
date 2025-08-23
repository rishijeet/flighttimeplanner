const express = require('express');
const router = express.Router();

// Major airports database
const airports = [
  // US Major Airports
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', address: 'JFK Airport, Queens, NY 11430, USA' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', address: 'LAX Airport, Los Angeles, CA 90045, USA' },
  { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'USA', address: 'ORD Airport, Chicago, IL 60666, USA' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', address: 'ATL Airport, Atlanta, GA 30320, USA' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', address: 'DFW Airport, Dallas, TX 75261, USA' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'USA', address: 'DEN Airport, Denver, CO 80249, USA' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', address: 'SFO Airport, San Francisco, CA 94128, USA' },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', address: 'SEA Airport, Seattle, WA 98158, USA' },
  { code: 'LAS', name: 'McCarran International Airport', city: 'Las Vegas', country: 'USA', address: 'LAS Airport, Las Vegas, NV 89119, USA' },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'USA', address: 'MCO Airport, Orlando, FL 32827, USA' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', address: 'MIA Airport, Miami, FL 33126, USA' },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'USA', address: 'BOS Airport, Boston, MA 02128, USA' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'USA', address: 'PHX Airport, Phoenix, AZ 85034, USA' },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'USA', address: 'IAH Airport, Houston, TX 77032, USA' },
  
  // International Major Airports
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', address: 'Heathrow Airport, London TW6, UK' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', address: 'CDG Airport, 95700 Roissy-en-France, France' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', address: 'Frankfurt Airport, 60547 Frankfurt am Main, Germany' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', address: 'Schiphol Airport, 1118 CP Schiphol, Netherlands' },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', address: 'Narita Airport, Chiba 282-0004, Japan' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', address: 'Incheon Airport, Jung-gu, Incheon, South Korea' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', address: 'Changi Airport, Singapore 819663' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', address: 'Hong Kong International Airport, Hong Kong' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', address: 'Dubai International Airport, Dubai, UAE' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', address: 'Toronto Pearson Airport, Mississauga, ON L5P 1B2, Canada' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', address: 'Vancouver Airport, Richmond, BC V7B 0A1, Canada' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', address: 'Sydney Airport, Mascot NSW 2020, Australia' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', address: 'Melbourne Airport, Tullamarine VIC 3045, Australia' },
  
  // Indian Airports
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', address: 'IGI Airport, New Delhi, Delhi 110037, India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', address: 'Mumbai Airport, Andheri East, Mumbai, Maharashtra 400099, India' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', address: 'Bangalore Airport, Devanahalli, Karnataka 560300, India' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', address: 'Chennai Airport, Meenambakkam, Chennai, Tamil Nadu 600027, India' },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', address: 'Hyderabad Airport, Shamshabad, Telangana 501218, India' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', address: 'Kolkata Airport, Dum Dum, West Bengal 700052, India' },
  { code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India', address: 'Goa Airport, Dabolim, Goa 403801, India' },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', address: 'Cochin Airport, Nedumbassery, Kerala 683111, India' }
];

// Get all airports
router.get('/', (req, res) => {
  try {
    const { search, country } = req.query;
    
    let filteredAirports = airports;
    
    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredAirports = filteredAirports.filter(airport => 
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.code.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by country
    if (country) {
      filteredAirports = filteredAirports.filter(airport => 
        airport.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    res.json(filteredAirports);
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ error: 'Failed to fetch airports' });
  }
});

// Get airport by code
router.get('/:code', (req, res) => {
  try {
    const { code } = req.params;
    const airport = airports.find(a => a.code.toLowerCase() === code.toLowerCase());
    
    if (!airport) {
      return res.status(404).json({ error: 'Airport not found' });
    }
    
    res.json(airport);
  } catch (error) {
    console.error('Error fetching airport:', error);
    res.status(500).json({ error: 'Failed to fetch airport' });
  }
});

// Get airports by country
router.get('/country/:country', (req, res) => {
  try {
    const { country } = req.params;
    const countryAirports = airports.filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase()
    );
    
    res.json(countryAirports);
  } catch (error) {
    console.error('Error fetching airports by country:', error);
    res.status(500).json({ error: 'Failed to fetch airports by country' });
  }
});

module.exports = router;
