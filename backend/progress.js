const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get user progress logs
exports.getProgressLogs = async (event) => {
    try {
        const { userId } = event.pathParameters;
        
        const result = await dynamodb.query({
            TableName: 'GoGym-ProgressLogs',
            IndexName: 'UserProgressIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise();
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ logs: result.Items })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Add progress log
exports.addProgressLog = async (event) => {
    try {
        const { userId, workoutType, duration, weight, notes } = JSON.parse(event.body);
        
        const logId = uuidv4();
        const log = {
            logId,
            userId,
            workoutType,
            duration,
            weight,
            notes,
            logDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            createdAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-ProgressLogs',
            Item: log
        }).promise();
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ log })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get user stats
exports.getUserStats = async (event) => {
    try {
        const { userId } = event.pathParameters;
        
        const result = await dynamodb.query({
            TableName: 'GoGym-ProgressLogs',
            IndexName: 'UserProgressIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        
        const logs = result.Items;
        const totalWorkouts = logs.length;
        const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const latestWeight = logs
            .filter(log => log.weight)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.weight;
        
        // Calculate streak (consecutive days with workouts)
        const streak = calculateWorkoutStreak(logs);
        
        const stats = {
            totalWorkouts,
            totalDuration,
            currentWeight: latestWeight,
            workoutStreak: streak
        };
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ stats })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function calculateWorkoutStreak(logs) {
    if (logs.length === 0) return 0;
    
    // Sort logs by date (newest first)
    const sortedLogs = logs.sort((a, b) => new Date(b.logDate) - new Date(a.logDate));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const log of sortedLogs) {
        const logDate = new Date(log.logDate);
        logDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}