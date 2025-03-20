import React from 'react';
import { Typography, Paper, Box, Button, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function HomePage() {
  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Bet Analyser
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your intelligent football betting analysis tool
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/analysis"
          startIcon={<AssessmentIcon />}
          sx={{ mt: 2 }}
        >
          Start Analysis
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SportsSoccerIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Historical Data
              </Typography>
            </Box>
            <Typography paragraph>
              Analyze betting patterns using historical match data from top European leagues including
              English Premier League, Spanish La Liga, Italian Serie A, and French Ligue 1.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Bet Analysis
              </Typography>
            </Box>
            <Typography paragraph>
              Input your current betting odds and get detailed analysis on historical success rates for
              Over/Under, Odd/Even, and Both Teams To Score (BTTS) markets.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Smart Insights
              </Typography>
            </Box>
            <Typography paragraph>
              Get data-driven insights to make more informed betting decisions. Our system analyzes
              similar historical matches to predict the likelihood of different outcomes.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to analyze your bets?
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/analysis"
          sx={{ mt: 2 }}
        >
          Go to Analysis Tool
        </Button>
      </Box>
    </Box>
  );
}

export default HomePage;