const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = 'gogym-users';

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        return await authenticate(JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function authenticate(authData) {
  const { phone, emiratesId, role } = authData;
  
  // Check if user exists
  const result = await dynamodb.scan({
    TableName: USERS_TABLE,
    FilterExpression: 'phone = :phone OR emirates_id = :emiratesId',
    ExpressionAttributeValues: {
      ':phone': phone,
      ':emiratesId': emiratesId
    }
  }).promise();
  
  if (result.Items.length > 0) {
    const user = result.Items[0];
    return {
      statusCode: 200,
      body: JSON.stringify({
        user,
        token: generateToken(user.id),
        permissions: getRolePermissions(user.role)
      })
    };
  }
  
  // Create new user
  const newUser = {
    id: uuidv4(),
    ...authData,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  await dynamodb.put({
    TableName: USERS_TABLE,
    Item: newUser
  }).promise();
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      user: newUser,
      token: generateToken(newUser.id),
      permissions: getRolePermissions(role)
    })
  };
}

function generateToken(userId) {
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
}

function getRolePermissions(role) {
  const permissions = {
    'super_admin': ['all'],
    'owner': ['manage_branches', 'view_reports', 'manage_staff'],
    'receptionist': ['manage_leads', 'manage_members', 'handle_payments'],
    'trainer': ['manage_sessions', 'create_plans', 'view_schedules'],
    'member': ['check_in', 'view_plans', 'transfer_membership']
  };
  return permissions[role] || ['basic'];
}