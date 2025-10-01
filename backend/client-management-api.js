const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
let clients = [
    {
        id: 1,
        name: "Ahmed Al-Mansouri",
        email: "ahmed.mansouri@email.com",
        phone: "+971501234567",
        age: 32,
        gender: "male",
        joinDate: "2024-01-15",
        trainerId: 1,
        trainerName: "Mike Wilson",
        status: "active",
        membershipType: "Premium PT",
        emergencyContact: "Fatima Al-Mansouri - +971509876543",
        medicalNotes: "No known allergies, previous knee injury",
        currentWeight: 78,
        targetWeight: 75,
        height: 175,
        bodyFat: 18.5,
        sessionsCompleted: 24,
        sessionsRemaining: 8
    },
    {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+971507654321",
        age: 28,
        gender: "female",
        joinDate: "2024-02-20",
        trainerId: 1,
        trainerName: "Mike Wilson",
        status: "active",
        membershipType: "Standard PT",
        emergencyContact: "John Johnson - +971501122334",
        medicalNotes: "Asthma, uses inhaler",
        currentWeight: 62,
        targetWeight: 58,
        height: 165,
        bodyFat: 22.3,
        sessionsCompleted: 16,
        sessionsRemaining: 12
    }
];

let trainingHistory = [
    {
        id: 1,
        clientId: 1,
        date: "2024-12-20",
        duration: 60,
        type: "Strength Training",
        exercises: ["Bench Press", "Squats", "Deadlifts", "Pull-ups"],
        notes: "Great progress on bench press, increased weight by 5kg",
        caloriesBurned: 420,
        heartRateAvg: 145,
        trainerId: 1
    },
    {
        id: 2,
        clientId: 1,
        date: "2024-12-18",
        duration: 45,
        type: "Cardio",
        exercises: ["Treadmill", "Rowing Machine", "Cycling"],
        notes: "Improved endurance, completed full session without breaks",
        caloriesBurned: 380,
        heartRateAvg: 155,
        trainerId: 1
    }
];

let progressPhotos = [
    {
        id: 1,
        clientId: 1,
        date: "2024-12-01",
        type: "front",
        filename: "ahmed_front_dec2024.jpg",
        notes: "Monthly progress photo - front view",
        weight: 78.5,
        bodyFat: 19.2
    },
    {
        id: 2,
        clientId: 1,
        date: "2024-12-01",
        type: "side",
        filename: "ahmed_side_dec2024.jpg",
        notes: "Monthly progress photo - side view",
        weight: 78.5,
        bodyFat: 19.2
    }
];

let goals = [
    {
        id: 1,
        clientId: 1,
        title: "Weight Loss",
        description: "Lose 3kg and reduce body fat to 15%",
        targetValue: 75,
        currentValue: 78,
        unit: "kg",
        targetDate: "2025-03-15",
        status: "in-progress",
        progress: 0,
        createdDate: "2024-01-15"
    },
    {
        id: 2,
        clientId: 1,
        title: "Strength Improvement",
        description: "Bench press 100kg for 3 reps",
        targetValue: 100,
        currentValue: 85,
        unit: "kg",
        targetDate: "2025-02-28",
        status: "in-progress",
        progress: 85,
        createdDate: "2024-01-15"
    }
];

let communications = [
    {
        id: 1,
        clientId: 1,
        date: "2024-12-20",
        type: "session_feedback",
        message: "Great session today! Your form on squats has improved significantly.",
        sender: "trainer",
        trainerId: 1,
        read: true
    },
    {
        id: 2,
        clientId: 1,
        date: "2024-12-19",
        type: "nutrition_advice",
        message: "Remember to increase protein intake to 1.6g per kg body weight for better recovery.",
        sender: "trainer",
        trainerId: 1,
        read: true
    }
];

// Get all clients
app.get('/api/clients', (req, res) => {
    const { trainerId, status } = req.query;
    let filteredClients = clients;
    
    if (trainerId) filteredClients = filteredClients.filter(c => c.trainerId == trainerId);
    if (status) filteredClients = filteredClients.filter(c => c.status === status);
    
    res.json(filteredClients);
});

// Add new client
app.post('/api/clients', (req, res) => {
    const newClient = {
        id: clients.length + 1,
        ...req.body,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        sessionsCompleted: 0,
        sessionsRemaining: req.body.sessionsRemaining || 12
    };
    clients.push(newClient);
    res.json(newClient);
});

// Update client
app.put('/api/clients/:id', (req, res) => {
    const clientIndex = clients.findIndex(c => c.id == req.params.id);
    if (clientIndex === -1) return res.status(404).json({ error: 'Client not found' });
    
    clients[clientIndex] = { ...clients[clientIndex], ...req.body };
    res.json(clients[clientIndex]);
});

// Get training history
app.get('/api/clients/:id/training-history', (req, res) => {
    const clientTraining = trainingHistory.filter(t => t.clientId == req.params.id);
    res.json(clientTraining);
});

// Add training session
app.post('/api/clients/:id/training-history', (req, res) => {
    const newSession = {
        id: trainingHistory.length + 1,
        clientId: parseInt(req.params.id),
        date: new Date().toISOString().split('T')[0],
        ...req.body
    };
    trainingHistory.push(newSession);
    
    // Update client sessions
    const client = clients.find(c => c.id == req.params.id);
    if (client) {
        client.sessionsCompleted++;
        client.sessionsRemaining = Math.max(0, client.sessionsRemaining - 1);
    }
    
    res.json(newSession);
});

// Get progress photos
app.get('/api/clients/:id/progress-photos', (req, res) => {
    const clientPhotos = progressPhotos.filter(p => p.clientId == req.params.id);
    res.json(clientPhotos);
});

// Add progress photo
app.post('/api/clients/:id/progress-photos', (req, res) => {
    const newPhoto = {
        id: progressPhotos.length + 1,
        clientId: parseInt(req.params.id),
        date: new Date().toISOString().split('T')[0],
        ...req.body
    };
    progressPhotos.push(newPhoto);
    res.json(newPhoto);
});

// Get client goals
app.get('/api/clients/:id/goals', (req, res) => {
    const clientGoals = goals.filter(g => g.clientId == req.params.id);
    res.json(clientGoals);
});

// Add new goal
app.post('/api/clients/:id/goals', (req, res) => {
    const newGoal = {
        id: goals.length + 1,
        clientId: parseInt(req.params.id),
        createdDate: new Date().toISOString().split('T')[0],
        status: 'in-progress',
        progress: 0,
        ...req.body
    };
    goals.push(newGoal);
    res.json(newGoal);
});

// Update goal progress
app.put('/api/goals/:id', (req, res) => {
    const goalIndex = goals.findIndex(g => g.id == req.params.id);
    if (goalIndex === -1) return res.status(404).json({ error: 'Goal not found' });
    
    goals[goalIndex] = { ...goals[goalIndex], ...req.body };
    res.json(goals[goalIndex]);
});

// Get communications
app.get('/api/clients/:id/communications', (req, res) => {
    const clientComms = communications.filter(c => c.clientId == req.params.id);
    res.json(clientComms);
});

// Add communication
app.post('/api/clients/:id/communications', (req, res) => {
    const newComm = {
        id: communications.length + 1,
        clientId: parseInt(req.params.id),
        date: new Date().toISOString().split('T')[0],
        read: false,
        ...req.body
    };
    communications.push(newComm);
    res.json(newComm);
});

// Get client statistics
app.get('/api/clients/stats', (req, res) => {
    const { trainerId } = req.query;
    let filteredClients = clients;
    
    if (trainerId) filteredClients = filteredClients.filter(c => c.trainerId == trainerId);
    
    const stats = {
        totalClients: filteredClients.length,
        activeClients: filteredClients.filter(c => c.status === 'active').length,
        totalSessions: trainingHistory.filter(t => 
            trainerId ? filteredClients.some(c => c.id === t.clientId) : true
        ).length,
        avgSessionsPerClient: Math.round(
            trainingHistory.filter(t => 
                trainerId ? filteredClients.some(c => c.id === t.clientId) : true
            ).length / filteredClients.length
        ),
        goalsInProgress: goals.filter(g => 
            g.status === 'in-progress' && 
            (trainerId ? filteredClients.some(c => c.id === g.clientId) : true)
        ).length,
        goalsCompleted: goals.filter(g => 
            g.status === 'completed' && 
            (trainerId ? filteredClients.some(c => c.id === g.clientId) : true)
        ).length
    };
    
    res.json(stats);
});

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
    console.log(`Client Management API running on port ${PORT}`);
});