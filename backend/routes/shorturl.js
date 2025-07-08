const express = require('express');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const urlService = require('../services/urlService');
const { logger } = require('../middleware/logger');

const router = express.Router();

// Create Short URL
router.post('/shorturls', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;
    
    logger.info('Creating short URL', { url, validity, shortcode });

    const result = await urlService.createShortUrl({ url, validity, shortcode });
    
    logger.info('Short URL created successfully', { shortcode: result.shortcode });
    res.status(201).json(result);

  } catch (error) {
    logger.error('Error creating short URL', { error: error.message });
    
    if (error.message.includes('Validation failed')) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message
      });
    }
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Shortcode already exists',
        message: 'Please choose a different shortcode or let the system generate one'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create short URL'
    });
  }
});

// Get Short URL Statistics
router.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    logger.info('Retrieving URL statistics', { shortcode });

    const statistics = await urlService.getUrlStatistics(shortcode);
    
    logger.info('URL statistics retrieved', { shortcode, clickCount: statistics.clickCount });
    res.json(statistics);

  } catch (error) {
    logger.error('Error retrieving URL statistics', { error: error.message });
    
    if (error.message === 'URL not found') {
      logger.warn('URL not found', { shortcode });
      return res.status(404).json({
        error: 'URL not found',
        message: 'The requested shortcode does not exist'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URL statistics'
    });
  }
});

// Get All URLs (for frontend statistics page)
router.get('/shorturls', async (req, res) => {
  try {
    logger.info('Retrieving all URLs');

    const allUrls = await urlService.getAllUrls();

    logger.info('All URLs retrieved', { count: allUrls.length });
    res.json(allUrls);

  } catch (error) {
    logger.error('Error retrieving all URLs', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URLs'
    });
  }
});

// Redirect Short URL
router.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    logger.info('Attempting redirect', { shortcode });

    const url = await urlService.getUrlByShortcode(shortcode);
    
    // Check if URL can redirect (active and not expired)
    if (!url.canRedirect()) {
      logger.warn('URL expired or inactive', { shortcode, expiry: url.expiry, isActive: url.isActive });
      return res.status(410).json({
        error: 'URL expired or inactive',
        message: 'This shortened URL has expired or is no longer active'
      });
    }

    // Record click analytics
    const clickData = {
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers.referer || req.headers.referrer || '',
      location: geoip.lookup(req.ip) || { country: 'Unknown', city: 'Unknown' }
    };

    await urlService.recordClick(shortcode, clickData);

    logger.info('Redirect successful', { shortcode, originalUrl: url.url });
    res.redirect(301, url.url);

  } catch (error) {
    logger.error('Error during redirect', { error: error.message });
    
    if (error.message === 'URL not found') {
      logger.warn('URL not found for redirect', { shortcode });
      return res.status(404).json({
        error: 'URL not found',
        message: 'The requested shortcode does not exist'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to redirect'
    });
  }
});

module.exports = router;