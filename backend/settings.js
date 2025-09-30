const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const SETTINGS_TABLE = 'gogym-settings';

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        return await getSettings(pathParameters);
      case 'PUT':
        return await updateSettings(pathParameters.category, JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getSettings(pathParameters) {
  if (pathParameters?.category) {
    const result = await dynamodb.get({
      TableName: SETTINGS_TABLE,
      Key: { category: pathParameters.category }
    }).promise();
    return { statusCode: 200, body: JSON.stringify(result.Item) };
  }
  
  const result = await dynamodb.scan({ TableName: SETTINGS_TABLE }).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function updateSettings(category, settings) {
  const settingsData = {
    category,
    ...settings,
    updatedAt: new Date().toISOString()
  };
  
  await dynamodb.put({
    TableName: SETTINGS_TABLE,
    Item: settingsData
  }).promise();
  
  return { statusCode: 200, body: JSON.stringify(settingsData) };
}