const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Class Scheduling System (PushPress Features)
const classes = [];
const classBookings = [];
const waitlists = [];
const classPackages = [];
const instructors = [];

// Create Class
const createClass = (req, res) => {
  const { name, description, instructorId, capacity, duration, price, categoryId, branchId } = req.body;
  
  const classType = {
    id: uuidv4(),
    name,
    description,
    instructorId,
    capacity,
    duration, // minutes
    price, // AED
    categoryId,
    branchId,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  classes.push(classType);
  res.status(201).json({ class: classType });
};

// Schedule Class Instance
const scheduleClass = (req, res) => {
  const { classId, date, startTime, instructorId, capacity } = req.body;
  
  const classInstance = {
    id: uuidv4(),
    classId,
    date,
    startTime,
    endTime: moment(`${date} ${startTime}`).add(classes.find(c => c.id === classId)?.duration || 60, 'minutes').format('HH:mm'),
    instructorId,
    capacity: capacity || classes.find(c => c.id === classId)?.capacity || 20,
    bookedCount: 0,
    waitlistCount: 0,
    status: 'scheduled', // scheduled, cancelled, completed
    createdAt: new Date().toISOString()
  };
  
  classBookings.push(classInstance);
  res.status(201).json({ classInstance });
};

// Book Class
const bookClass = (req, res) => {
  const { classInstanceId, memberId, paymentMethod } = req.body;
  
  const classInstance = classBookings.find(c => c.id === classInstanceId);
  if (!classInstance) {
    return res.status(404).json({ error: 'Class not found' });
  }
  
  // Check capacity
  if (classInstance.bookedCount >= classInstance.capacity) {
    // Add to waitlist
    const waitlistEntry = {
      id: uuidv4(),
      classInstanceId,
      memberId,
      position: classInstance.waitlistCount + 1,
      createdAt: new Date().toISOString(),
      status: 'waiting'
    };
    
    waitlists.push(waitlistEntry);
    classInstance.waitlistCount++;
    
    return res.json({ 
      message: 'Added to waitlist',
      waitlistPosition: waitlistEntry.position,
      waitlistEntry 
    });
  }
  
  // Create booking
  const booking = {
    id: uuidv4(),
    classInstanceId,
    memberId,
    paymentMethod,
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
    checkedIn: false,
    checkedInAt: null
  };
  
  classInstance.bookedCount++;
  
  res.status(201).json({ booking, message: 'Class booked successfully' });
};

// Cancel Booking
const cancelBooking = (req, res) => {
  const { bookingId, reason } = req.body;
  
  const bookingIndex = classBookings.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  const booking = classBookings[bookingIndex];
  const classInstance = classBookings.find(c => c.id === booking.classInstanceId);
  
  // Update booking status
  booking.status = 'cancelled';
  booking.cancelledAt = new Date().toISOString();
  booking.cancelReason = reason;
  
  // Decrease booked count
  if (classInstance) {
    classInstance.bookedCount--;
    
    // Move waitlist member to confirmed
    const nextWaitlist = waitlists.find(w => 
      w.classInstanceId === booking.classInstanceId && 
      w.status === 'waiting'
    );
    
    if (nextWaitlist) {
      nextWaitlist.status = 'confirmed';
      nextWaitlist.confirmedAt = new Date().toISOString();
      classInstance.bookedCount++;
      classInstance.waitlistCount--;
    }
  }
  
  res.json({ message: 'Booking cancelled successfully', booking });
};

// Check-in to Class
const checkInToClass = (req, res) => {
  const { bookingId, checkInMethod } = req.body;
  
  const booking = classBookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  if (booking.status !== 'confirmed') {
    return res.status(400).json({ error: 'Booking not confirmed' });
  }
  
  booking.checkedIn = true;
  booking.checkedInAt = new Date().toISOString();
  booking.checkInMethod = checkInMethod; // qr, manual, app
  
  res.json({ message: 'Checked in successfully', booking });
};

// Class Packages
const createClassPackage = (req, res) => {
  const { name, description, classCount, price, validityDays, branchId } = req.body;
  
  const package = {
    id: uuidv4(),
    name,
    description,
    classCount,
    price, // AED
    validityDays,
    branchId,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  classPackages.push(package);
  res.status(201).json({ package });
};

// Purchase Package
const purchasePackage = (req, res) => {
  const { packageId, memberId, paymentMethod } = req.body;
  
  const package = classPackages.find(p => p.id === packageId);
  if (!package) {
    return res.status(404).json({ error: 'Package not found' });
  }
  
  const memberPackage = {
    id: uuidv4(),
    packageId,
    memberId,
    classesRemaining: package.classCount,
    purchaseDate: new Date().toISOString(),
    expiryDate: moment().add(package.validityDays, 'days').toISOString(),
    paymentMethod,
    status: 'active'
  };
  
  res.status(201).json({ memberPackage });
};

// Get Class Schedule
const getClassSchedule = (req, res) => {
  const { date, branchId, instructorId } = req.query;
  
  let schedule = classBookings.filter(c => c.status === 'scheduled');
  
  if (date) {
    schedule = schedule.filter(c => c.date === date);
  }
  
  if (branchId) {
    schedule = schedule.filter(c => {
      const classType = classes.find(ct => ct.id === c.classId);
      return classType?.branchId === branchId;
    });
  }
  
  if (instructorId) {
    schedule = schedule.filter(c => c.instructorId === instructorId);
  }
  
  // Enrich with class details
  const enrichedSchedule = schedule.map(instance => {
    const classType = classes.find(c => c.id === instance.classId);
    const instructor = instructors.find(i => i.id === instance.instructorId);
    
    return {
      ...instance,
      className: classType?.name,
      classDescription: classType?.description,
      instructorName: instructor?.name,
      availableSpots: instance.capacity - instance.bookedCount
    };
  });
  
  res.json({ schedule: enrichedSchedule });
};

// Instructor Management
const createInstructor = (req, res) => {
  const { name, email, phone, specialties, bio, hourlyRate, branchId } = req.body;
  
  const instructor = {
    id: uuidv4(),
    name,
    email,
    phone,
    specialties, // array of specialties
    bio,
    hourlyRate, // AED per hour
    branchId,
    isActive: true,
    rating: 0,
    totalClasses: 0,
    createdAt: new Date().toISOString()
  };
  
  instructors.push(instructor);
  res.status(201).json({ instructor });
};

// Class Analytics
const getClassAnalytics = (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  
  const filteredClasses = classBookings.filter(c => {
    const classDate = moment(c.date);
    const inDateRange = classDate.isBetween(startDate, endDate, null, '[]');
    const inBranch = !branchId || classes.find(ct => ct.id === c.classId)?.branchId === branchId;
    return inDateRange && inBranch;
  });
  
  const analytics = {
    totalClasses: filteredClasses.length,
    totalBookings: filteredClasses.reduce((sum, c) => sum + c.bookedCount, 0),
    averageAttendance: filteredClasses.reduce((sum, c) => sum + (c.bookedCount / c.capacity), 0) / filteredClasses.length * 100,
    totalRevenue: calculateClassRevenue(filteredClasses),
    popularClasses: getPopularClasses(filteredClasses),
    peakHours: getPeakHours(filteredClasses),
    instructorPerformance: getInstructorPerformance(filteredClasses)
  };
  
  res.json({ analytics });
};

// Helper Functions
const calculateClassRevenue = (classes) => {
  return classes.reduce((total, classInstance) => {
    const classType = classes.find(c => c.id === classInstance.classId);
    return total + (classInstance.bookedCount * (classType?.price || 0));
  }, 0);
};

const getPopularClasses = (classInstances) => {
  const classPopularity = {};
  
  classInstances.forEach(instance => {
    const classType = classes.find(c => c.id === instance.classId);
    if (classType) {
      if (!classPopularity[classType.name]) {
        classPopularity[classType.name] = 0;
      }
      classPopularity[classType.name] += instance.bookedCount;
    }
  });
  
  return Object.entries(classPopularity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, bookings]) => ({ name, bookings }));
};

const getPeakHours = (classInstances) => {
  const hourlyBookings = {};
  
  classInstances.forEach(instance => {
    const hour = moment(instance.startTime, 'HH:mm').hour();
    if (!hourlyBookings[hour]) {
      hourlyBookings[hour] = 0;
    }
    hourlyBookings[hour] += instance.bookedCount;
  });
  
  return Object.entries(hourlyBookings)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour, bookings]) => ({ hour: `${hour}:00`, bookings }));
};

const getInstructorPerformance = (classInstances) => {
  const instructorStats = {};
  
  classInstances.forEach(instance => {
    const instructor = instructors.find(i => i.id === instance.instructorId);
    if (instructor) {
      if (!instructorStats[instructor.name]) {
        instructorStats[instructor.name] = {
          classes: 0,
          totalBookings: 0,
          averageAttendance: 0
        };
      }
      instructorStats[instructor.name].classes++;
      instructorStats[instructor.name].totalBookings += instance.bookedCount;
    }
  });
  
  // Calculate averages
  Object.keys(instructorStats).forEach(name => {
    const stats = instructorStats[name];
    stats.averageAttendance = stats.totalBookings / stats.classes;
  });
  
  return instructorStats;
};

module.exports = {
  createClass,
  scheduleClass,
  bookClass,
  cancelBooking,
  checkInToClass,
  createClassPackage,
  purchasePackage,
  getClassSchedule,
  createInstructor,
  getClassAnalytics,
  classes,
  classBookings,
  waitlists,
  classPackages,
  instructors
};