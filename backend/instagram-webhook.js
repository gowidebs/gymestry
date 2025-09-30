const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const INSTAGRAM_MESSAGES_TABLE = 'gogym-instagram-messages';

exports.handler = async (event) => {
  const { httpMethod, body, queryStringParameters } = event;
  
  try {
    if (httpMethod === 'GET') {
      // Webhook verification
      const mode = queryStringParameters['hub.mode'];
      const token = queryStringParameters['hub.verify_token'];
      const challenge = queryStringParameters['hub.challenge'];
      
      if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
        return {
          statusCode: 200,
          body: challenge
        };
      }
      return { statusCode: 403, body: 'Forbidden' };
    }
    
    if (httpMethod === 'POST') {
      // Handle incoming messages
      const data = JSON.parse(body);
      
      if (data.object === 'instagram') {
        for (const entry of data.entry) {
          if (entry.messaging) {
            for (const message of entry.messaging) {
              await processInstagramMessage(message);
            }
          }
        }
      }
      
      return { statusCode: 200, body: 'OK' };
    }
    
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function processInstagramMessage(message) {
  const messageData = {
    id: uuidv4(),
    instagramId: message.sender.id,
    username: await getInstagramUsername(message.sender.id),
    message: message.message?.text || 'Media message',
    timestamp: new Date(message.timestamp).toISOString(),
    isRead: false,
    isLead: false,
    branchId: 'branch1' // Default branch, can be configured
  };
  
  await dynamodb.put({
    TableName: INSTAGRAM_MESSAGES_TABLE,
    Item: messageData
  }).promise();
  
  // Auto-detect potential leads
  if (isLeadMessage(messageData.message)) {
    messageData.isLead = true;
    await createLeadFromMessage(messageData);
  }
  
  return messageData;
}

async function getInstagramUsername(userId) {
  // In real implementation, use Instagram Graph API
  // For demo, return mock username
  return `user_${userId.substring(0, 8)}`;
}

function isLeadMessage(message) {
  const leadKeywords = [
    'membership', 'price', 'cost', 'join', 'sign up', 'register',
    'trial', 'free', 'discount', 'offer', 'class', 'trainer',
    'gym', 'fitness', 'workout', 'schedule', 'timing'
  ];
  
  return leadKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

async function createLeadFromMessage(messageData) {
  const lead = {
    id: uuidv4(),
    name: messageData.username,
    phone: '', // Will be collected later
    source: 'Instagram',
    status: 'Cold',
    message: messageData.message,
    instagramId: messageData.instagramId,
    createdAt: messageData.timestamp,
    branchId: messageData.branchId
  };
  
  await dynamodb.put({
    TableName: 'gogym-leads',
    Item: lead
  }).promise();
  
  return lead;
}