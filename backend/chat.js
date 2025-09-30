const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Create chat session
exports.createChatSession = async (event) => {
    try {
        const { userId, type = 'support' } = JSON.parse(event.body);
        
        const sessionId = uuidv4();
        const session = {
            sessionId,
            userId,
            type, // support, trainer, sales
            status: 'active',
            createdAt: new Date().toISOString(),
            respondIoWebhook: process.env.RESPOND_IO_WEBHOOK
        };
        
        await dynamodb.put({
            TableName: 'GoGym-ChatSessions',
            Item: session
        }).promise();
        
        // Trigger Respond.io webhook
        await triggerRespondIo(session);
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ session })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Send message
exports.sendMessage = async (event) => {
    try {
        const { sessionId } = event.pathParameters;
        const { userId, message, type = 'user' } = JSON.parse(event.body);
        
        const messageId = uuidv4();
        const chatMessage = {
            messageId,
            sessionId,
            userId,
            message,
            type, // user, agent, system
            timestamp: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-ChatMessages',
            Item: chatMessage
        }).promise();
        
        // Send to Respond.io
        await sendToRespondIo(sessionId, message, type);
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: chatMessage })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get chat messages
exports.getChatMessages = async (event) => {
    try {
        const { sessionId } = event.pathParameters;
        
        const result = await dynamodb.query({
            TableName: 'GoGym-ChatMessages',
            IndexName: 'SessionMessagesIndex',
            KeyConditionExpression: 'sessionId = :sessionId',
            ExpressionAttributeValues: {
                ':sessionId': sessionId
            },
            ScanIndexForward: true
        }).promise();
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ messages: result.Items })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function triggerRespondIo(session) {
    // Integration with Respond.io webhook
    const webhook = process.env.RESPOND_IO_WEBHOOK;
    if (!webhook) return;
    
    const payload = {
        event: 'chat_started',
        sessionId: session.sessionId,
        userId: session.userId,
        type: session.type,
        timestamp: session.createdAt
    };
    
    // Send webhook (implement HTTP request)
    console.log('Respond.io webhook triggered:', payload);
}

async function sendToRespondIo(sessionId, message, type) {
    // Send message to Respond.io
    console.log(`Respond.io message: ${sessionId} - ${message} (${type})`);
}