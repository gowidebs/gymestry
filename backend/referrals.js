const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Generate referral code
exports.generateReferralCode = async (event) => {
    try {
        const { userId } = event.pathParameters;
        
        const referralCode = generateCode();
        const referral = {
            referralId: uuidv4(),
            userId,
            referralCode,
            totalReferrals: 0,
            totalRewards: 0,
            createdAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-Referrals',
            Item: referral
        }).promise();
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ referral })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Use referral code
exports.useReferralCode = async (event) => {
    try {
        const { referralCode, newUserId } = JSON.parse(event.body);
        
        // Find referral
        const result = await dynamodb.scan({
            TableName: 'GoGym-Referrals',
            FilterExpression: 'referralCode = :code',
            ExpressionAttributeValues: {
                ':code': referralCode
            }
        }).promise();
        
        if (result.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Invalid referral code' })
            };
        }
        
        const referral = result.Items[0];
        
        // Create referral record
        const referralRecord = {
            recordId: uuidv4(),
            referrerId: referral.userId,
            referredUserId: newUserId,
            referralCode,
            reward: 50, // AED reward
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-ReferralRecords',
            Item: referralRecord
        }).promise();
        
        // Update referral stats
        await dynamodb.update({
            TableName: 'GoGym-Referrals',
            Key: { referralId: referral.referralId },
            UpdateExpression: 'ADD totalReferrals :inc, totalRewards :reward',
            ExpressionAttributeValues: {
                ':inc': 1,
                ':reward': 50
            }
        }).promise();
        
        // Send to CRM for conversion tracking
        await trackReferralConversion(referral.userId, newUserId, referralCode);
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                success: true, 
                reward: 50,
                message: 'Referral applied successfully!' 
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get user referrals
exports.getUserReferrals = async (event) => {
    try {
        const { userId } = event.pathParameters;
        
        const referralResult = await dynamodb.scan({
            TableName: 'GoGym-Referrals',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        
        const recordsResult = await dynamodb.scan({
            TableName: 'GoGym-ReferralRecords',
            FilterExpression: 'referrerId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                referral: referralResult.Items[0],
                records: recordsResult.Items 
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function generateCode() {
    return 'GG' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function trackReferralConversion(referrerId, newUserId, code) {
    // Send to CRM system for conversion tracking
    const crmData = {
        event: 'referral_conversion',
        referrerId,
        newUserId,
        referralCode: code,
        timestamp: new Date().toISOString(),
        source: 'gogym_app'
    };
    
    console.log('CRM Conversion Tracking:', crmData);
    // Implement CRM webhook/API call
}