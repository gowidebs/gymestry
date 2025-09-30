const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const GateProviderFactory = require('./gate-providers/gate-provider-factory');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const GATE_LOGS_TABLE = 'gogym-gate-logs';
const MEMBERSHIPS_TABLE = 'gogym-memberships';
const GYM_CONFIG_TABLE = 'gogym-gym-configs';

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        return await validateAccess(JSON.parse(body));
      case 'GET':
        return await getAccessLogs();
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function validateAccess(accessData) {
  const { userId, gymId, gateId, method, qrCode, faceData, bleData } = accessData;
  
  // Get gym configuration
  const gymConfig = await dynamodb.get({
    TableName: GYM_CONFIG_TABLE,
    Key: { gym_id: gymId }
  }).promise();
  
  if (!gymConfig.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Gym configuration not found' }) };
  }
  
  // Check membership validity
  const membership = await getMembershipStatus(userId);
  if (!membership.valid) {
    return logAccess(userId, gymId, method, 'denied', membership.reason);
  }
  
  let accessGranted = false;
  let validationResult = '';
  
  switch (method) {
    case 'qr':
      accessGranted = await validateQR(qrCode, userId);
      validationResult = accessGranted ? 'QR validated' : 'Invalid QR';
      break;
    case 'bluetooth':
      accessGranted = await validateBluetooth(bleData, userId);
      validationResult = accessGranted ? 'BLE connected' : 'BLE failed';
      break;
    case 'face':
      accessGranted = await validateFace(faceData, userId);
      validationResult = accessGranted ? 'Face recognized' : 'Face not recognized';
      break;
    default:
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid access method' }) };
  }
  
  if (accessGranted) {
    // Use provider-specific gate opening
    const gateProvider = GateProviderFactory.createProvider(gymConfig.Item);
    await gateProvider.openGate(userId, gateId);
  }
  
  return logAccess(userId, gymId, method, accessGranted ? 'granted' : 'denied', validationResult, gymConfig.Item.gate_provider);
}

async function getMembershipStatus(userId) {
  const result = await dynamodb.get({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId }
  }).promise();
  
  if (!result.Item) {
    return { valid: false, reason: 'No membership found' };
  }
  
  const membership = result.Item;
  const now = new Date();
  const expiryDate = new Date(membership.expiryDate);
  
  if (membership.status === 'frozen') {
    return { valid: false, reason: 'Membership frozen' };
  }
  
  if (now > expiryDate) {
    return { valid: false, reason: 'Membership expired' };
  }
  
  return { valid: true, membership };
}

async function validateQR(qrCode, userId) {
  // QR format: userId:timestamp:hash
  const [qrUserId, timestamp, hash] = qrCode.split(':');
  
  if (qrUserId !== userId) return false;
  
  const qrTime = parseInt(timestamp);
  const now = Date.now();
  
  // QR valid for 5 minutes
  if (now - qrTime > 300000) return false;
  
  // Validate hash (simplified)
  const expectedHash = Buffer.from(`${userId}${timestamp}secret`).toString('base64').substring(0, 8);
  return hash === expectedHash;
}

async function validateBluetooth(bleData, userId) {
  // Simulate BLE validation
  return bleData && bleData.deviceId && bleData.signal > -70;
}

async function validateFace(faceData, userId, gymId) {
  const rekognition = new AWS.Rekognition();
  
  // Convert base64 image to buffer
  const imageBuffer = Buffer.from(faceData.imageBase64, 'base64');
  
  // Search face in collection
  const collectionId = `gogym-faces-${gymId}`;
  const searchResult = await rekognition.searchFacesByImage({
    CollectionId: collectionId,
    Image: { Bytes: imageBuffer },
    MaxFaces: 1,
    FaceMatchThreshold: 80
  }).promise();
  
  if (searchResult.FaceMatches.length === 0) {
    return false;
  }
  
  // Verify face belongs to user
  const faceId = searchResult.FaceMatches[0].Face.FaceId;
  const mapping = await dynamodb.get({
    TableName: 'gogym-face-mappings',
    Key: { userId, gymId }
  }).promise();
  
  return mapping.Item && mapping.Item.faceId === faceId;
}

async function logAccess(userId, gymId, method, result, details, provider = 'unknown') {
  const log = {
    id: uuidv4(),
    userId,
    gymId,
    method,
    result,
    details,
    provider,
    timestamp: new Date().toISOString()
  };
  
  await dynamodb.put({
    TableName: GATE_LOGS_TABLE,
    Item: log
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      access: result === 'granted',
      message: details,
      provider,
      timestamp: log.timestamp
    })
  };
}

async function getAccessLogs() {
  const result = await dynamodb.scan({
    TableName: GATE_LOGS_TABLE,
    Limit: 100
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}