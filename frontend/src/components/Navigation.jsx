import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Link as LinkIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const Navigation = ({ currentPage, onPageChange }) => {
  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Container maxWidth="lg">
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<LinkIcon />}
              onClick={() => onPageChange('shortener')}
              variant={currentPage === 'shortener' ? 'outlined' : 'text'}
            >
              Shorten URLs
            </Button>
            <Button
              color="inherit"
              startIcon={<AnalyticsIcon />}
              onClick={() => onPageChange('statistics')}
              variant={currentPage === 'statistics' ? 'outlined' : 'text'}
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;