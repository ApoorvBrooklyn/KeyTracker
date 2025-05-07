class GenericAdapter {
    constructor(service) {
      this.service = service;
    }
  
    async validateApiKey() {
      // For generic services, just return true
      // In real implementation, you might try a simple request to validate
      return true;
    }
  
    async getUsageData() {
      // For generic services, we can't automatically fetch usage
      // Return null or empty data
      return {
        calls: 0,
        tokens: 0,
        cost: 0,
        details: {
          note: "Generic services require manual usage tracking"
        }
      };
    }
  }
  
  module.exports = GenericAdapter;