const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        const { action } = JSON.parse(body);
        if (action === 'login') return await memberLogin(JSON.parse(body));
        if (action === 'change_password') return await changePassword(JSON.parse(body));
        break;
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function memberLogin(loginData) {
  const { memberId, password } = loginData;
  
  // Find user by member ID
  const userResult = await dynamodb.scan({
    TableName: 'gogym-users',
    FilterExpression: 'memberId = :memberId',
    ExpressionAttributeValues: { ':memberId': memberId }
  }).promise();
  
  if (userResult.Items.length === 0) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }
  
  const user = userResult.Items[0];
  
  // Check password (temp or hashed)
  let passwordValid = false;
  if (!user.passwordChanged) {
    // First login with temp password
    passwordValid = password === user.tempPassword;
  } else {
    // Regular login with hashed password
    passwordValid = await bcrypt.compare(password, user.hashedPassword);
  }
  
  if (!passwordValid) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }
  
  // Get membership details
  const membership = await dynamodb.get({
    TableName: 'gogym-memberships',
    Key: { userId: user.userId }
  }).promise();
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.userId, memberId: user.memberId },
    'jwt_secret_key',
    { expiresIn: '24h' }
  );
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      token,
      user: {
        userId: user.userId,
        memberId: user.memberId,
        name: user.name,
        phone: user.phone,
        email: user.email
      },
      membership: membership.Item,
      requirePasswordChange: !user.passwordChanged
    })
  };
}

async function changePassword(passwordData) {
  const { memberId, currentPassword, newPassword } = passwordData;
  
  // Find user
  const userResult = await dynamodb.scan({
    TableName: 'gogym-users',
    FilterExpression: 'memberId = :memberId',
    ExpressionAttributeValues: { ':memberId': memberId }
  }).promise();
  
  if (userResult.Items.length === 0) {
    return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
  }
  
  const user = userResult.Items[0];
  
  // Verify current password
  let currentPasswordValid = false;
  if (!user.passwordChanged) {
    currentPasswordValid = currentPassword === user.tempPassword;
  } else {
    currentPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
  }
  
  if (!currentPasswordValid) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Current password incorrect' }) };
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update user record
  await dynamodb.update({
    TableName: 'gogym-users',
    Key: { userId: user.userId },
    UpdateExpression: 'SET hashedPassword = :hash, passwordChanged = :changed, tempPassword = :temp',
    ExpressionAttributeValues: {
      ':hash': hashedPassword,
      ':changed': true,
      ':temp': null
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Password changed successfully'
    })
  };
}