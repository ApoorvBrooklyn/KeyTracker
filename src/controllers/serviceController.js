const Service = require('../models/Service');
const UsageLog = require('../models/UsageLog');

exports.registerService = async (req, res) => {
  try {
    const { name, serviceType, apiKey, endpoint, usageLimit, refreshMethod } = req.body;
    
    // Validate input
    if (!name || !serviceType || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create new service
    const service = new Service({
      name,
      serviceType,
      apiKey,
      endpoint,
      usageLimit,
      refreshMethod: refreshMethod || 'polling'
    });
    
    // Try to validate the API key with the service adapter
    const adapter = service.getAdapter();
    try {
      await adapter.validateApiKey();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid API key or service configuration',
        error: error.message
      });
    }
    
    // Save to database
    await service.save();
    
    // Return success
    return res.status(201).json({
      success: true,
      message: 'Service registered successfully',
      service: {
        id: service._id,
        name: service.name,
        serviceType: service.serviceType,
        refreshMethod: service.refreshMethod
      }
    });
  } catch (error) {
    console.error('Error registering service:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register service',
      error: error.message
    });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().select('-apiKey');
    
    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).select('-apiKey');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
};