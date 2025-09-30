const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const MEMBERSHIPS_TABLE = 'gogym-memberships';

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        return await getMemberships(pathParameters);
      case 'POST':
        return await createMembership(JSON.parse(body));
      case 'PUT':
        return pathParameters?.action === 'freeze' ? await freezeMembership(pathParameters.id, JSON.parse(body)) : await updateMembership(pathParameters.id, JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getMemberships(pathParameters) {
  if (pathParameters?.id) {
    const result = await dynamodb.get({
      TableName: MEMBERSHIPS_TABLE,
      Key: { id: pathParameters.id }
    }).promise();
    return { statusCode: 200, body: JSON.stringify(result.Item) };
  }
  
  const result = await dynamodb.scan({ TableName: MEMBERSHIPS_TABLE }).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function createMembership(membershipData) {
  const membership = {
    id: uuidv4(),
    ...membershipData,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiryDate: calculateExpiryDate(membershipData.duration, membershipData.durationType)
  };
  
  await dynamodb.put({
    TableName: MEMBERSHIPS_TABLE,
    Item: membership
  }).promise();
  
  return { statusCode: 201, body: JSON.stringify(membership) };
}

async function updateMembership(id, updates) {
  const updateExpression = 'SET ' + Object.keys(updates).map(key => `#${key} = :${key}`).join(', ');
  const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
    acc[`#${key}`] = key;
    return acc;
  }, {});
  const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => {
    acc[`:${key}`] = updates[key];
    return acc;
  }, {});
  
  await dynamodb.update({
    TableName: MEMBERSHIPS_TABLE,
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }).promise();
  
  return { statusCode: 200, body: JSON.stringify({ message: 'Membership updated' }) };
}

async function freezeMembership(id, freezeData) {
  const freezeRecord = {
    freezeStartDate: new Date().toISOString(),
    freezeDuration: freezeData.duration,
    reason: freezeData.reason,
    status: 'frozen'
  };
  
  await dynamodb.update({
    TableName: MEMBERSHIPS_TABLE,
    Key: { id },
    UpdateExpression: 'SET #status = :status, freezeRecord = :freeze',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'frozen',
      ':freeze': freezeRecord
    }
  }).promise();
  
  return { statusCode: 200, body: JSON.stringify({ message: 'Membership frozen' }) };
}

function calculateExpiryDate(duration, durationType) {
  const now = new Date();
  switch (durationType) {
    case 'days':
      return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).toISOString();
    case 'months':
      return new Date(now.setMonth(now.getMonth() + duration)).toISOString();
    case 'years':
      return new Date(now.setFullYear(now.getFullYear() + duration)).toISOString();
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}