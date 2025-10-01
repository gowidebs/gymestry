const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json());

// Mock data
let sessions = [
    {
        id: 1,
        clientId: 1,
        trainerId: 1,
        date: '2024-01-15',
        time: '09:00',
        duration: 60,
        type: 'Personal Training',
        status: 'confirmed',
        notes: 'Focus on upper body strength',
        payment: { amount: 150, status: 'paid', method: 'card' },
        createdAt: '2024-01-10T10:00:00Z'
    },
    {
        id: 2,
        clientId: 2,
        trainerId: 1,
        date: '2024-01-15',
        time: '11:00',
        duration: 45,
        type: 'Nutrition Consultation',
        status: 'pending',
        notes: '',
        payment: { amount: 100, status: 'pending', method: '' },
        createdAt: '2024-01-12T14:30:00Z'
    }
];

let clients = [
    { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed@email.com', phone: '+971501234567' },
    { id: 2, name: 'Fatima Hassan', email: 'fatima@email.com', phone: '+971507654321' }
];

let trainers = [
    { id: 1, name: 'Coach Sarah', specialization: 'Strength Training' },
    { id: 2, name: 'Coach Mike', specialization: 'Cardio & Weight Loss' }
];

// Get all sessions
app.get('/api/sessions', (req, res) => {
    const { date, trainerId, status } = req.query;
    let filtered = sessions;
    
    if (date) filtered = filtered.filter(s => s.date === date);
    if (trainerId) filtered = filtered.filter(s => s.trainerId == trainerId);
    if (status) filtered = filtered.filter(s => s.status === status);
    
    res.json(filtered);
});

// Get session by ID
app.get('/api/sessions/:id', (req, res) => {
    const session = sessions.find(s => s.id == req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
});

// Create new session
app.post('/api/sessions', (req, res) => {
    const { clientId, trainerId, date, time, duration, type } = req.body;
    
    const newSession = {
        id: sessions.length + 1,
        clientId,
        trainerId,
        date,
        time,
        duration,
        type,
        status: 'pending',
        notes: '',
        payment: { amount: 0, status: 'pending', method: '' },
        createdAt: new Date().toISOString()
    };
    
    sessions.push(newSession);
    res.status(201).json(newSession);
});

// Update session
app.put('/api/sessions/:id', (req, res) => {
    const sessionIndex = sessions.findIndex(s => s.id == req.params.id);
    if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found' });
    
    sessions[sessionIndex] = { ...sessions[sessionIndex], ...req.body };
    res.json(sessions[sessionIndex]);
});

// Cancel session
app.patch('/api/sessions/:id/cancel', (req, res) => {
    const sessionIndex = sessions.findIndex(s => s.id == req.params.id);
    if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found' });
    
    sessions[sessionIndex].status = 'cancelled';
    sessions[sessionIndex].cancelledAt = new Date().toISOString();
    res.json(sessions[sessionIndex]);
});

// Update session notes
app.patch('/api/sessions/:id/notes', (req, res) => {
    const { notes } = req.body;
    const sessionIndex = sessions.findIndex(s => s.id == req.params.id);
    if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found' });
    
    sessions[sessionIndex].notes = notes;
    res.json(sessions[sessionIndex]);
});

// Update payment status
app.patch('/api/sessions/:id/payment', (req, res) => {
    const { amount, status, method } = req.body;
    const sessionIndex = sessions.findIndex(s => s.id == req.params.id);
    if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found' });
    
    sessions[sessionIndex].payment = { amount, status, method };
    res.json(sessions[sessionIndex]);
});

// Get calendar view
app.get('/api/calendar', (req, res) => {
    const { month, year } = req.query;
    const filtered = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return (!month || sessionDate.getMonth() + 1 == month) &&
               (!year || sessionDate.getFullYear() == year);
    });
    res.json(filtered);
});

// Get trainer availability
app.get('/api/trainers/:id/availability', (req, res) => {
    const { date } = req.query;
    const trainerSessions = sessions.filter(s => 
        s.trainerId == req.params.id && 
        s.date === date && 
        s.status !== 'cancelled'
    );
    
    const bookedTimes = trainerSessions.map(s => s.time);
    res.json({ bookedTimes });
});

// Get clients
app.get('/api/clients', (req, res) => {
    res.json(clients);
});

// Get trainers
app.get('/api/trainers', (req, res) => {
    res.json(trainers);
});

// Get session statistics
app.get('/api/sessions/stats', (req, res) => {
    const total = sessions.length;
    const confirmed = sessions.filter(s => s.status === 'confirmed').length;
    const pending = sessions.filter(s => s.status === 'pending').length;
    const cancelled = sessions.filter(s => s.status === 'cancelled').length;
    const revenue = sessions
        .filter(s => s.payment.status === 'paid')
        .reduce((sum, s) => sum + s.payment.amount, 0);
    
    res.json({ total, confirmed, pending, cancelled, revenue });
});

app.listen(PORT, () => {
    console.log(`Session Booking API running on port ${PORT}`);
});