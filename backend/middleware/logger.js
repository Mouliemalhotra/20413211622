const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatLogEntry(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeLog(level, message, meta = {}) {
    const logEntry = this.formatLogEntry(level, message, meta);
    const logFile = path.join(this.logDir, `${level}.log`);
    
    fs.appendFileSync(logFile, logEntry);
    
    // Also write to general log file
    const generalLogFile = path.join(this.logDir, 'app.log');
    fs.appendFileSync(generalLogFile, logEntry);
  }

  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }
}

const logger = new Logger();

// Express middleware
const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const { method, url, ip, headers } = req;
  
  logger.info('HTTP Request', {
    method,
    url,
    ip,
    userAgent: headers['user-agent'],
    referer: headers.referer || headers.referrer
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    logger.info('HTTP Response', {
      method,
      url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip
    });
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = { logger, loggerMiddleware };