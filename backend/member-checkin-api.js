const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3013;

app.use(cors());
app.use(express.json());

// Mock data
let checkins = [
    { id: 1, memberId: 'M001', memberName: 'Ahmed Al-Rashid', type: 'member', checkInTime: '2024-01-15T08:30:00Z', checkOutTime: null, status: 'active' },
    { id: 2, memberId: 'M002', memberName: 'Fatima Hassan', type: 'member', checkInTime: '2024-01-15T09:15:00Z', checkOutTime: '2024-01-15T10:45:00Z', status: 'completed' },
    { id: 3, memberId: 'G001', memberName: 'John Smith', type: 'guest', checkInTime: '2024-01-15T10:00:00Z', checkOutTime: null, status: 'active', sponsorId: 'M001' }
];

let members = [
    { id: 'M001', name: 'Ahmed Al-Rashid', membership: 'Premium', status: 'active', qrCode: 'QR001', accessLevel: 'full' },
    { id: 'M002', name: 'Fatima Hassan', membership: 'Basic', status: 'active', qrCode: 'QR002', accessLevel: 'gym' },
    { id: 'M003', name: 'Omar Abdullah', membership: 'Premium', status: 'suspended', qrCode: 'QR003', accessLevel: 'none' }
];

const gymCapacity = { max: 150, current: 45, areas: { gym: 30, pool: 8, classes: 7 } };

// Get current check-ins
app.get('/api/checkins', (req, res) => {
    const activeCheckins = checkins.filter(c => c.status === 'active');
    res.json({ checkins: activeCheckins, capacity: gymCapacity });
});

// QR code check-in
app.post('/api/checkin/qr', (req, res) => {
    const { qrCode } = req.body;
    const member = members.find(m => m.qrCode === qrCode);
    
    if (!member) {
        return res.status(404).json({ success: false, message: 'Invalid QR code' });
    }
    
    if (member.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Membership suspended or expired' });
    }
    
    if (gymCapacity.current >= gymCapacity.max) {
        return res.status(400).json({ success: false, message: 'Gym at full capacity' });
    }
    
    const existingCheckin = checkins.find(c => c.memberId === member.id && c.status === 'active');
    if (existingCheckin) {
        return res.status(400).json({ success: false, message: 'Already checked in' });
    }
    
    const newCheckin = {
        id: checkins.length + 1,
        memberId: member.id,
        memberName: member.name,
        type: 'member',
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        status: 'active'
    };
    
    checkins.push(newCheckin);
    gymCapacity.current++;
    gymCapacity.areas.gym++;
    
    res.json({ success: true, checkin: newCheckin, member });
});

// Manual check-in
app.post('/api/checkin/manual', (req, res) => {
    const { memberId } = req.body;
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
    }
    
    if (member.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Membership suspended or expired' });
    }
    
    if (gymCapacity.current >= gymCapacity.max) {
        return res.status(400).json({ success: false, message: 'Gym at full capacity' });
    }
    
    const existingCheckin = checkins.find(c => c.memberId === member.id && c.status === 'active');
    if (existingCheckin) {
        return res.status(400).json({ success: false, message: 'Already checked in' });
    }
    
    const newCheckin = {
        id: checkins.length + 1,
        memberId: member.id,
        memberName: member.name,
        type: 'member',
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        status: 'active'
    };
    
    checkins.push(newCheckin);
    gymCapacity.current++;
    gymCapacity.areas.gym++;
    
    res.json({ success: true, checkin: newCheckin, member });
});

// Guest registration and check-in
app.post('/api/checkin/guest', (req, res) => {
    const { guestName, phone, sponsorId } = req.body;
    
    if (gymCapacity.current >= gymCapacity.max) {
        return res.status(400).json({ success: false, message: 'Gym at full capacity' });
    }
    
    const sponsor = members.find(m => m.id === sponsorId && m.status === 'active');
    if (!sponsor) {
        return res.status(404).json({ success: false, message: 'Invalid sponsor member' });
    }
    
    const guestId = 'G' + (Date.now().toString().slice(-3));
    const newCheckin = {
        id: checkins.length + 1,
        memberId: guestId,
        memberName: guestName,
        type: 'guest',
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        status: 'active',
        sponsorId: sponsorId,
        phone: phone
    };
    
    checkins.push(newCheckin);
    gymCapacity.current++;
    gymCapacity.areas.gym++;
    
    res.json({ success: true, checkin: newCheckin, sponsor });
});

// Check-out
app.post('/api/checkout/:id', (req, res) => {
    const checkinId = parseInt(req.params.id);
    const checkin = checkins.find(c => c.id === checkinId);
    
    if (!checkin || checkin.status !== 'active') {
        return res.status(404).json({ success: false, message: 'Active check-in not found' });
    }
    
    checkin.checkOutTime = new Date().toISOString();
    checkin.status = 'completed';
    gymCapacity.current--;
    gymCapacity.areas.gym--;
    
    res.json({ success: true, checkin });
});

// Search members
app.get('/api/members/search', (req, res) => {
    const { query } = req.query;
    const results = members.filter(m => 
        m.name.toLowerCase().includes(query.toLowerCase()) || 
        m.id.toLowerCase().includes(query.toLowerCase())
    );
    res.json(results);
});

// Get capacity status
app.get('/api/capacity', (req, res) => {
    res.json(gymCapacity);
});

// Get check-in history
app.get('/api/checkins/history', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const todayCheckins = checkins.filter(c => c.checkInTime.startsWith(today));
    res.json(todayCheckins);
});

app.listen(PORT, () => {
    console.log(`Member Check-in API running on port ${PORT}`);
});