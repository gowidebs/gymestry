const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.LEADS_TABLE || 'gogym-leads';

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        return await getLeads(pathParameters);
      case 'POST':
        return await createLead(JSON.parse(body));
      case 'PUT':
        return await updateLead(pathParameters.id, JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getLeads(pathParameters) {
  if (pathParameters?.id) {
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: pathParameters.id }
    }).promise();
    return { statusCode: 200, body: JSON.stringify(result.Item) };
  }
  
  const result = await dynamodb.scan({ TableName: TABLE_NAME }).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function createLead(leadData) {
  const lead = {
    id: uuidv4(),
    ...leadData,
    status: leadData.status || 'Cold',
    source: leadData.source || 'Unknown',
    createdAt: new Date().toISOString(),
    followUpDate: leadData.followUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: lead
  }).promise();
  
  return { statusCode: 201, body: JSON.stringify(lead) };
}

async function updateLead(id, updates) {
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
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }).promise();
  
  return { statusCode: 200, body: JSON.stringify({ message: 'Lead updated' }) };
}