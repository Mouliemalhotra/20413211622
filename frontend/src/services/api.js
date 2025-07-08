import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        this.log('API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        this.log('API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        this.log('API Response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      (error) => {
        this.log('API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  // Custom logging method (replaces console.log)
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data,
    };
    
    // In a real application, this would integrate with your logging service
    // For now, we'll use localStorage to simulate logging
    const logs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('apiLogs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
  }

  async createShortUrl(urlData) {
    try {
      const response = await this.api.post('/shorturls', urlData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUrlStatistics(shortcode) {
    try {
      const response = await this.api.get(`/shorturls/${shortcode}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllUrls() {
    try {
      const response = await this.api.get('/shorturls');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const errorDetails = error.response?.data?.details || [];
    
    return {
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status || 500,
    };
  }
}

export default new ApiService();