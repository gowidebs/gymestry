const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PROMOTIONS_TABLE = 'gogym-promotions';
const NOTIFICATIONS_TABLE = 'gogym-notifications';

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        return await getPromotions(pathParameters);
      case 'POST':
        return pathParameters?.type === 'notification' ? await sendNotification(JSON.parse(body)) : await createPromotion(JSON.parse(body));
      case 'PUT':
        return await updatePromotion(pathParameters.id, JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getPromotions(pathParameters) {
  const type = pathParameters?.type;
  
  if (type === 'referrals') {
    const result = await dynamodb.scan({
      TableName: PROMOTIONS_TABLE,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: { ':type': 'referral' }
    }).promise();
    return { statusCode: 200, body: JSON.stringify(result.Items) };
  }
  
  if (type === 'trials') {
    const result = await dynamodb.scan({
      TableName: PROMOTIONS_TABLE,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: { ':type': 'trial' }
    }).promise();
    return { statusCode: 200, body: JSON.stringify(result.Items) };
  }
  
  const result = await dynamodb.scan({ TableName: PROMOTIONS_TABLE }).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function createPromotion(promotionData) {
  const promotion = {
    id: uuidv4(),
    ...promotionData,
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  await dynamodb.put({
    TableName: PROMOTIONS_TABLE,
    Item: promotion
  }).promise();
  
  return { statusCode: 201, body: JSON.stringify(promotion) };
}

async function updatePromotion(id, updates) {
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
    TableName: PROMOTIONS_TABLE,
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }).promise();
  
  return { statusCode: 200, body: JSON.stringify({ message: 'Promotion updated' }) };
}

async function sendNotification(notificationData) {
  const notification = {
    id: uuidv4(),
    ...notificationData,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };
  
  await dynamodb.put({
    TableName: NOTIFICATIONS_TABLE,
    Item: notification
  }).promise();
  
  return { statusCode: 201, body: JSON.stringify(notification) };
}