const UsageLog = require('../models/UsageLog');
const Service = require('../models/Service');

exports.getServiceUsage = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get aggregated daily usage
    const dailyUsage = await UsageLog.getDailyUsage(serviceId, start, end);
    
    // Get total usage
    const totalUsage = await UsageLog.aggregate([
      {
        $match: {
          serviceId: mongoose.Types.ObjectId(serviceId),
          date: {
            $gte: start,
            $lte: end
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: "$calls" },
          totalCost: { $sum: "$cost" }
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        service: {
          id: service._id,
          name: service.name,
          usageLimit: service.usageLimit
        },
        dailyUsage,
        totalUsage: totalUsage[0] || { totalCalls: 0, totalCost: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching service usage:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch service usage',
      error: error.message
    });
  }
};

exports.recordManualUsage = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { calls, cost, date, details } = req.body;
    
    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Create usage log
    const usageLog = new UsageLog({
      serviceId,
      calls: calls || 0,
      cost: cost || 0,
      date: date ? new Date(date) : new Date(),
      source: 'manual',
      details: details || {}
    });
    
    await usageLog.save();
    
    return res.status(201).json({
      success: true,
      message: 'Usage recorded successfully',
      data: usageLog
    });
  } catch (error) {
    console.error('Error recording manual usage:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record usage',
      error: error.message
    });
  }
};