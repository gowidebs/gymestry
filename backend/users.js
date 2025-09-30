const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Create user
exports.createUser = async (event) => {
    try {
        const { name, email, phone } = JSON.parse(event.body);
        
        const userId = uuidv4();
        const user = {
            userId,
            name,
            email,
            phone,
            isPro: false,
            createdAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-Users',
            Item: user
        }).promise();
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ user })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Update Pro subscription
exports.updateProSubscription = async (event) => {
    try {
        const { userId } = event.pathParameters;
        const { isPro, proExpiry } = JSON.parse(event.body);
        
        await dynamodb.update({
            TableName: 'GoGym-Users',
            Key: { userId },
            UpdateExpression: 'SET isPro = :isPro, proExpiry = :proExpiry',
            ExpressionAttributeValues: {
                ':isPro': isPro,
                ':proExpiry': proExpiry
            }
        }).promise();
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};