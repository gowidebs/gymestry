const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const seedData = async () => {
    // Seed Gyms
    const gyms = [
        {
            gymId: uuidv4(),
            name: "Fitness First Dubai Mall",
            description: "Premium fitness center with modern equipment and professional trainers",
            address: "Dubai Mall, Downtown Dubai, UAE",
            latitude: 25.1972,
            longitude: 55.2744,
            rating: 4.5,
            phone: "+971501234567",
            images: ["https://via.placeholder.com/400x200"],
            createdAt: new Date().toISOString()
        },
        {
            gymId: uuidv4(),
            name: "Gold's Gym Marina",
            description: "World-class gym with state-of-the-art facilities",
            address: "Dubai Marina Mall, Dubai Marina, UAE",
            latitude: 25.0657,
            longitude: 55.1393,
            rating: 4.3,
            phone: "+971507654321",
            images: ["https://via.placeholder.com/400x200"],
            createdAt: new Date().toISOString()
        },
        {
            gymId: uuidv4(),
            name: "CrossFit Box JLT",
            description: "Authentic CrossFit training in Jumeirah Lake Towers",
            address: "Jumeirah Lake Towers, Dubai, UAE",
            latitude: 25.0693,
            longitude: 55.1429,
            rating: 4.7,
            phone: "+971509876543",
            images: ["https://via.placeholder.com/400x200"],
            createdAt: new Date().toISOString()
        }
    ];

    // Insert gyms
    for (const gym of gyms) {
        await dynamodb.put({
            TableName: 'GoGym-Gyms',
            Item: gym
        }).promise();
        console.log(`Inserted gym: ${gym.name}`);
    }

    console.log('Seed data inserted successfully!');
};

seedData().catch(console.error);