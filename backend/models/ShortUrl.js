const validator = require('validator');
const { nanoid } = require('nanoid');

class ShortUrl {
  constructor(data) {
    this.url = data.url;
    this.shortcode = data.shortcode || this.generateShortcode();
    this.validity = data.validity || 30; // Default 30 minutes
    this.createdAt = new Date();
    this.expiry = new Date(Date.now() + this.validity * 60 * 1000);
    this.clickCount = 0;
    this.isActive = true;
  }

  generateShortcode() {
    // Generate a unique 6-character shortcode
    return nanoid(6);
  }

  validate() {
    const errors = [];

    // Validate URL
    if (!this.url) {
      errors.push('URL is required');
    } else if (!validator.isURL(this.url)) {
      errors.push('Invalid URL format');
    }

    // Validate shortcode
    if (this.shortcode && !this.isValidShortcode(this.shortcode)) {
      errors.push('Invalid shortcode format. Use alphanumeric characters only (3-10 characters)');
    }

    // Validate validity
    if (this.validity && (!Number.isInteger(this.validity) || this.validity < 1 || this.validity > 525600)) {
      errors.push('Validity must be an integer between 1 and 525600 minutes (1 year)');
    }

    return errors;
  }

  isValidShortcode(shortcode) {
    // Shortcode should be alphanumeric, 3-10 characters
    return /^[a-zA-Z0-9]{3,10}$/.test(shortcode);
  }

  isExpired() {
    return new Date() > this.expiry;
  }

  toJSON() {
    return {
      url: this.url,
      shortcode: this.shortcode,
      validity: this.validity,
      createdAt: this.createdAt.toISOString(),
      expiry: this.expiry.toISOString(),
      clickCount: this.clickCount,
      isActive: this.isActive && !this.isExpired()
    };
  }
}

module.exports = ShortUrl;