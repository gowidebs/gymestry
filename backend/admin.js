const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get dashboard stats
exports.getDashboardStats = async (event) => {
    try {
        // Get total bookings
        const bookingsResult = await dynamodb.scan({
            TableName: 'GoGym-Bookings'
        }).promise();
        
        // Get total users
        const usersResult = await dynamodb.scan({
            TableName: 'GoGym-Users'
        }).promise();
        
        // Get total gyms
        const gymsResult = await dynamodb.scan({
            TableName: 'GoGym-Gyms'
        }).promise();
        
        // Calculate stats
        const totalBookings = bookingsResult.Items.length;
        const totalUsers = usersResult.Items.length;
        const proUsers = usersResult.Items.filter(user => user.isPro).length;
        const totalGyms = gymsResult.Items.length;
        
        // Mock revenue calculation (in real app, get from payments table)
        const totalRevenue = totalBookings * 55; // Average booking price
        const proRevenue = proUsers * 299; // Pro plan price
        
        const stats = {
            totalRevenue: totalRevenue + proRevenue,
            totalBookings,
            activeUsers: totalUsers,
            proSubscribers: proUsers,
            totalGyms,
            conversionRate: totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0
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

// Get revenue analytics
exports.getRevenueAnalytics = async (event) => {
    try {
        // Mock 7-day revenue data (in real app, query by date range)
        const revenueData = [
            { date: '2024-07-18', amount: 5200 },
            { date: '2024-07-19', amount: 6800 },
            { date: '2024-07-20', amount: 7200 },
            { date: '2024-07-21', amount: 6500 },
            { date: '2024-07-22', amount: 8100 },
            { date: '2024-07-23', amount: 9200 },
            { date: '2024-07-24', amount: 7800 }
        ];
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ revenueData })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get gym analytics
exports.getGymAnalytics = async (event) => {
    try {
        const gymsResult = await dynamodb.scan({
            TableName: 'GoGym-Gyms'
        }).promise();
        
        const bookingsResult = await dynamodb.scan({
            TableName: 'GoGym-Bookings'
        }).promise();
        
        // Calculate bookings per gym
        const gymAnalytics = gymsResult.Items.map(gym => {
            const gymBookings = bookingsResult.Items.filter(booking => 
                booking.gymId === gym.gymId
            ).length;
            
            return {
                ...gym,
                totalBookings: gymBookings,
                revenue: gymBookings * 55 // Average booking price
            };
        });
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ gymAnalytics })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get booking reports
exports.getBookingReports = async (event) => {
    try {
        const bookingsResult = await dynamodb.scan({
            TableName: 'GoGym-Bookings'
        }).promise();
        
        const usersResult = await dynamodb.scan({
            TableName: 'GoGym-Users'
        }).promise();
        
        const gymsResult = await dynamodb.scan({
            TableName: 'GoGym-Gyms'
        }).promise();
        
        // Create user and gym lookup maps
        const userMap = {};
        usersResult.Items.forEach(user => {
            userMap[user.userId] = user.name;
        });
        
        const gymMap = {};
        gymsResult.Items.forEach(gym => {
            gymMap[gym.gymId] = gym.name;
        });
        
        // Enrich booking data
        const enrichedBookings = bookingsResult.Items.map(booking => ({
            ...booking,
            userName: userMap[booking.userId] || 'Unknown User',
            gymName: gymMap[booking.gymId] || 'Unknown Gym',
            amount: 55 // Mock amount
        }));
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ bookings: enrichedBookings })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};