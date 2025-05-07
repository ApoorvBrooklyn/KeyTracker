const Service = require('../models/Service');
const UsageLog = require('../models/UsageLog');
const cron = require('node-cron');

class MonitoringService {
  constructor() {
    // Run monitoring jobs according to their schedule
    this.initializeMonitoringJobs();
  }

  async initializeMonitoringJobs() {
    // Every hour, check for services that need polling
    cron.schedule('0 * * * *', async () => {
      await this.checkServicesForPolling();
    });
  }

  async checkServicesForPolling() {
    try {
      // Find services that use polling and are due for an update
      const services = await Service.find({ 
        refreshMethod: 'polling',
        isActive: true 
      });

      for (const service of services) {
        const hoursSinceLastPoll = this.getHoursSinceLastPoll(service);
        
        if (hoursSinceLastPoll >= service.pollingInterval) {
          await this.pollServiceUsage(service);
        }
      }
    } catch (error) {
      console.error('Error checking services for polling:', error);
    }
  }

  getHoursSinceLastPoll(service) {
    // Logic to determine hours since last poll
    // This could use the last UsageLog with source='polled'
    return 24; // Placeholder - implement actual logic
  }

  async pollServiceUsage(service) {
    try {
      // Get the appropriate adapter for this service
      const adapter = service.getAdapter();
      
      // Poll for usage data
      const usageData = await adapter.getUsageData();
      
      // If we got valid data, save it
      if (usageData) {
        const usageLog = new UsageLog({
          serviceId: service._id,
          calls: usageData.calls || 0,
          tokens: usageData.tokens || 0,
          dataTransferred: usageData.dataTransferred || 0,
          cost: usageData.cost || 0,
          source: 'polled',
          details: usageData.details || {}
        });

        await usageLog.save();
        
        // Update service with new metadata if available
        if (usageData.metadata) {
          service.metadata = {
            ...service.metadata,
            ...usageData.metadata,
            lastPolled: new Date()
          };
          await service.save();
        }
      }
    } catch (error) {
      console.error(`Error polling service ${service.name}:`, error);
    }
  }
}

module.exports = new MonitoringService();