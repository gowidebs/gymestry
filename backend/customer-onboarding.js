const { syncUserToHardware } = require('./hardware-sync');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  if (httpMethod === 'POST') {
    return await onboardNewCustomer(JSON.parse(body));
  }
  
  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};

async function onboardNewCustomer(customerData) {
  const { 
    userId, 
    gymId, 
    name, 
    phone, 
    membershipType,
    membershipExpiry,
    accessMethods // ['face', 'qr', 'bluetooth']
  } = customerData;
  
  try {
    // 1. Create membership record
    await dynamodb.put({
      TableName: 'gogym-memberships',
      Item: {
        userId,
        gymId,
        name,
        phone,
        membershipType,
        status: 'active',
        expiryDate: membershipExpiry,
        createdAt: new Date().toISOString()
      }
    }).promise();
    
    // 2. Sync to XYZ hardware
    const hardwareSync = await syncUserToHardware({
      userId,
      gymId,
      accessMethods,
      membershipExpiry
    });
    
    // 3. Generate QR code for immediate access
    const qrCode = generateQRCode(userId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Customer onboarded successfully',
        userId,
        hardwareUserId: hardwareSync.hardware_user_id,
        qrCode,
        accessMethods,
        nextSteps: {
          face_registration: accessMethods.includes('face') ? 'required' : 'not_needed',
          bluetooth_pairing: accessMethods.includes('bluetooth') ? 'required' : 'not_needed'
        }
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

function generateQRCode(userId) {
  const timestamp = Date.now();
  const hash = Buffer.from(`${userId}${timestamp}secret`).toString('base64').substring(0, 8);
  return `${userId}:${timestamp}:${hash}`;
}