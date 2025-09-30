const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// XYZ Hardware API integration
async function syncUserToHardware(userData) {
  const { userId, gymId, accessMethods } = userData;
  
  // Get gym's hardware config
  const gymConfig = await dynamodb.get({
    TableName: 'gogym-gym-configs',
    Key: { gym_id: gymId }
  }).promise();
  
  const hardwareConfig = gymConfig.Item.hardware_settings;
  
  // Sync to XYZ hardware
  const syncData = {
    user_id: userId,
    access_methods: accessMethods, // ['face', 'qr', 'bluetooth']
    permissions: {
      gates: ['main_entrance', 'gym_floor'],
      time_slots: ['06:00-23:00'],
      valid_until: userData.membershipExpiry
    }
  };
  
  // Send to XYZ hardware API
  const response = await fetch(`${hardwareConfig.api_url}/users/sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hardwareConfig.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(syncData)
  });
  
  const result = await response.json();
  
  // Store hardware sync status
  await dynamodb.put({
    TableName: 'gogym-hardware-sync',
    Item: {
      userId,
      gymId,
      hardwareUserId: result.hardware_user_id,
      syncStatus: 'active',
      lastSync: new Date().toISOString(),
      accessMethods: accessMethods
    }
  }).promise();
  
  return result;
}

// Remove user from hardware when membership ends
async function removeUserFromHardware(userId, gymId) {
  const syncRecord = await dynamodb.get({
    TableName: 'gogym-hardware-sync',
    Key: { userId, gymId }
  }).promise();
  
  if (!syncRecord.Item) return;
  
  const gymConfig = await dynamodb.get({
    TableName: 'gogym-gym-configs',
    Key: { gym_id: gymId }
  }).promise();
  
  // Remove from XYZ hardware
  await fetch(`${gymConfig.Item.hardware_settings.api_url}/users/${syncRecord.Item.hardwareUserId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${gymConfig.Item.hardware_settings.api_key}`
    }
  });
  
  // Update sync status
  await dynamodb.update({
    TableName: 'gogym-hardware-sync',
    Key: { userId, gymId },
    UpdateExpression: 'SET syncStatus = :status',
    ExpressionAttributeValues: { ':status': 'removed' }
  }).promise();
}

module.exports = { syncUserToHardware, removeUserFromHardware };