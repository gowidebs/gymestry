const { syncUserToHardware } = require('./hardware-sync');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  if (httpMethod === 'POST') {
    return await registerFromApp(JSON.parse(body));
  }
  
  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};

async function registerFromApp(registrationData) {
  const { 
    name,
    phone,
    email,
    gymId,
    membershipPlan,
    paymentToken,
    preferredAccessMethods // ['qr', 'face', 'bluetooth']
  } = registrationData;
  
  const userId = `user_${Date.now()}`;
  
  try {
    // 1. Process payment (simplified)
    const paymentResult = await processPayment(paymentToken, membershipPlan);
    if (!paymentResult.success) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment failed' }) };
    }
    
    // 2. Create user account
    await dynamodb.put({
      TableName: 'gogym-users',
      Item: {
        userId,
        name,
        phone,
        email,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    }).promise();
    
    // 3. Create membership
    const membershipExpiry = calculateExpiry(membershipPlan);
    await dynamodb.put({
      TableName: 'gogym-memberships',
      Item: {
        userId,
        gymId,
        membershipPlan,
        status: 'active',
        expiryDate: membershipExpiry,
        createdAt: new Date().toISOString()
      }
    }).promise();
    
    // 4. Auto-sync to XYZ hardware
    const hardwareSync = await syncUserToHardware({
      userId,
      gymId,
      accessMethods: preferredAccessMethods,
      membershipExpiry
    });
    
    // 5. Generate immediate QR access
    const qrCode = generateQRCode(userId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        userId,
        message: 'Registration successful',
        membership: {
          plan: membershipPlan,
          expiryDate: membershipExpiry,
          gymId
        },
        access: {
          qrCode, // Ready to use immediately
          hardwareUserId: hardwareSync.hardware_user_id,
          availableMethods: preferredAccessMethods
        },
        nextSteps: {
          face_registration: preferredAccessMethods.includes('face'),
          bluetooth_pairing: preferredAccessMethods.includes('bluetooth'),
          qr_ready: true
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

function calculateExpiry(plan) {
  const now = new Date();
  switch(plan) {
    case 'monthly': return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    case 'quarterly': return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
    case 'yearly': return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    default: return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
  }
}

function generateQRCode(userId) {
  const timestamp = Date.now();
  const hash = Buffer.from(`${userId}${timestamp}secret`).toString('base64').substring(0, 8);
  return `${userId}:${timestamp}:${hash}`;
}

async function processPayment(token, plan) {
  // Payment processing logic
  return { success: true, transactionId: `txn_${Date.now()}` };
}