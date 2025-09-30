const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get nearby gyms
exports.getNearbyGyms = async (event) => {
    try {
        const { latitude, longitude, radius = 10 } = JSON.parse(event.body || '{}');
        
        const params = {
            TableName: 'GoGym-Gyms',
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Filter by distance (simplified - in production use geospatial queries)
        const gyms = result.Items.filter(gym => {
            if (!gym.latitude || !gym.longitude) return false;
            const distance = calculateDistance(latitude, longitude, gym.latitude, gym.longitude);
            return distance <= radius;
        });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ gyms })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get gym details
exports.getGymDetails = async (event) => {
    try {
        const { gymId } = event.pathParameters;
        
        const params = {
            TableName: 'GoGym-Gyms',
            Key: { gymId }
        };
        
        const result = await dynamodb.get(params).promise();
        
        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Gym not found' })
            };
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ gym: result.Item })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}