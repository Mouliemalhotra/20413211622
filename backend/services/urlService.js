const UrlModel = require('../models/UrlModel');
const ShortUrl = require('../models/ShortUrl');
const { logger } = require('../middleware/logger');

class UrlService {
  async createShortUrl(urlData) {
    try {
      // Create and validate using existing ShortUrl class
      const shortUrl = new ShortUrl(urlData);
      const validationErrors = shortUrl.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Check if shortcode already exists
      const existingUrl = await UrlModel.findOne({ shortcode: shortUrl.shortcode });
      if (existingUrl) {
        throw new Error('Shortcode already exists');
      }

      // Create new URL document
      const urlDocument = new UrlModel({
        url: shortUrl.url,
        shortcode: shortUrl.shortcode,
        validity: shortUrl.validity,
        createdAt: shortUrl.createdAt,
        expiry: shortUrl.expiry,
        isActive: shortUrl.isActive
      });

      await urlDocument.save();
      
      logger.info('Short URL created in MongoDB', { 
        shortcode: shortUrl.shortcode,
        url: shortUrl.url 
      });

      return {
        shortLink: `${process.env.BASE_URL}/${shortUrl.shortcode}`,
        expiry: shortUrl.expiry.toISOString(),
        shortcode: shortUrl.shortcode
      };

    } catch (error) {
      logger.error('Error creating short URL', { error: error.message });
      throw error;
    }
  }

  async getUrlByShortcode(shortcode) {
    try {
      const url = await UrlModel.findOne({ shortcode });
      if (!url) {
        throw new Error('URL not found');
      }
      return url;
    } catch (error) {
      logger.error('Error fetching URL by shortcode', { shortcode, error: error.message });
      throw error;
    }
  }

  async getAllUrls() {
    try {
      const urls = await UrlModel.find({})
        .sort({ createdAt: -1 })
        .lean();

      return urls.map(url => ({
        ...url,
        shortLink: `${process.env.BASE_URL}/${url.shortcode}`,
        isActive: url.isActive && new Date(url.expiry) > new Date()
      }));
    } catch (error) {
      logger.error('Error fetching all URLs', { error: error.message });
      throw error;
    }
  }

  async getUrlStatistics(shortcode) {
    try {
      const url = await UrlModel.findOne({ shortcode });
      if (!url) {
        throw new Error('URL not found');
      }

      return {
        shortcode: url.shortcode,
        originalUrl: url.url,
        shortLink: `${process.env.BASE_URL}/${shortcode}`,
        createdAt: url.createdAt,
        expiry: url.expiry,
        isActive: url.isCurrentlyActive,
        clickCount: url.clickCount,
        clicks: url.clicks.map(click => ({
          timestamp: click.timestamp,
          ip: click.ip,
          userAgent: click.userAgent,
          referer: click.referer,
          location: click.location
        }))
      };
    } catch (error) {
      logger.error('Error fetching URL statistics', { shortcode, error: error.message });
      throw error;
    }
  }

  async recordClick(shortcode, clickData) {
    try {
      const url = await UrlModel.findOne({ shortcode });
      if (!url) {
        throw new Error('URL not found');
      }

      if (!url.canRedirect()) {
        throw new Error('URL is expired or inactive');
      }

      await url.addClick(clickData);
      
      logger.info('Click recorded', { shortcode, clickCount: url.clickCount });
      return url;
    } catch (error) {
      logger.error('Error recording click', { shortcode, error: error.message });
      throw error;
    }
  }

  async cleanupExpiredUrls() {
    try {
      const deletedCount = await UrlModel.cleanupExpired();
      logger.info('Expired URLs cleaned up', { deletedCount });
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired URLs', { error: error.message });
      throw error;
    }
  }

  async getAnalyticsSummary() {
    try {
      return await UrlModel.getAnalyticsSummary();
    } catch (error) {
      logger.error('Error fetching analytics summary', { error: error.message });
      throw error;
    }
  }
}

module.exports = new UrlService();