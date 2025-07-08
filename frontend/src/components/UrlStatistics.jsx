import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Mouse as MouseIcon,
  Language as LanguageIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import apiService from '../services/api';

const UrlStatistics = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUrl, setExpandedUrl] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllUrls();
      setUrls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUrlDetails = async (shortcode) => {
    try {
      const details = await apiService.getUrlStatistics(shortcode);
      setUrls(prevUrls => 
        prevUrls.map(url => 
          url.shortcode === shortcode 
            ? { ...url, detailedStats: details }
            : url
        )
      );
    } catch (err) {
      console.error('Error fetching URL details:', err);
    }
  };

  const handleAccordionChange = (shortcode) => (event, isExpanded) => {
    setExpandedUrl(isExpanded ? shortcode : null);
    if (isExpanded) {
      fetchUrlDetails(shortcode);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (url) => {
    if (!url.isActive) return 'error';
    if (new Date(url.expiry) < new Date()) return 'error';
    return 'success';
  };

  const getStatusLabel = (url) => {
    if (!url.isActive) return 'Inactive';
    if (new Date(url.expiry) < new Date()) return 'Expired';
    return 'Active';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchUrls}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          URL Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchUrls}
        >
          Refresh
        </Button>
      </Box>

      {urls.length === 0 ? (
        <Alert severity="info">
          No URLs found. Create some short URLs first!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LinkIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total URLs</Typography>
                </Box>
                <Typography variant="h3" color="primary">
                  {urls.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MouseIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Clicks</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {urls.reduce((total, url) => total + url.clickCount, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AnalyticsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Active URLs</Typography>
                </Box>
                <Typography variant="h3" color="info.main">
                  {urls.filter(url => url.isActive && new Date(url.expiry) > new Date()).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              URL Details
            </Typography>
            
            {urls.map((url) => (
              <Accordion 
                key={url.shortcode}
                expanded={expandedUrl === url.shortcode}
                onChange={handleAccordionChange(url.shortcode)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {url.shortLink}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={getStatusLabel(url)}
                          color={getStatusColor(url)}
                          size="small"
                        />
                        <Chip
                          label={`${url.clickCount} clicks`}
                          color="info"
                          size="small"
                        />
                        <Chip
                          label={`Expires: ${formatDate(url.expiry)}`}
                          color="default"
                          size="small"
                        />
                      </Box>
                    </Box>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(url.shortLink);
                      }}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        URL Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Original URL:
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                          {url.url}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Created:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(url.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Validity:
                        </Typography>
                        <Typography variant="body1">
                          {url.validity} minutes
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Click Analytics
                      </Typography>
                      {url.detailedStats && url.detailedStats.clicks.length > 0 ? (
                        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Referrer</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {url.detailedStats.clicks.map((click, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {formatDate(click.timestamp)}
                                  </TableCell>
                                  <TableCell>
                                    {click.location ? 
                                      `${click.location.city || 'Unknown'}, ${click.location.country || 'Unknown'}` : 
                                      'Unknown'
                                    }
                                  </TableCell>
                                  <TableCell>
                                    {click.referer || 'Direct'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info">
                          No clicks recorded yet.
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default UrlStatistics;