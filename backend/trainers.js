const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get available trainers
exports.getTrainers = async (event) => {
    try {
        const { specialty, location } = event.queryStringParameters || {};
        
        let params = {
            TableName: 'GoGym-Trainers'
        };
        
        if (specialty) {
            params.FilterExpression = 'contains(specialties, :specialty)';
            params.ExpressionAttributeValues = {
                ':specialty': specialty
            };
        }
        
        const result = await dynamodb.scan(params).promise();
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ trainers: result.Items })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Book trainer session
exports.bookTrainerSession = async (event) => {
    try {
        const { userId, trainerId, sessionDate, sessionTime, duration, sessionType } = JSON.parse(event.body);
        
        const bookingId = uuidv4();
        const booking = {
            bookingId,
            userId,
            trainerId,
            sessionDate,
            sessionTime,
            duration,
            sessionType, // personal, group, online
            status: 'confirmed',
            price: calculateTrainerPrice(sessionType, duration),
            createdAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-TrainerBookings',
            Item: booking
        }).promise();
        
        // Send to CRM for sales tracking
        await trackTrainerBooking(booking);
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ booking })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get trainer availability
exports.getTrainerAvailability = async (event) => {
    try {
        const { trainerId } = event.pathParameters;
        const { date } = event.queryStringParameters || {};
        
        const result = await dynamodb.query({
            TableName: 'GoGym-TrainerBookings',
            IndexName: 'TrainerDateIndex',
            KeyConditionExpression: 'trainerId = :trainerId AND sessionDate = :date',
            ExpressionAttributeValues: {
                ':trainerId': trainerId,
                ':date': date || new Date().toISOString().split('T')[0]
            }
        }).promise();
        
        const bookedSlots = result.Items.map(item => item.sessionTime);
        const availableSlots = generateAvailableSlots(bookedSlots);
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ availableSlots, bookedSlots })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function calculateTrainerPrice(sessionType, duration) {
    const rates = {
        personal: 150, // AED per hour
        group: 75,
        online: 100
    };
    
    return (rates[sessionType] || 150) * (duration / 60);
}

function generateAvailableSlots(bookedSlots) {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        if (!bookedSlots.includes(timeSlot)) {
            slots.push(timeSlot);
        }
    }
    return slots;
}

async function trackTrainerBooking(booking) {
    // Send to CRM for sales conversion tracking
    const crmData = {
        event: 'trainer_booking',
        userId: booking.userId,
        trainerId: booking.trainerId,
        revenue: booking.price,
        sessionType: booking.sessionType,
        timestamp: booking.createdAt
    };
    
    console.log('CRM Trainer Booking:', crmData);
}