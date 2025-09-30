class ZetkoAdapter {
  constructor(config) {
    this.apiUrl = config.api_endpoints.base_url;
    this.apiKey = config.provider_settings.api_key;
  }

  async openGate(userId, gateId) {
    const response = await fetch(`${this.apiUrl}/gate/open`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, gate_id: gateId })
    });
    
    return await response.json();
  }

  async checkAccess(userId, gateId) {
    const response = await fetch(`${this.apiUrl}/access/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, gate_id: gateId })
    });
    
    return await response.json();
  }
}

module.exports = ZetkoAdapter;