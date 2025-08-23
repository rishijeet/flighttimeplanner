import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

const Header = () => {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <FlightTakeoffIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Flight Time Planner
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Calculate your ideal departure time
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
