const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get social feed posts
exports.getFeedPosts = async (event) => {
    try {
        const result = await dynamodb.scan({
            TableName: 'GoGym-Posts',
            ScanIndexForward: false
        }).promise();
        
        // Sort by creation date (newest first)
        const posts = result.Items.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ posts })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Create new post
exports.createPost = async (event) => {
    try {
        const { userId, content, imageUrl } = JSON.parse(event.body);
        
        const postId = uuidv4();
        const post = {
            postId,
            userId,
            content,
            imageUrl,
            likesCount: 0,
            createdAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-Posts',
            Item: post
        }).promise();
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ post })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Like/unlike post
exports.likePost = async (event) => {
    try {
        const { postId } = event.pathParameters;
        const { userId } = JSON.parse(event.body);
        
        // Update likes count
        await dynamodb.update({
            TableName: 'GoGym-Posts',
            Key: { postId },
            UpdateExpression: 'ADD likesCount :inc',
            ExpressionAttributeValues: {
                ':inc': 1
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