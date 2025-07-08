const mongoose = require('mongoose');

// Click tracking schema
const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  referer: {
    type: String,
    default: ''
  },
  location: {
    country: { type: String, default: 'Unknown' },
    city: { type: String, default: 'Unknown' },
    region: { type: String, default: 'Unknown' },
    timezone: { type: String, default: 'Unknown' }
  }
}, { _id: false });

// Main URL schema
const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  shortcode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 10
  },
  validity: {
    type: Number,
    required: true,
    min: 1,
    max: 525600, // 1 year in minutes
    default: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiry: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clicks: [clickSchema],
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if URL is expired
urlSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiry;
});

// Virtual for active status (not expired and active)
urlSchema.virtual('isCurrentlyActive').get(function() {
  return this.isActive && !this.isExpired;
});

// Index for efficient queries
urlSchema.index({ shortcode: 1 });
urlSchema.index({ expiry: 1 });
urlSchema.index({ createdAt: -1 });

// Pre-save middleware to set expiry date
urlSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('validity')) {
    this.expiry = new Date(this.createdAt.getTime() + this.validity * 60 * 1000);
  }
  next();
});

// Method to add a click
urlSchema.methods.addClick = function(clickData) {
  this.clicks.push(clickData);
  this.clickCount = this.clicks.length;
  return this.save();
};

// Method to check if URL is valid for redirection
urlSchema.methods.canRedirect = function() {
  return this.isActive && !this.isExpired;
};

// Static method to cleanup expired URLs
urlSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiry: { $lt: new Date() }
  });
  return result.deletedCount;
};

// Static method to get analytics summary
urlSchema.statics.getAnalyticsSummary = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalUrls: { $sum: 1 },
        totalClicks: { $sum: '$clickCount' },
        activeUrls: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isActive', true] },
                  { $gt: ['$expiry', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { totalUrls: 0, totalClicks: 0, activeUrls: 0 };
};

module.exports = mongoose.model('Url', urlSchema);