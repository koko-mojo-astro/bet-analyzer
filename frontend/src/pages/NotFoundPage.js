import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function NotFoundPage() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <ErrorOutlineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h3" component="h1" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        component={RouterLink}
        to="/"
        sx={{ mt: 2 }}
      >
        Go to Home Page
      </Button>
    </Box>
  );
}

export default NotFoundPage;