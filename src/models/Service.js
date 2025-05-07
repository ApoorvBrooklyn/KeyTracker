const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['openai', 'google', 'azure', 'aws', 'custom'],
    default: 'custom'
  },
  apiKey: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: false
  },
  billingTier: {
    type: String,
    default: 'free'
  },
  usageLimit: {
    type: Number,
    default: 0
  },
  refreshMethod: {
    type: String,
    enum: ['proxy', 'polling', 'manual'],
    default: 'polling'
  },
  pollingInterval: {
    type: Number,
    default: 24 // hours
  },
  isActive: {
    type: Boolean,
    default: true
  },
  costModel: {
    type: Object,
    default: {
      baseCost: 0,
      costPerCall: 0,
      currency: 'USD'
    }
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Find the adapter for this service type
ServiceSchema.methods.getAdapter = function() {
  try {
    const AdapterClass = require(`../utils/serviceAdapters/${this.serviceType}Adapter`);
    return new AdapterClass(this);
  } catch (error) {
    // Fall back to generic adapter
    const GenericAdapter = require('../utils/serviceAdapters/genericAdapter');
    return new GenericAdapter(this);
  }
};

module.exports = mongoose.model('Service', ServiceSchema);