const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3014;

app.use(cors());
app.use(express.json());

// Mock data
let registrations = [
    { id: 1, name: 'John Smith', email: 'john@email.com', phone: '+971501234567', status: 'pending_payment', createdAt: '2024-01-15T10:30:00Z' },
    { id: 2, name: 'Emma Wilson', email: 'emma@email.com', phone: '+971509876543', status: 'completed', createdAt: '2024-01-14T14:20:00Z' }
];

let membershipPlans = [
    { id: 'basic', name: 'Basic Monthly', price: 200, duration: '1 month', features: ['Gym Access', 'Basic Equipment'] },
    { id: 'standard', name: 'Standard Monthly', price: 300, duration: '1 month', features: ['Gym Access', 'All Equipment', 'Group Classes'] },
    { id: 'premium', name: 'Premium Monthly', price: 450, duration: '1 month', features: ['Gym Access', 'All Equipment', 'Group Classes', '4 PT Sessions'] }
];

let tourSlots = [
    { id: 1, date: '2024-01-16', time: '10:00', available: true },
    { id: 2, date: '2024-01-16', time: '14:00', available: true },
    { id: 3, date: '2024-01-16', time: '16:00', available: false },
    { id: 4, date: '2024-01-17', time: '10:00', available: true }
];

// Get membership plans
app.get('/api/membership-plans', (req, res) => {
    res.json(membershipPlans);
});

// Start registration
app.post('/api/registration/start', (req, res) => {
    const { personalInfo, membershipPlan, emergencyContact } = req.body;
    
    const newRegistration = {
        id: registrations.length + 1,
        ...personalInfo,
        membershipPlan,
        emergencyContact,
        status: 'pending_documents',
        createdAt: new Date().toISOString(),
        documents: [],
        payment: null,
        tour: null
    };
    
    registrations.push(newRegistration);
    res.json({ success: true, registrationId: newRegistration.id, registration: newRegistration });
});

// Upload documents
app.post('/api/registration/:id/documents', (req, res) => {
    const registrationId = parseInt(req.params.id);
    const { documentType, fileName } = req.body;
    
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    if (!registration.documents) registration.documents = [];
    
    registration.documents.push({
        type: documentType,
        fileName,
        uploadedAt: new Date().toISOString(),
        status: 'verified'
    });
    
    // Check if all required documents are uploaded
    const requiredDocs = ['emirates_id', 'photo'];
    const uploadedTypes = registration.documents.map(d => d.type);
    const allDocsUploaded = requiredDocs.every(type => uploadedTypes.includes(type));
    
    if (allDocsUploaded && registration.status === 'pending_documents') {
        registration.status = 'pending_payment';
    }
    
    res.json({ success: true, registration });
});

// Process payment
app.post('/api/registration/:id/payment', (req, res) => {
    const registrationId = parseInt(req.params.id);
    const { paymentMethod, amount } = req.body;
    
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    registration.payment = {
        method: paymentMethod,
        amount,
        transactionId: 'TXN' + Date.now(),
        processedAt: new Date().toISOString(),
        status: 'completed'
    };
    
    registration.status = 'pending_tour';
    
    res.json({ success: true, payment: registration.payment, registration });
});

// Get available tour slots
app.get('/api/tour-slots', (req, res) => {
    const availableSlots = tourSlots.filter(slot => slot.available);
    res.json(availableSlots);
});

// Schedule tour
app.post('/api/registration/:id/tour', (req, res) => {
    const registrationId = parseInt(req.params.id);
    const { slotId } = req.body;
    
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    const slot = tourSlots.find(s => s.id === slotId);
    if (!slot || !slot.available) {
        return res.status(400).json({ success: false, message: 'Tour slot not available' });
    }
    
    slot.available = false;
    registration.tour = {
        slotId,
        date: slot.date,
        time: slot.time,
        status: 'scheduled'
    };
    
    registration.status = 'tour_scheduled';
    
    res.json({ success: true, tour: registration.tour, registration });
});

// Complete registration
app.post('/api/registration/:id/complete', (req, res) => {
    const registrationId = parseInt(req.params.id);
    
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    const memberId = 'M' + String(Date.now()).slice(-6);
    const qrCode = 'QR' + String(Date.now()).slice(-6);
    
    registration.status = 'completed';
    registration.memberId = memberId;
    registration.qrCode = qrCode;
    registration.completedAt = new Date().toISOString();
    
    // Generate welcome package
    const welcomePackage = {
        memberId,
        qrCode,
        membershipCard: `${registration.name}_membership_card.pdf`,
        gymRules: 'gym_rules_handbook.pdf',
        classSchedule: 'class_schedule.pdf',
        welcomeLetter: `welcome_letter_${memberId}.pdf`,
        discountVouchers: ['supplement_10_off.pdf', 'pt_session_discount.pdf']
    };
    
    registration.welcomePackage = welcomePackage;
    
    res.json({ 
        success: true, 
        registration, 
        welcomePackage,
        message: 'Registration completed successfully! Welcome to Gymestry!'
    });
});

// Get registration status
app.get('/api/registration/:id', (req, res) => {
    const registrationId = parseInt(req.params.id);
    const registration = registrations.find(r => r.id === registrationId);
    
    if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    res.json(registration);
});

// Get all registrations
app.get('/api/registrations', (req, res) => {
    res.json(registrations);
});

app.listen(PORT, () => {
    console.log(`New Registration API running on port ${PORT}`);
});