const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3016;

app.use(cors());
app.use(express.json());

// Mock data
let tickets = [
    { id: 1, memberId: 'M001', memberName: 'Ahmed Al-Rashid', type: 'complaint', subject: 'Equipment not working', description: 'Treadmill #3 stopped working during workout', status: 'open', priority: 'medium', assignedTo: 'staff1', createdAt: '2024-01-15T10:30:00Z', updatedAt: '2024-01-15T10:30:00Z' },
    { id: 2, memberId: 'M002', memberName: 'Fatima Hassan', type: 'inquiry', subject: 'Class schedule question', description: 'When does the new yoga class start?', status: 'resolved', priority: 'low', assignedTo: 'staff2', createdAt: '2024-01-14T14:20:00Z', updatedAt: '2024-01-15T09:15:00Z' }
];

let communications = [
    { id: 1, ticketId: 1, from: 'member', message: 'Treadmill #3 stopped working during my workout', timestamp: '2024-01-15T10:30:00Z' },
    { id: 2, ticketId: 1, from: 'staff', message: 'Thank you for reporting this. We will check the equipment immediately.', timestamp: '2024-01-15T10:35:00Z' },
    { id: 3, ticketId: 2, from: 'member', message: 'When does the new yoga class start?', timestamp: '2024-01-14T14:20:00Z' },
    { id: 4, ticketId: 2, from: 'staff', message: 'The new yoga class starts Monday at 7 AM. Would you like to register?', timestamp: '2024-01-14T14:25:00Z' }
];

let feedback = [
    { id: 1, memberId: 'M001', memberName: 'Ahmed Al-Rashid', rating: 4, category: 'facilities', comment: 'Great equipment but could use more cardio machines', date: '2024-01-15T16:00:00Z' },
    { id: 2, memberId: 'M002', memberName: 'Fatima Hassan', rating: 5, category: 'staff', comment: 'Excellent customer service from reception team', date: '2024-01-14T18:30:00Z' }
];

let staff = [
    { id: 'staff1', name: 'Sarah Johnson', role: 'Customer Support', available: true },
    { id: 'staff2', name: 'Mike Wilson', role: 'Manager', available: true }
];

// Create new ticket
app.post('/api/support/tickets', (req, res) => {
    const { memberId, memberName, type, subject, description, priority } = req.body;
    
    const newTicket = {
        id: tickets.length + 1,
        memberId,
        memberName,
        type,
        subject,
        description,
        status: 'open',
        priority: priority || 'medium',
        assignedTo: staff.find(s => s.available)?.id || 'staff1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tickets.push(newTicket);
    
    // Add initial communication
    const initialComm = {
        id: communications.length + 1,
        ticketId: newTicket.id,
        from: 'member',
        message: description,
        timestamp: new Date().toISOString()
    };
    
    communications.push(initialComm);
    
    res.json({ success: true, ticket: newTicket });
});

// Get all tickets
app.get('/api/support/tickets', (req, res) => {
    const { status, type, priority } = req.query;
    
    let filteredTickets = tickets;
    
    if (status) filteredTickets = filteredTickets.filter(t => t.status === status);
    if (type) filteredTickets = filteredTickets.filter(t => t.type === type);
    if (priority) filteredTickets = filteredTickets.filter(t => t.priority === priority);
    
    res.json(filteredTickets);
});

// Get ticket by ID
app.get('/api/support/tickets/:id', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    const ticketComms = communications.filter(c => c.ticketId === ticketId);
    
    res.json({ ticket, communications: ticketComms });
});

// Update ticket
app.put('/api/support/tickets/:id', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const { status, priority, assignedTo } = req.body;
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = assignedTo;
    
    ticket.updatedAt = new Date().toISOString();
    
    res.json({ success: true, ticket });
});

// Add communication to ticket
app.post('/api/support/tickets/:id/communications', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const { from, message } = req.body;
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    const newComm = {
        id: communications.length + 1,
        ticketId,
        from,
        message,
        timestamp: new Date().toISOString()
    };
    
    communications.push(newComm);
    ticket.updatedAt = new Date().toISOString();
    
    res.json({ success: true, communication: newComm });
});

// Escalate ticket
app.post('/api/support/tickets/:id/escalate', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    ticket.priority = 'high';
    ticket.assignedTo = 'staff2'; // Manager
    ticket.updatedAt = new Date().toISOString();
    
    // Add escalation communication
    const escalationComm = {
        id: communications.length + 1,
        ticketId,
        from: 'system',
        message: `Ticket escalated to manager. Reason: ${reason}`,
        timestamp: new Date().toISOString()
    };
    
    communications.push(escalationComm);
    
    res.json({ success: true, ticket });
});

// Submit feedback
app.post('/api/support/feedback', (req, res) => {
    const { memberId, memberName, rating, category, comment } = req.body;
    
    const newFeedback = {
        id: feedback.length + 1,
        memberId,
        memberName,
        rating,
        category,
        comment,
        date: new Date().toISOString()
    };
    
    feedback.push(newFeedback);
    
    res.json({ success: true, feedback: newFeedback });
});

// Get feedback
app.get('/api/support/feedback', (req, res) => {
    const { category, rating } = req.query;
    
    let filteredFeedback = feedback;
    
    if (category) filteredFeedback = filteredFeedback.filter(f => f.category === category);
    if (rating) filteredFeedback = filteredFeedback.filter(f => f.rating === parseInt(rating));
    
    res.json(filteredFeedback);
});

// Get member communication history
app.get('/api/support/member/:memberId/history', (req, res) => {
    const memberId = req.params.memberId;
    
    const memberTickets = tickets.filter(t => t.memberId === memberId);
    const memberFeedback = feedback.filter(f => f.memberId === memberId);
    
    res.json({ tickets: memberTickets, feedback: memberFeedback });
});

// Get support statistics
app.get('/api/support/stats', (req, res) => {
    const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
        highPriorityTickets: tickets.filter(t => t.priority === 'high').length,
        averageRating: feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : 0,
        totalFeedback: feedback.length
    };
    
    res.json(stats);
});

// Get staff list
app.get('/api/support/staff', (req, res) => {
    res.json(staff);
});

app.listen(PORT, () => {
    console.log(`Customer Support API running on port ${PORT}`);
});