const express = require('express');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// UAE-specific features for Gymestry
const membershipTransfers = [];
const membershipFreezes = [];
const attendanceLogs = [];
const workoutPlans = [];
const dietPlans = [];
const events = [];
const gateAccessLogs = [];
const branches = [];

// UAE Membership Transfer (AED 150 fee)
const requestMembershipTransfer = (req, res) => {
  const { fromUserId, toUserName, toUserPhone, toUserEmiratesId } = req.body;
  
  const transfer = {
    id: uuidv4(),
    fromUserId,
    toUserName,
    toUserPhone,
    toUserEmiratesId,
    transferFee: 150, // AED 150 as per UAE requirements
    status: 'pending_payment',
    requestDate: new Date().toISOString(),
    approvedBy: null,
    completedDate: null
  };
  
  membershipTransfers.push(transfer);
  res.status(201).json({ transfer, message: 'Transfer request created. Please pay AED 150 fee.' });
};

// Process Transfer Payment
const processTransferPayment = (req, res) => {
  const { transferId, paymentMethod, paymentReference } = req.body;
  
  const transfer = membershipTransfers.find(t => t.id === transferId);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer request not found' });
  }
  
  transfer.status = 'pending_approval';
  transfer.paymentMethod = paymentMethod;
  transfer.paymentReference = paymentReference;
  transfer.paidDate = new Date().toISOString();
  
  res.json({ transfer, message: 'Payment processed. Awaiting admin approval.' });
};

// Approve Transfer (Admin/Receptionist)
const approveTransfer = (req, res) => {
  const { transferId, approvedBy } = req.body;
  
  const transfer = membershipTransfers.find(t => t.id === transferId);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer request not found' });
  }
  
  transfer.status = 'completed';
  transfer.approvedBy = approvedBy;
  transfer.completedDate = new Date().toISOString();
  
  res.json({ transfer, message: 'Membership transfer completed successfully.' });
};

// Membership Freeze (Yearly plans only, once per year, 1 month max)
const requestMembershipFreeze = (req, res) => {
  const { userId, reason } = req.body;
  
  // Check if user has yearly plan
  const membership = memberships.find(m => m.userId === userId && m.planType === 'yearly');
  if (!membership) {
    return res.status(400).json({ error: 'Freeze only available for yearly memberships' });
  }
  
  // Check if already frozen this year
  const existingFreeze = membershipFreezes.find(f => 
    f.userId === userId && 
    moment(f.freezeDate).year() === moment().year()
  );
  
  if (existingFreeze) {
    return res.status(400).json({ error: 'Membership can only be frozen once per year' });
  }
  
  const freeze = {
    id: uuidv4(),
    userId,
    reason,
    freezeDate: new Date().toISOString(),
    resumeDate: moment().add(1, 'month').toISOString(), // Auto-resume after 1 month
    status: 'active'
  };
  
  membershipFreezes.push(freeze);
  res.status(201).json({ freeze, message: 'Membership frozen for 1 month' });
};

// Gate Access with Multiple Methods
const validateGateAccess = (req, res) => {
  const { userId, method, data, gateId } = req.body; // method: 'qr', 'bluetooth', 'facial'
  
  // Check membership validity
  const membership = memberships.find(m => m.userId === userId);
  if (!membership) {
    return logGateAccess(userId, method, gateId, 'denied', 'No membership found', res);
  }
  
  // Check if membership is expired
  if (moment().isAfter(membership.endDate)) {
    return logGateAccess(userId, method, gateId, 'denied', 'Membership expired', res);
  }
  
  // Check if membership is frozen
  const activeFreeze = membershipFreezes.find(f => 
    f.userId === userId && 
    f.status === 'active' && 
    moment().isBefore(f.resumeDate)
  );
  
  if (activeFreeze) {
    return logGateAccess(userId, method, gateId, 'denied', 'Membership frozen', res);
  }
  
  // Log successful access
  logGateAccess(userId, method, gateId, 'granted', 'Access granted', res);
};

const logGateAccess = (userId, method, gateId, result, reason, res) => {
  const log = {
    id: uuidv4(),
    userId,
    method,
    gateId,
    result,
    reason,
    timestamp: new Date().toISOString()
  };
  
  gateAccessLogs.push(log);
  
  // Also log attendance if access granted
  if (result === 'granted') {
    attendanceLogs.push({
      id: uuidv4(),
      userId,
      checkInTime: new Date().toISOString(),
      method,
      gateId
    });
  }
  
  res.json({ result, reason, log });
};

// Event/Class Scheduling
const createEvent = (req, res) => {
  const { title, description, trainerId, date, time, capacity, branchId } = req.body;
  
  const event = {
    id: uuidv4(),
    title,
    description,
    trainerId,
    date,
    time,
    capacity,
    branchId,
    attendees: [],
    createdBy: req.body.createdBy,
    createdAt: new Date().toISOString()
  };
  
  events.push(event);
  res.status(201).json({ event });
};

// Book Event
const bookEvent = (req, res) => {
  const { eventId, userId } = req.body;
  
  const event = events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  if (event.attendees.length >= event.capacity) {
    return res.status(400).json({ error: 'Event is full' });
  }
  
  if (event.attendees.includes(userId)) {
    return res.status(400).json({ error: 'Already booked' });
  }
  
  event.attendees.push(userId);
  res.json({ event, message: 'Event booked successfully' });
};

// Workout Plans
const createWorkoutPlan = (req, res) => {
  const { memberId, trainerId, exercises, duration, goals } = req.body;
  
  const plan = {
    id: uuidv4(),
    memberId,
    trainerId,
    exercises,
    duration,
    goals,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  workoutPlans.push(plan);
  res.status(201).json({ plan });
};

// Diet Plans
const createDietPlan = (req, res) => {
  const { memberId, trainerId, meals, calories, restrictions } = req.body;
  
  const plan = {
    id: uuidv4(),
    memberId,
    trainerId,
    meals,
    calories,
    restrictions,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  dietPlans.push(plan);
  res.status(201).json({ plan });
};

// Branch Management
const createBranch = (req, res) => {
  const { name, address, phone, emiratesId, licenseNumber, ownerId } = req.body;
  
  const branch = {
    id: uuidv4(),
    name,
    address,
    phone,
    emiratesId,
    licenseNumber,
    ownerId,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  branches.push(branch);
  res.status(201).json({ branch });
};

// UAE Member Registration with Emirates ID
const registerUAEMember = (req, res) => {
  const { 
    name, 
    phone, 
    email, 
    emiratesId, 
    passport, 
    nationality, 
    address, 
    emergencyContact,
    planType,
    branchId 
  } = req.body;
  
  const member = {
    id: uuidv4(),
    name,
    phone,
    email,
    emiratesId,
    passport,
    nationality,
    address,
    emergencyContact,
    planType,
    branchId,
    registrationDate: new Date().toISOString(),
    status: 'active',
    waiverSigned: true, // UAE legal waiver
    vatNumber: generateVATNumber()
  };
  
  // Create membership
  const membership = {
    id: uuidv4(),
    userId: member.id,
    planType,
    startDate: new Date().toISOString(),
    endDate: calculateEndDate(planType),
    status: 'active',
    freezeCount: 0
  };
  
  members.push(member);
  memberships.push(membership);
  
  res.status(201).json({ member, membership });
};

const generateVATNumber = () => {
  return `VAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const calculateEndDate = (planType) => {
  switch(planType) {
    case 'monthly':
      return moment().add(1, 'month').toISOString();
    case 'quarterly':
      return moment().add(3, 'months').toISOString();
    case 'yearly':
      return moment().add(1, 'year').toISOString();
    default:
      return moment().add(1, 'month').toISOString();
  }
};

module.exports = {
  requestMembershipTransfer,
  processTransferPayment,
  approveTransfer,
  requestMembershipFreeze,
  validateGateAccess,
  createEvent,
  bookEvent,
  createWorkoutPlan,
  createDietPlan,
  createBranch,
  registerUAEMember,
  membershipTransfers,
  membershipFreezes,
  attendanceLogs,
  workoutPlans,
  dietPlans,
  events,
  gateAccessLogs,
  branches
};