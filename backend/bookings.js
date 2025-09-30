const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Create booking
exports.createBooking = async (event) => {
    try {
        const { userId, scheduleId, classId } = JSON.parse(event.body);
        
        const bookingId = uuidv4();
        const booking = {
            bookingId,
            userId,
            scheduleId,
            classId,
            status: 'confirmed',
            bookingDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        const params = {
            TableName: 'GoGym-Bookings',
            Item: booking
        };
        
        await dynamodb.put(params).promise();
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ booking })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get user bookings
exports.getUserBookings = async (event) => {
    try {
        const { userId } = event.pathParameters;
        
        const params = {
            TableName: 'GoGym-Bookings',
            IndexName: 'UserBookingsIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
        
        const result = await dynamodb.query(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ bookings: result.Items })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Cancel booking
exports.cancelBooking = async (event) => {
    try {
        const { bookingId } = event.pathParameters;
        
        const params = {
            TableName: 'GoGym-Bookings',
            Key: { bookingId },
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'cancelled'
            },
            ReturnValues: 'ALL_NEW'
        };
        
        const result = await dynamodb.update(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ booking: result.Attributes })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};