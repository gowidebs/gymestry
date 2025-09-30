const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        return await requestCCTVAccess(JSON.parse(body));
      case 'GET':
        return await getCCTVStreams(event.queryStringParameters);
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function requestCCTVAccess(data) {
  const { userId, gymId, cameraIds, reason } = data;
  
  // Check user permissions
  const userRole = await getUserRole(userId, gymId);
  if (!canAccessCCTV(userRole)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Insufficient permissions' }) };
  }
  
  // Generate temporary access token
  const accessToken = generateAccessToken(userId, cameraIds);
  
  // Log CCTV access request
  await logCCTVAccess(userId, gymId, cameraIds, 'requested', reason);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      accessToken,
      cameras: cameraIds,
      expiresIn: 3600, // 1 hour
      streamUrls: await getStreamUrls(cameraIds)
    })
  };
}

async function getCCTVStreams(params) {
  const { gymId, token } = params;
  
  if (!validateToken(token)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
  }
  
  const cameras = await dynamodb.query({
    TableName: 'gogym-cameras',
    KeyConditionExpression: 'gymId = :gymId',
    ExpressionAttributeValues: { ':gymId': gymId }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      cameras: cameras.Items.map(cam => ({
        id: cam.cameraId,
        name: cam.name,
        location: cam.location,
        status: cam.status,
        streamUrl: cam.streamUrl
      }))
    })
  };
}

async function getUserRole(userId, gymId) {
  const result = await dynamodb.get({
    TableName: 'gogym-staff',
    Key: { userId, gymId }
  }).promise();
  
  return result.Item?.role || 'member';
}

function canAccessCCTV(role) {
  return ['admin', 'manager', 'security'].includes(role);
}

function generateAccessToken(userId, cameraIds) {
  const payload = { userId, cameraIds, exp: Date.now() + 3600000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function validateToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

async function getStreamUrls(cameraIds) {
  const cameras = await dynamodb.batchGet({
    RequestItems: {
      'gogym-cameras': {
        Keys: cameraIds.map(id => ({ cameraId: id }))
      }
    }
  }).promise();
  
  return cameras.Responses['gogym-cameras'].map(cam => ({
    id: cam.cameraId,
    url: cam.streamUrl
  }));
}

async function logCCTVAccess(userId, gymId, cameraIds, action, reason) {
  await dynamodb.put({
    TableName: 'gogym-cctv-logs',
    Item: {
      id: Date.now().toString(),
      userId,
      gymId,
      cameraIds,
      action,
      reason,
      timestamp: new Date().toISOString()
    }
  }).promise();
}