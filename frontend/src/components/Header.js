import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <AssessmentIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bet Analyser
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/analysis">
            Analysis
          </Button>
          <Button color="inherit" component={RouterLink} to="/goal-prediction">
            Goal Prediction
          </Button>
          <Button color="inherit" component={RouterLink} to="/upload">
            Upload Data
          </Button>
          <Button color="inherit" component={RouterLink} to="/admin">
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;