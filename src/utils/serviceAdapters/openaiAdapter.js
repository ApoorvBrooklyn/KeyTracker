const axios = require('axios');

class OpenAIAdapter {
  constructor(service) {
    this.service = service;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async getUsageData() {
    try {
      // OpenAI usage is available from their API
      const response = await axios.get(`${this.baseURL}/usage`, {
        headers: {
          'Authorization': `Bearer ${this.service.apiKey}`
        }
      });

      // Transform the OpenAI response into our format
      return {
        calls: response.data.total_requests || 0, 
        tokens: response.data.total_tokens || 0,
        cost: this.calculateCost(response.data),
        details: {
          promptTokens: response.data.prompt_tokens,
          completionTokens: response.data.completion_tokens
        }
      };
    } catch (error) {
      console.error('Error fetching OpenAI usage:', error.message);
      throw error;
    }
  }

  calculateCost(data) {
    // Cost calculation logic specific to OpenAI
    // This would use the pricing tiers and token counts
    const promptCost = (data.prompt_tokens || 0) * 0.0000015;
    const completionCost = (data.completion_tokens || 0) * 0.000002;
    return promptCost + completionCost;
  }
}

module.exports = OpenAIAdapter;