// In-memory database for simplicity
// In production, use MongoDB, PostgreSQL, or similar
class Database {
  constructor() {
    this.urls = new Map();
    this.clicks = new Map();
    this.analytics = new Map();
  }

  // URL operations
  saveUrl(shortcode, urlData) {
    this.urls.set(shortcode, urlData);
  }

  getUrl(shortcode) {
    return this.urls.get(shortcode);
  }

  getAllUrls() {
    return Array.from(this.urls.entries()).map(([shortcode, data]) => ({
      shortcode,
      ...data
    }));
  }

  urlExists(shortcode) {
    return this.urls.has(shortcode);
  }

  deleteUrl(shortcode) {
    this.urls.delete(shortcode);
    this.clicks.delete(shortcode);
    this.analytics.delete(shortcode);
  }

  // Click operations
  recordClick(shortcode, clickData) {
    if (!this.clicks.has(shortcode)) {
      this.clicks.set(shortcode, []);
    }
    this.clicks.get(shortcode).push(clickData);
  }

  getClicks(shortcode) {
    return this.clicks.get(shortcode) || [];
  }

  getClickCount(shortcode) {
    return this.clicks.has(shortcode) ? this.clicks.get(shortcode).length : 0;
  }

  // Analytics operations
  updateAnalytics(shortcode, analyticsData) {
    this.analytics.set(shortcode, analyticsData);
  }

  getAnalytics(shortcode) {
    return this.analytics.get(shortcode) || {};
  }

  // Cleanup expired URLs
  cleanupExpiredUrls() {
    const now = new Date();
    for (const [shortcode, urlData] of this.urls.entries()) {
      if (urlData.expiry && new Date(urlData.expiry) < now) {
        this.deleteUrl(shortcode);
      }
    }
  }
}

const db = new Database();

// Cleanup expired URLs every 5 minutes
setInterval(() => {
  db.cleanupExpiredUrls();
}, 5 * 60 * 1000);

module.exports = db;