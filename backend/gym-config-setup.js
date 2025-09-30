const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Sample gym configurations
const sampleConfigs = [
  {
    gym_id: 'gym_001',
    name: 'Downtown Fitness',
    gate_provider: 'zetko',
    provider_settings: {
      api_key: 'zetko_api_key_here',
      device_id: 'zetko_device_001'
    },
    api_endpoints: {
      base_url: 'https://api.zetko.com/v1',
      gate_open: '/gate/open',
      access_check: '/access/check'
    }
  },
  {
    gym_id: 'gym_002', 
    name: 'Uptown Gym',
    gate_provider: 'generic',
    provider_settings: {
      api_key: 'generic_api_key_here'
    },
    api_endpoints: {
      base_url: 'https://api.generic-gate.com/v1'
    }
  }
];

exports.handler = async (event) => {
  try {
    for (const config of sampleConfigs) {
      await dynamodb.put({
        TableName: 'gogym-gym-configs',
        Item: config
      }).promise();
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Gym configurations created successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};