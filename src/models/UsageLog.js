const mongoose = require('mongoose');

const UsageLogSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  calls: {
    type: Number,
    default: 0
  },
  tokens: {
    type: Number,
    default: 0
  },
  dataTransferred: {
    type: Number,
    default: 0
  },
  cost: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    enum: ['proxy', 'polled', 'manual'],
    default: 'polled'
  },
  details: {
    type: Object,
    default: {}
  }
});

// Static method to get daily usage
UsageLogSchema.statics.getDailyUsage = async function(serviceId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        serviceId: mongoose.Types.ObjectId(serviceId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" }
        },
        calls: { $sum: "$calls" },
        cost: { $sum: "$cost" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ];

  return this.aggregate(pipeline);
};

module.exports = mongoose.model('UsageLog', UsageLogSchema);