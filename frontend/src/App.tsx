import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import Navigation from './components/Navigation';
import UrlShortenerForm from './components/UrlShortenerForm';
import UrlStatistics from './components/UrlStatistics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('shortener');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
        <Container maxWidth="lg">
          {currentPage === 'shortener' ? (
            <UrlShortenerForm />
          ) : (
            <UrlStatistics />
          )}
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;