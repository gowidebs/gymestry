const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const MEMBERSHIPS_TABLE = 'gogym-memberships';

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        return await freezeMembership(pathParameters.userId, JSON.parse(body));
      case 'PUT':
        return await unfreezeMembership(pathParameters.userId);
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function freezeMembership(userId, freezeData) {
  // Get membership
  const result = await dynamodb.get({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId }
  }).promise();
  
  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Membership not found' })
    };
  }
  
  const membership = result.Item;
  
  // Check if yearly plan
  if (membership.type !== 'yearly') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Only yearly memberships can be frozen' })
    };
  }
  
  // Check if already frozen once
  if (membership.freezeHistory && membership.freezeHistory.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Membership can only be frozen once per year' })
    };
  }
  
  const freezeRecord = {
    freezeDate: new Date().toISOString(),
    reason: freezeData.reason || 'Member request',
    duration: 30, // 1 month in days
    resumeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  // Update membership
  await dynamodb.update({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET #status = :status, freezeRecord = :freeze, freezeHistory = list_append(if_not_exists(freezeHistory, :empty), :history)',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'frozen',
      ':freeze': freezeRecord,
      ':empty': [],
      ':history': [freezeRecord]
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Membership frozen for 1 month',
      resumeDate: freezeRecord.resumeDate
    })
  };
}

async function unfreezeMembership(userId) {
  const result = await dynamodb.get({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId }
  }).promise();
  
  if (!result.Item || result.Item.status !== 'frozen') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Membership is not frozen' })
    };
  }
  
  const membership = result.Item;
  const freezeDays = Math.floor((Date.now() - new Date(membership.freezeRecord.freezeDate).getTime()) / (24 * 60 * 60 * 1000));
  
  // Extend expiry date by freeze duration
  const currentExpiry = new Date(membership.expiryDate);
  const newExpiry = new Date(currentExpiry.getTime() + freezeDays * 24 * 60 * 60 * 1000);
  
  await dynamodb.update({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET #status = :status, expiryDate = :expiry, unfreezeDate = :unfreeze REMOVE freezeRecord',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'active',
      ':expiry': newExpiry.toISOString(),
      ':unfreeze': new Date().toISOString()
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Membership unfrozen',
      newExpiryDate: newExpiry.toISOString(),
      daysExtended: freezeDays
    })
  };
}