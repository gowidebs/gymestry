const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
let classes = [
    {
        id: 1,
        name: "Morning Yoga",
        instructor: "Sarah Johnson",
        instructorId: 1,
        date: "2024-01-15",
        time: "07:00",
        duration: 60,
        capacity: 20,
        booked: 15,
        waitlist: 3,
        room: "Studio A",
        price: 50,
        status: "active"
    },
    {
        id: 2,
        name: "HIIT Training",
        instructor: "Mike Wilson",
        instructorId: 2,
        date: "2024-01-15",
        time: "18:00",
        duration: 45,
        capacity: 15,
        booked: 15,
        waitlist: 5,
        room: "Gym Floor",
        price: 75,
        status: "full"
    }
];

let bookings = [
    { id: 1, classId: 1, memberId: 101, memberName: "Ahmed Al-Rashid", status: "confirmed", bookedAt: "2024-01-10T10:00:00Z" },
    { id: 2, classId: 1, memberId: 102, memberName: "Fatima Hassan", status: "confirmed", bookedAt: "2024-01-10T11:00:00Z" },
    { id: 3, classId: 2, memberId: 103, memberName: "Omar Khalil", status: "waitlist", bookedAt: "2024-01-12T14:00:00Z" }
];

let attendance = [
    { id: 1, classId: 1, memberId: 101, memberName: "Ahmed Al-Rashid", status: "present", checkedInAt: "2024-01-15T06:55:00Z" },
    { id: 2, classId: 1, memberId: 102, memberName: "Fatima Hassan", status: "absent", checkedInAt: null }
];

// Get all classes
app.get('/api/classes', (req, res) => {
    const { date, instructor, status } = req.query;
    let filteredClasses = classes;
    
    if (date) filteredClasses = filteredClasses.filter(c => c.date === date);
    if (instructor) filteredClasses = filteredClasses.filter(c => c.instructorId == instructor);
    if (status) filteredClasses = filteredClasses.filter(c => c.status === status);
    
    res.json(filteredClasses);
});

// Create new class
app.post('/api/classes', (req, res) => {
    const newClass = {
        id: classes.length + 1,
        ...req.body,
        booked: 0,
        waitlist: 0,
        status: 'active'
    };
    classes.push(newClass);
    res.json(newClass);
});

// Update class
app.put('/api/classes/:id', (req, res) => {
    const classIndex = classes.findIndex(c => c.id == req.params.id);
    if (classIndex === -1) return res.status(404).json({ error: 'Class not found' });
    
    classes[classIndex] = { ...classes[classIndex], ...req.body };
    res.json(classes[classIndex]);
});

// Delete class
app.delete('/api/classes/:id', (req, res) => {
    classes = classes.filter(c => c.id != req.params.id);
    res.json({ message: 'Class deleted successfully' });
});

// Book class
app.post('/api/classes/:id/book', (req, res) => {
    const { memberId, memberName } = req.body;
    const classObj = classes.find(c => c.id == req.params.id);
    
    if (!classObj) return res.status(404).json({ error: 'Class not found' });
    
    const existingBooking = bookings.find(b => b.classId == req.params.id && b.memberId == memberId);
    if (existingBooking) return res.status(400).json({ error: 'Already booked' });
    
    const newBooking = {
        id: bookings.length + 1,
        classId: parseInt(req.params.id),
        memberId,
        memberName,
        status: classObj.booked < classObj.capacity ? 'confirmed' : 'waitlist',
        bookedAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    
    if (newBooking.status === 'confirmed') {
        classObj.booked++;
        if (classObj.booked >= classObj.capacity) classObj.status = 'full';
    } else {
        classObj.waitlist++;
    }
    
    res.json(newBooking);
});

// Cancel booking
app.delete('/api/bookings/:id', (req, res) => {
    const booking = bookings.find(b => b.id == req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    const classObj = classes.find(c => c.id === booking.classId);
    
    if (booking.status === 'confirmed') {
        classObj.booked--;
        classObj.status = 'active';
        
        // Move waitlist to confirmed
        const waitlistBooking = bookings.find(b => b.classId === booking.classId && b.status === 'waitlist');
        if (waitlistBooking) {
            waitlistBooking.status = 'confirmed';
            classObj.booked++;
            classObj.waitlist--;
        }
    } else {
        classObj.waitlist--;
    }
    
    bookings = bookings.filter(b => b.id != req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
});

// Get class bookings
app.get('/api/classes/:id/bookings', (req, res) => {
    const classBookings = bookings.filter(b => b.classId == req.params.id);
    res.json(classBookings);
});

// Mark attendance
app.post('/api/classes/:id/attendance', (req, res) => {
    const { memberId, memberName, status } = req.body;
    
    const existingAttendance = attendance.find(a => a.classId == req.params.id && a.memberId == memberId);
    
    if (existingAttendance) {
        existingAttendance.status = status;
        existingAttendance.checkedInAt = status === 'present' ? new Date().toISOString() : null;
        res.json(existingAttendance);
    } else {
        const newAttendance = {
            id: attendance.length + 1,
            classId: parseInt(req.params.id),
            memberId,
            memberName,
            status,
            checkedInAt: status === 'present' ? new Date().toISOString() : null
        };
        attendance.push(newAttendance);
        res.json(newAttendance);
    }
});

// Get class attendance
app.get('/api/classes/:id/attendance', (req, res) => {
    const classAttendance = attendance.filter(a => a.classId == req.params.id);
    res.json(classAttendance);
});

// Get instructor schedule
app.get('/api/instructors/:id/schedule', (req, res) => {
    const instructorClasses = classes.filter(c => c.instructorId == req.params.id);
    res.json(instructorClasses);
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Class Scheduling API running on port ${PORT}`);
});