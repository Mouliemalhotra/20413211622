import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import apiService from '../services/api';

const UrlShortenerForm = () => {
  const [urls, setUrls] = useState([
    { id: 1, url: '', validity: 30, shortcode: '', loading: false, result: null, error: null }
  ]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, {
        id: Date.now(),
        url: '',
        validity: 30,
        shortcode: '',
        loading: false,
        result: null,
        error: null
      }]);
    }
  };

  const removeUrlField = (id) => {
    if (urls.length > 1) {
      setUrls(urls.filter(url => url.id !== id));
    }
  };

  const updateUrl = (id, field, value) => {
    setUrls(urls.map(url => 
      url.id === id ? { ...url, [field]: value, error: null } : url
    ));
  };

  const validateUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const validateShortcode = (shortcode) => {
    if (!shortcode) return true; // Optional
    return /^[a-zA-Z0-9]{3,10}$/.test(shortcode);
  };

  const shortenUrl = async (urlData) => {
    const index = urls.findIndex(url => url.id === urlData.id);
    
    // Client-side validation
    if (!urlData.url.trim()) {
      setUrls(urls.map(url => 
        url.id === urlData.id 
          ? { ...url, error: 'URL is required' }
          : url
      ));
      return;
    }

    if (!validateUrl(urlData.url)) {
      setUrls(urls.map(url => 
        url.id === urlData.id 
          ? { ...url, error: 'Please enter a valid URL' }
          : url
      ));
      return;
    }

    if (urlData.validity && (!Number.isInteger(Number(urlData.validity)) || urlData.validity < 1 || urlData.validity > 525600)) {
      setUrls(urls.map(url => 
        url.id === urlData.id 
          ? { ...url, error: 'Validity must be between 1 and 525600 minutes' }
          : url
      ));
      return;
    }

    if (urlData.shortcode && !validateShortcode(urlData.shortcode)) {
      setUrls(urls.map(url => 
        url.id === urlData.id 
          ? { ...url, error: 'Shortcode must be 3-10 alphanumeric characters' }
          : url
      ));
      return;
    }

    // Start loading
    setUrls(urls.map(url => 
      url.id === urlData.id 
        ? { ...url, loading: true, error: null }
        : url
    ));

    try {
      const result = await apiService.createShortUrl({
        url: urlData.url,
        validity: parseInt(urlData.validity) || 30,
        shortcode: urlData.shortcode || undefined
      });

      setUrls(urls.map(url => 
        url.id === urlData.id 
          ? { ...url, loading: false, result }
          : url
      ));
    } catch (error) {
      setUrls(urls.map(url => 
        url.id === urlData.id 
          ? { ...url, loading: false, error: error.message }
          : url
      ));
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shortenAllUrls = async () => {
    const validUrls = urls.filter(url => url.url.trim() && !url.result);
    for (const url of validUrls) {
      await shortenUrl(url);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        URL Shortener
      </Typography>

      {urls.map((urlData, index) => (
        <Card key={urlData.id} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                URL #{index + 1}
              </Typography>
              <Box>
                {urls.length > 1 && (
                  <IconButton 
                    onClick={() => removeUrlField(urlData.id)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
                {urls.length < 5 && index === urls.length - 1 && (
                  <IconButton 
                    onClick={addUrlField}
                    color="primary"
                    size="small"
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Long URL"
                  placeholder="https://example.com/very-long-url"
                  value={urlData.url}
                  onChange={(e) => updateUrl(urlData.id, 'url', e.target.value)}
                  error={!!urlData.error && urlData.error.includes('URL')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Validity (minutes)"
                  type="number"
                  placeholder="30"
                  value={urlData.validity}
                  onChange={(e) => updateUrl(urlData.id, 'validity', e.target.value)}
                  error={!!urlData.error && urlData.error.includes('Validity')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScheduleIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custom Shortcode (optional)"
                  placeholder="mycode"
                  value={urlData.shortcode}
                  onChange={(e) => updateUrl(urlData.id, 'shortcode', e.target.value)}
                  error={!!urlData.error && urlData.error.includes('Shortcode')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => shortenUrl(urlData)}
                  disabled={urlData.loading || !urlData.url.trim()}
                  startIcon={urlData.loading ? <CircularProgress size={20} /> : <LinkIcon />}
                  sx={{ py: 1.5 }}
                >
                  {urlData.loading ? 'Shortening...' : 'Shorten URL'}
                </Button>
              </Grid>
            </Grid>

            {urlData.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {urlData.error}
              </Alert>
            )}

            <Collapse in={!!urlData.result}>
              {urlData.result && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity="success" sx={{ mb: 2 }}>
                    URL shortened successfully!
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Short URL"
                        value={urlData.result.shortLink}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => copyToClipboard(urlData.result.shortLink, index)}
                                edge="end"
                              >
                                {copiedIndex === index ? <CheckIcon color="success" /> : <CopyIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Expires: ${new Date(urlData.result.expiry).toLocaleString()}`}
                          color="info"
                          size="small"
                        />
                        <Chip
                          label={`Valid for: ${urlData.validity} minutes`}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {urls.length > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={shortenAllUrls}
            disabled={urls.every(url => !url.url.trim() || url.result)}
          >
            Shorten All URLs
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UrlShortenerForm;