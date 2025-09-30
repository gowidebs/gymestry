const { syncUserToHardware } = require('./hardware-sync');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  if (httpMethod === 'POST') {
    return await registerMemberFromPortal(JSON.parse(body));
  }
  
  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};

async function registerMemberFromPortal(memberData) {
  const { 
    name,
    phone,
    email,
    gymId,
    membershipPlan,
    staffId, // Who registered this member
    accessMethods = ['qr'] // Default to QR
  } = memberData;
  
  try {
    // 1. Generate Member ID and temp password
    const memberId = generateMemberId(gymId);
    const tempPassword = generateTempPassword();
    const userId = `member_${memberId}`;
    
    // 2. Create user account
    await dynamodb.put({
      TableName: 'gogym-users',
      Item: {
        userId,
        memberId,
        name,
        phone,
        email,
        tempPassword,
        passwordChanged: false,
        createdAt: new Date().toISOString(),
        createdBy: staffId,
        status: 'active'
      }
    }).promise();
    
    // 3. Create membership
    const membershipExpiry = calculateExpiry(membershipPlan);
    await dynamodb.put({
      TableName: 'gogym-memberships',
      Item: {
        userId,
        memberId,
        gymId,
        membershipPlan,
        status: 'active',
        expiryDate: membershipExpiry,
        createdAt: new Date().toISOString(),
        createdBy: staffId
      }
    }).promise();
    
    // 4. Auto-sync to XYZ hardware
    const hardwareSync = await syncUserToHardware({
      userId,
      gymId,
      accessMethods,
      membershipExpiry
    });
    
    // 5. Generate QR code
    const qrCode = generateQRCode(userId);
    
    // 6. Send credentials via SMS/Email (simplified)
    await sendCredentials(phone, email, memberId, tempPassword);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        member: {
          memberId,
          userId,
          name,
          phone,
          email
        },
        credentials: {
          memberId,
          tempPassword,
          loginUrl: 'https://gogym.app/login'
        },
        membership: {
          plan: membershipPlan,
          expiryDate: membershipExpiry,
          gymId
        },
        hardware: {
          syncStatus: 'completed',
          hardwareUserId: hardwareSync.hardware_user_id
        },
        qrCode
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

function generateMemberId(gymId) {
  // Format: GYM001-0001
  const gymCode = gymId.toUpperCase().replace('gym_', 'GYM');
  const memberNumber = String(Date.now()).slice(-4);
  return `${gymCode}-${memberNumber}`;
}

function generateTempPassword() {
  // Generate 8-character temp password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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

async function sendCredentials(phone, email, memberId, tempPassword) {
  const message = `Welcome to GoGym! Your login credentials:
Member ID: ${memberId}
Password: ${tempPassword}
Download app: https://gogym.app/download
Change password on first login.`;
  
  // Send SMS and Email (implement with AWS SNS/SES)
  console.log('Sending credentials:', { phone, email, memberId, tempPassword });
}