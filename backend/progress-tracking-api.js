const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
let bodyMeasurements = [
    {
        id: 1,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        date: "2024-12-20",
        weight: 78.0,
        bodyFat: 18.5,
        muscleMass: 63.6,
        chest: 102,
        waist: 85,
        hips: 98,
        biceps: 35,
        thighs: 58,
        height: 175,
        bmi: 25.5,
        visceralFat: 8
    },
    {
        id: 2,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        date: "2024-11-20",
        weight: 80.2,
        bodyFat: 20.1,
        muscleMass: 62.8,
        chest: 104,
        waist: 88,
        hips: 100,
        biceps: 34,
        thighs: 59,
        height: 175,
        bmi: 26.2,
        visceralFat: 9
    }
];

let strengthProgress = [
    {
        id: 1,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        exercise: "Bench Press",
        date: "2024-12-20",
        weight: 85,
        reps: 8,
        sets: 3,
        oneRepMax: 106,
        volume: 2040,
        personalRecord: true
    },
    {
        id: 2,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        exercise: "Squats",
        date: "2024-12-20",
        weight: 120,
        reps: 10,
        sets: 3,
        oneRepMax: 160,
        volume: 3600,
        personalRecord: false
    },
    {
        id: 3,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        exercise: "Bench Press",
        date: "2024-11-20",
        weight: 80,
        reps: 8,
        sets: 3,
        oneRepMax: 100,
        volume: 1920,
        personalRecord: false
    }
];

let cardioProgress = [
    {
        id: 1,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        exercise: "Treadmill Run",
        date: "2024-12-20",
        duration: 30,
        distance: 5.2,
        avgHeartRate: 155,
        maxHeartRate: 175,
        caloriesBurned: 420,
        avgPace: "5:46",
        personalRecord: true
    },
    {
        id: 2,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        exercise: "Cycling",
        date: "2024-12-18",
        duration: 45,
        distance: 15.8,
        avgHeartRate: 145,
        maxHeartRate: 165,
        caloriesBurned: 380,
        avgPace: "2:51",
        personalRecord: false
    }
];

let progressPhotos = [
    {
        id: 1,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        date: "2024-12-01",
        type: "front",
        filename: "ahmed_front_dec2024.jpg",
        weight: 78.5,
        bodyFat: 19.2,
        notes: "Monthly progress photo - visible muscle definition improvement"
    },
    {
        id: 2,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        date: "2024-11-01",
        type: "front",
        filename: "ahmed_front_nov2024.jpg",
        weight: 80.8,
        bodyFat: 20.8,
        notes: "Starting to see definition in abs"
    }
];

let goalMilestones = [
    {
        id: 1,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        goalTitle: "Weight Loss Goal",
        milestoneTitle: "Lost 2kg",
        targetValue: 75,
        currentValue: 78,
        startValue: 82,
        achievedDate: "2024-12-15",
        status: "achieved",
        category: "weight",
        reward: "New workout gear"
    },
    {
        id: 2,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        goalTitle: "Strength Goal",
        milestoneTitle: "Bench Press 100kg",
        targetValue: 100,
        currentValue: 106,
        startValue: 75,
        achievedDate: "2024-12-10",
        status: "achieved",
        category: "strength",
        reward: "Personal training session"
    }
];

// Get body measurements
app.get('/api/clients/:clientId/measurements', (req, res) => {
    const measurements = bodyMeasurements.filter(m => m.clientId == req.params.clientId);
    res.json(measurements.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Add body measurement
app.post('/api/clients/:clientId/measurements', (req, res) => {
    const newMeasurement = {
        id: bodyMeasurements.length + 1,
        clientId: parseInt(req.params.clientId),
        date: new Date().toISOString().split('T')[0],
        ...req.body
    };
    
    // Calculate BMI
    if (newMeasurement.weight && newMeasurement.height) {
        const heightInM = newMeasurement.height / 100;
        newMeasurement.bmi = parseFloat((newMeasurement.weight / (heightInM * heightInM)).toFixed(1));
    }
    
    bodyMeasurements.push(newMeasurement);
    res.json(newMeasurement);
});

// Get strength progress
app.get('/api/clients/:clientId/strength', (req, res) => {
    const { exercise } = req.query;
    let progress = strengthProgress.filter(s => s.clientId == req.params.clientId);
    
    if (exercise) progress = progress.filter(s => s.exercise === exercise);
    
    res.json(progress.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Add strength progress
app.post('/api/clients/:clientId/strength', (req, res) => {
    const newProgress = {
        id: strengthProgress.length + 1,
        clientId: parseInt(req.params.clientId),
        date: new Date().toISOString().split('T')[0],
        ...req.body
    };
    
    // Calculate 1RM using Epley formula
    newProgress.oneRepMax = Math.round(newProgress.weight * (1 + newProgress.reps / 30));
    
    // Calculate volume
    newProgress.volume = newProgress.weight * newProgress.reps * newProgress.sets;
    
    // Check if it's a personal record
    const previousRecords = strengthProgress.filter(s => 
        s.clientId == req.params.clientId && 
        s.exercise === newProgress.exercise
    );
    
    const maxPreviousWeight = Math.max(...previousRecords.map(r => r.weight), 0);
    newProgress.personalRecord = newProgress.weight > maxPreviousWeight;
    
    strengthProgress.push(newProgress);
    res.json(newProgress);
});

// Get cardio progress
app.get('/api/clients/:clientId/cardio', (req, res) => {
    const { exercise } = req.query;
    let progress = cardioProgress.filter(c => c.clientId == req.params.clientId);
    
    if (exercise) progress = progress.filter(c => c.exercise === exercise);
    
    res.json(progress.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Add cardio progress
app.post('/api/clients/:clientId/cardio', (req, res) => {
    const newProgress = {
        id: cardioProgress.length + 1,
        clientId: parseInt(req.params.clientId),
        date: new Date().toISOString().split('T')[0],
        ...req.body
    };
    
    // Check if it's a personal record (best distance or time)
    const previousRecords = cardioProgress.filter(c => 
        c.clientId == req.params.clientId && 
        c.exercise === newProgress.exercise
    );
    
    const maxPreviousDistance = Math.max(...previousRecords.map(r => r.distance), 0);
    newProgress.personalRecord = newProgress.distance > maxPreviousDistance;
    
    cardioProgress.push(newProgress);
    res.json(newProgress);
});

// Get progress photos
app.get('/api/clients/:clientId/photos', (req, res) => {
    const photos = progressPhotos.filter(p => p.clientId == req.params.clientId);
    res.json(photos.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Add progress photo
app.post('/api/clients/:clientId/photos', (req, res) => {
    const newPhoto = {
        id: progressPhotos.length + 1,
        clientId: parseInt(req.params.clientId),
        date: new Date().toISOString().split('T')[0],
        ...req.body
    };
    progressPhotos.push(newPhoto);
    res.json(newPhoto);
});

// Get goal milestones
app.get('/api/clients/:clientId/milestones', (req, res) => {
    const milestones = goalMilestones.filter(m => m.clientId == req.params.clientId);
    res.json(milestones.sort((a, b) => new Date(b.achievedDate) - new Date(a.achievedDate)));
});

// Add milestone
app.post('/api/clients/:clientId/milestones', (req, res) => {
    const newMilestone = {
        id: goalMilestones.length + 1,
        clientId: parseInt(req.params.clientId),
        achievedDate: new Date().toISOString().split('T')[0],
        status: 'achieved',
        ...req.body
    };
    goalMilestones.push(newMilestone);
    res.json(newMilestone);
});

// Get progress summary
app.get('/api/clients/:clientId/progress-summary', (req, res) => {
    const clientMeasurements = bodyMeasurements.filter(m => m.clientId == req.params.clientId);
    const clientStrength = strengthProgress.filter(s => s.clientId == req.params.clientId);
    const clientCardio = cardioProgress.filter(c => c.clientId == req.params.clientId);
    const clientMilestones = goalMilestones.filter(m => m.clientId == req.params.clientId);
    
    const latest = clientMeasurements[0];
    const previous = clientMeasurements[1];
    
    const summary = {
        weightChange: latest && previous ? parseFloat((latest.weight - previous.weight).toFixed(1)) : 0,
        bodyFatChange: latest && previous ? parseFloat((latest.bodyFat - previous.bodyFat).toFixed(1)) : 0,
        muscleMassChange: latest && previous ? parseFloat((latest.muscleMass - previous.muscleMass).toFixed(1)) : 0,
        strengthPRs: clientStrength.filter(s => s.personalRecord).length,
        cardioPRs: clientCardio.filter(c => c.personalRecord).length,
        milestonesAchieved: clientMilestones.filter(m => m.status === 'achieved').length,
        totalWorkouts: clientStrength.length + clientCardio.length,
        lastMeasurement: latest ? latest.date : null
    };
    
    res.json(summary);
});

// Get progress analytics
app.get('/api/clients/:clientId/analytics', (req, res) => {
    const clientMeasurements = bodyMeasurements.filter(m => m.clientId == req.params.clientId);
    const clientStrength = strengthProgress.filter(s => s.clientId == req.params.clientId);
    const clientCardio = cardioProgress.filter(c => c.clientId == req.params.clientId);
    
    // Calculate trends
    const weightTrend = calculateTrend(clientMeasurements.map(m => ({ date: m.date, value: m.weight })));
    const strengthTrend = calculateStrengthTrend(clientStrength);
    const cardioTrend = calculateCardioTrend(clientCardio);
    
    const analytics = {
        weightTrend,
        strengthTrend,
        cardioTrend,
        consistencyScore: calculateConsistency(clientStrength, clientCardio),
        improvementRate: calculateImprovementRate(clientMeasurements, clientStrength, clientCardio)
    };
    
    res.json(analytics);
});

function calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0].value;
    const last = sorted[sorted.length - 1].value;
    
    return parseFloat(((last - first) / first * 100).toFixed(1));
}

function calculateStrengthTrend(strengthData) {
    if (strengthData.length < 2) return 0;
    
    const totalVolume = strengthData.reduce((sum, s) => sum + s.volume, 0);
    const avgVolume = totalVolume / strengthData.length;
    
    return Math.round(avgVolume);
}

function calculateCardioTrend(cardioData) {
    if (cardioData.length < 2) return 0;
    
    const avgDistance = cardioData.reduce((sum, c) => sum + c.distance, 0) / cardioData.length;
    return parseFloat(avgDistance.toFixed(1));
}

function calculateConsistency(strengthData, cardioData) {
    const totalWorkouts = strengthData.length + cardioData.length;
    const weeks = 4; // Last 4 weeks
    const expectedWorkouts = weeks * 3; // 3 workouts per week
    
    return Math.min(Math.round((totalWorkouts / expectedWorkouts) * 100), 100);
}

function calculateImprovementRate(measurements, strength, cardio) {
    const measurementImprovement = measurements.length >= 2 ? 
        Math.abs(measurements[0].bodyFat - measurements[1].bodyFat) : 0;
    const strengthImprovement = strength.filter(s => s.personalRecord).length;
    const cardioImprovement = cardio.filter(c => c.personalRecord).length;
    
    return Math.round((measurementImprovement + strengthImprovement + cardioImprovement) * 10);
}

// Get system statistics
app.get('/api/progress/stats', (req, res) => {
    const stats = {
        totalMeasurements: bodyMeasurements.length,
        totalStrengthRecords: strengthProgress.length,
        totalCardioRecords: cardioProgress.length,
        totalPhotos: progressPhotos.length,
        totalMilestones: goalMilestones.length,
        personalRecords: strengthProgress.filter(s => s.personalRecord).length + 
                        cardioProgress.filter(c => c.personalRecord).length,
        avgWeightLoss: calculateAvgWeightLoss(),
        avgStrengthGain: calculateAvgStrengthGain()
    };
    
    res.json(stats);
});

function calculateAvgWeightLoss() {
    const clients = [...new Set(bodyMeasurements.map(m => m.clientId))];
    let totalWeightLoss = 0;
    
    clients.forEach(clientId => {
        const clientMeasurements = bodyMeasurements
            .filter(m => m.clientId === clientId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (clientMeasurements.length >= 2) {
            const first = clientMeasurements[0];
            const last = clientMeasurements[clientMeasurements.length - 1];
            totalWeightLoss += (first.weight - last.weight);
        }
    });
    
    return parseFloat((totalWeightLoss / clients.length).toFixed(1));
}

function calculateAvgStrengthGain() {
    const exercises = [...new Set(strengthProgress.map(s => s.exercise))];
    let totalGain = 0;
    
    exercises.forEach(exercise => {
        const exerciseData = strengthProgress
            .filter(s => s.exercise === exercise)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (exerciseData.length >= 2) {
            const first = exerciseData[0];
            const last = exerciseData[exerciseData.length - 1];
            totalGain += ((last.weight - first.weight) / first.weight * 100);
        }
    });
    
    return Math.round(totalGain / exercises.length);
}

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
    console.log(`Progress Tracking API running on port ${PORT}`);
});