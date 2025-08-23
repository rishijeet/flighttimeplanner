import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Divider
} from '@mui/material';

const UserPreferences = ({ open, onClose, onSave, currentPreferences }) => {
  const [preferences, setPreferences] = useState({
    defaultRiskTolerance: 'Moderate',
    defaultParkingNeeded: false,
    defaultCheckInTime: 30,
    defaultSecurityBufferDomestic: 60,
    defaultSecurityBufferInternational: 120,
    defaultBoardingBuffer: 30,
    defaultParkingBuffer: 15,
    ...currentPreferences
  });

  useEffect(() => {
    if (currentPreferences) {
      setPreferences(prev => ({ ...prev, ...currentPreferences }));
    }
  }, [currentPreferences]);

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const handleReset = () => {
    setPreferences({
      defaultRiskTolerance: 'Moderate',
      defaultParkingNeeded: false,
      defaultCheckInTime: 30,
      defaultSecurityBufferDomestic: 60,
      defaultSecurityBufferInternational: 120,
      defaultBoardingBuffer: 30,
      defaultParkingBuffer: 15
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Preferences</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Default Settings
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Default Risk Tolerance</InputLabel>
              <Select
                value={preferences.defaultRiskTolerance}
                label="Default Risk Tolerance"
                onChange={(e) => handleChange('defaultRiskTolerance', e.target.value)}
              >
                <MenuItem value="Relaxed">Relaxed (+15 mins)</MenuItem>
                <MenuItem value="Moderate">Moderate</MenuItem>
                <MenuItem value="Just-in-Time">Just-in-Time (-15 mins)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.defaultParkingNeeded}
                  onChange={(e) => handleChange('defaultParkingNeeded', e.target.checked)}
                />
              }
              label="Default Parking Needed"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Buffer Times (minutes)
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Check-in Time"
              type="number"
              value={preferences.defaultCheckInTime}
              onChange={(e) => handleChange('defaultCheckInTime', parseInt(e.target.value))}
              inputProps={{ min: 15, max: 120 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Boarding Buffer"
              type="number"
              value={preferences.defaultBoardingBuffer}
              onChange={(e) => handleChange('defaultBoardingBuffer', parseInt(e.target.value))}
              inputProps={{ min: 15, max: 60 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Security Buffer (Domestic)"
              type="number"
              value={preferences.defaultSecurityBufferDomestic}
              onChange={(e) => handleChange('defaultSecurityBufferDomestic', parseInt(e.target.value))}
              inputProps={{ min: 30, max: 180 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Security Buffer (International)"
              type="number"
              value={preferences.defaultSecurityBufferInternational}
              onChange={(e) => handleChange('defaultSecurityBufferInternational', parseInt(e.target.value))}
              inputProps={{ min: 60, max: 240 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Parking Buffer"
              type="number"
              value={preferences.defaultParkingBuffer}
              onChange={(e) => handleChange('defaultParkingBuffer', parseInt(e.target.value))}
              inputProps={{ min: 5, max: 30 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset to Defaults
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPreferences;
