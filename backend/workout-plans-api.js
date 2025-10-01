const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
let exercises = [
    {
        id: 1,
        name: "Bench Press",
        category: "Chest",
        muscleGroups: ["Chest", "Triceps", "Shoulders"],
        equipment: "Barbell",
        difficulty: "Intermediate",
        instructions: "Lie on bench, grip bar shoulder-width apart, lower to chest, press up",
        videoUrl: "bench_press_demo.mp4",
        caloriesPerMinute: 8
    },
    {
        id: 2,
        name: "Squats",
        category: "Legs",
        muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
        equipment: "Barbell",
        difficulty: "Beginner",
        instructions: "Stand with feet shoulder-width apart, lower hips back and down, return to standing",
        videoUrl: "squats_demo.mp4",
        caloriesPerMinute: 10
    },
    {
        id: 3,
        name: "Pull-ups",
        category: "Back",
        muscleGroups: ["Lats", "Biceps", "Rhomboids"],
        equipment: "Pull-up Bar",
        difficulty: "Advanced",
        instructions: "Hang from bar, pull body up until chin over bar, lower with control",
        videoUrl: "pullups_demo.mp4",
        caloriesPerMinute: 12
    }
];

let workoutPlans = [
    {
        id: 1,
        name: "Beginner Strength Builder",
        description: "4-week program for building foundational strength",
        duration: 4,
        daysPerWeek: 3,
        difficulty: "Beginner",
        category: "Strength",
        createdBy: "Mike Wilson",
        createdDate: "2024-01-15",
        isTemplate: true,
        exercises: [
            { exerciseId: 1, sets: 3, reps: 8, weight: 60, restTime: 90 },
            { exerciseId: 2, sets: 3, reps: 10, weight: 80, restTime: 90 },
            { exerciseId: 3, sets: 2, reps: 5, weight: 0, restTime: 120 }
        ]
    },
    {
        id: 2,
        name: "Fat Loss Circuit",
        description: "High-intensity circuit for maximum calorie burn",
        duration: 6,
        daysPerWeek: 4,
        difficulty: "Intermediate",
        category: "Fat Loss",
        createdBy: "Sarah Johnson",
        createdDate: "2024-02-01",
        isTemplate: true,
        exercises: [
            { exerciseId: 2, sets: 4, reps: 15, weight: 40, restTime: 30 },
            { exerciseId: 3, sets: 3, reps: 8, weight: 0, restTime: 45 },
            { exerciseId: 1, sets: 3, reps: 12, weight: 50, restTime: 60 }
        ]
    }
];

let clientPlans = [
    {
        id: 1,
        clientId: 1,
        clientName: "Ahmed Al-Mansouri",
        planId: 1,
        planName: "Beginner Strength Builder",
        startDate: "2024-12-01",
        endDate: "2024-12-29",
        status: "active",
        progress: 65,
        completedWorkouts: 8,
        totalWorkouts: 12
    }
];

let workoutProgress = [
    {
        id: 1,
        clientId: 1,
        planId: 1,
        exerciseId: 1,
        date: "2024-12-20",
        sets: 3,
        reps: [8, 8, 6],
        weights: [60, 60, 65],
        restTimes: [90, 90, 120],
        notes: "Increased weight on last set, good form"
    },
    {
        id: 2,
        clientId: 1,
        planId: 1,
        exerciseId: 2,
        date: "2024-12-20",
        sets: 3,
        reps: [10, 10, 8],
        weights: [80, 80, 80],
        restTimes: [90, 90, 90],
        notes: "Maintained weight, focus on depth"
    }
];

let nutritionPlans = [
    {
        id: 1,
        clientId: 1,
        planName: "Muscle Building Nutrition",
        dailyCalories: 2800,
        macros: {
            protein: 35,
            carbs: 40,
            fats: 25
        },
        meals: [
            {
                name: "Breakfast",
                calories: 650,
                protein: 30,
                carbs: 45,
                fats: 25
            },
            {
                name: "Lunch",
                calories: 750,
                protein: 40,
                carbs: 55,
                fats: 20
            },
            {
                name: "Dinner",
                calories: 700,
                protein: 35,
                carbs: 50,
                fats: 22
            }
        ]
    }
];

// Get exercise library
app.get('/api/exercises', (req, res) => {
    const { category, difficulty, equipment } = req.query;
    let filteredExercises = exercises;
    
    if (category) filteredExercises = filteredExercises.filter(e => e.category === category);
    if (difficulty) filteredExercises = filteredExercises.filter(e => e.difficulty === difficulty);
    if (equipment) filteredExercises = filteredExercises.filter(e => e.equipment === equipment);
    
    res.json(filteredExercises);
});

// Add new exercise
app.post('/api/exercises', (req, res) => {
    const newExercise = {
        id: exercises.length + 1,
        ...req.body
    };
    exercises.push(newExercise);
    res.json(newExercise);
});

// Get workout plan templates
app.get('/api/workout-plans', (req, res) => {
    const { category, difficulty, isTemplate } = req.query;
    let filteredPlans = workoutPlans;
    
    if (category) filteredPlans = filteredPlans.filter(p => p.category === category);
    if (difficulty) filteredPlans = filteredPlans.filter(p => p.difficulty === difficulty);
    if (isTemplate !== undefined) filteredPlans = filteredPlans.filter(p => p.isTemplate === (isTemplate === 'true'));
    
    res.json(filteredPlans);
});

// Create workout plan
app.post('/api/workout-plans', (req, res) => {
    const newPlan = {
        id: workoutPlans.length + 1,
        createdDate: new Date().toISOString().split('T')[0],
        ...req.body
    };
    workoutPlans.push(newPlan);
    res.json(newPlan);
});

// Assign plan to client
app.post('/api/clients/:clientId/assign-plan', (req, res) => {
    const { planId, startDate, endDate } = req.body;
    const plan = workoutPlans.find(p => p.id == planId);
    
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    const clientPlan = {
        id: clientPlans.length + 1,
        clientId: parseInt(req.params.clientId),
        clientName: req.body.clientName || "Client",
        planId: planId,
        planName: plan.name,
        startDate,
        endDate,
        status: 'active',
        progress: 0,
        completedWorkouts: 0,
        totalWorkouts: plan.duration * plan.daysPerWeek
    };
    
    clientPlans.push(clientPlan);
    res.json(clientPlan);
});

// Get client workout plans
app.get('/api/clients/:clientId/workout-plans', (req, res) => {
    const plans = clientPlans.filter(p => p.clientId == req.params.clientId);
    res.json(plans);
});

// Log workout progress
app.post('/api/workout-progress', (req, res) => {
    const newProgress = {
        id: workoutProgress.length + 1,
        date: new Date().toISOString().split('T')[0],
        ...req.body
    };
    workoutProgress.push(newProgress);
    
    // Update client plan progress
    const clientPlan = clientPlans.find(p => p.clientId == req.body.clientId && p.planId == req.body.planId);
    if (clientPlan) {
        clientPlan.completedWorkouts++;
        clientPlan.progress = Math.round((clientPlan.completedWorkouts / clientPlan.totalWorkouts) * 100);
    }
    
    res.json(newProgress);
});

// Get workout progress
app.get('/api/clients/:clientId/progress', (req, res) => {
    const { planId, exerciseId } = req.query;
    let progress = workoutProgress.filter(p => p.clientId == req.params.clientId);
    
    if (planId) progress = progress.filter(p => p.planId == planId);
    if (exerciseId) progress = progress.filter(p => p.exerciseId == exerciseId);
    
    res.json(progress);
});

// Get nutrition plan
app.get('/api/clients/:clientId/nutrition', (req, res) => {
    const nutrition = nutritionPlans.find(n => n.clientId == req.params.clientId);
    res.json(nutrition || {});
});

// Update nutrition plan
app.put('/api/clients/:clientId/nutrition', (req, res) => {
    const nutritionIndex = nutritionPlans.findIndex(n => n.clientId == req.params.clientId);
    
    if (nutritionIndex === -1) {
        const newNutrition = {
            id: nutritionPlans.length + 1,
            clientId: parseInt(req.params.clientId),
            ...req.body
        };
        nutritionPlans.push(newNutrition);
        res.json(newNutrition);
    } else {
        nutritionPlans[nutritionIndex] = { ...nutritionPlans[nutritionIndex], ...req.body };
        res.json(nutritionPlans[nutritionIndex]);
    }
});

// Get performance analytics
app.get('/api/clients/:clientId/analytics', (req, res) => {
    const clientProgress = workoutProgress.filter(p => p.clientId == req.params.clientId);
    const clientPlan = clientPlans.find(p => p.clientId == req.params.clientId && p.status === 'active');
    
    const analytics = {
        totalWorkouts: clientProgress.length,
        averageWorkoutsPerWeek: Math.round(clientProgress.length / 4),
        strengthProgress: calculateStrengthProgress(clientProgress),
        volumeProgress: calculateVolumeProgress(clientProgress),
        consistencyScore: calculateConsistency(clientProgress),
        planProgress: clientPlan ? clientPlan.progress : 0
    };
    
    res.json(analytics);
});

function calculateStrengthProgress(progress) {
    if (progress.length < 2) return 0;
    
    const firstWorkout = progress[0];
    const lastWorkout = progress[progress.length - 1];
    
    const firstMax = Math.max(...firstWorkout.weights);
    const lastMax = Math.max(...lastWorkout.weights);
    
    return Math.round(((lastMax - firstMax) / firstMax) * 100);
}

function calculateVolumeProgress(progress) {
    if (progress.length < 2) return 0;
    
    const firstVolume = progress[0].sets * progress[0].reps.reduce((a, b) => a + b, 0);
    const lastVolume = progress[progress.length - 1].sets * progress[progress.length - 1].reps.reduce((a, b) => a + b, 0);
    
    return Math.round(((lastVolume - firstVolume) / firstVolume) * 100);
}

function calculateConsistency(progress) {
    const totalDays = 28; // 4 weeks
    const workoutDays = new Set(progress.map(p => p.date)).size;
    return Math.round((workoutDays / totalDays) * 100);
}

// Get workout statistics
app.get('/api/workout-stats', (req, res) => {
    const stats = {
        totalExercises: exercises.length,
        totalPlans: workoutPlans.length,
        activeClientPlans: clientPlans.filter(p => p.status === 'active').length,
        completedWorkouts: workoutProgress.length,
        averageProgress: Math.round(
            clientPlans.reduce((sum, p) => sum + p.progress, 0) / clientPlans.length
        )
    };
    
    res.json(stats);
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log(`Workout Plans API running on port ${PORT}`);
});