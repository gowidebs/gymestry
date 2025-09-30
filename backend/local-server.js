const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const uaeFeatures = require('./uae-features');

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const mockGyms = [
  {
    gymId: uuidv4(),
    name: "Fitness First Dubai Mall",
    description: "Premium fitness center with modern equipment",
    address: "Dubai Mall, Downtown Dubai",
    latitude: 25.1972,
    longitude: 55.2744,
    rating: 4.5,
    phone: "+971501234567",
    images: ["https://via.placeholder.com/400x200"]
  },
  {
    gymId: uuidv4(),
    name: "Gold's Gym Marina",
    description: "World-class gym with professional trainers",
    address: "Dubai Marina Mall",
    latitude: 25.0657,
    longitude: 55.1393,
    rating: 4.3,
    phone: "+971507654321",
    images: ["https://via.placeholder.com/400x200"]
  }
];

const mockBookings = [];
const leads = [];
const products = [];
const sales = [];
const promotions = [];
const notifications = [];
const memberships = [];
const media = [];
const settings = {};
const members = [];
const instagramMessages = [];
const facebookMessages = [];
const whatsappMessages = [];
const instagramConfig = {
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || 'demo_token',
  pageId: process.env.INSTAGRAM_PAGE_ID || 'demo_page_id'
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Gymestry UAE Gym Management API',
    version: '2.0.0',
    features: ['UAE Compliance', 'Membership Transfer', 'Gate Access', 'Event Scheduling'],
    endpoints: {
      gyms: '/gyms/nearby (POST), /gyms/:id (GET)',
      bookings: '/bookings (POST), /bookings/user/:userId (GET)',
      leads: '/leads (GET/POST)',
      dashboard: '/dashboard (GET)',
      pos: '/pos/products (GET/POST), /pos/sales (GET/POST)',
      promotions: '/promotions (GET/POST)',
      memberships: '/memberships (GET/POST)',
      media: '/media (GET/POST)',
      settings: '/settings (GET), /settings/:category (PUT)'
    }
  });
});

app.post('/gyms/nearby', (req, res) => {
  res.json({ gyms: mockGyms });
});

app.get('/gyms/:gymId', (req, res) => {
  const gym = mockGyms.find(g => g.gymId === req.params.gymId);
  if (gym) {
    res.json({ gym });
  } else {
    res.status(404).json({ error: 'Gym not found' });
  }
});

app.post('/bookings', (req, res) => {
  const booking = {
    bookingId: uuidv4(),
    ...req.body,
    status: 'confirmed',
    bookingDate: new Date().toISOString()
  };
  mockBookings.push(booking);
  res.status(201).json({ booking });
});

app.get('/bookings/user/:userId', (req, res) => {
  const userBookings = mockBookings.filter(b => b.userId === req.params.userId);
  res.json({ bookings: userBookings });
});

app.put('/bookings/:bookingId/cancel', (req, res) => {
  const booking = mockBookings.find(b => b.bookingId === req.params.bookingId);
  if (booking) {
    booking.status = 'cancelled';
    res.json({ booking });
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

// GoGym Business Management Routes
app.get('/leads', (req, res) => {
  res.json(leads);
});

app.post('/leads', (req, res) => {
  const lead = {
    id: uuidv4(),
    ...req.body,
    status: req.body.status || 'Cold',
    createdAt: new Date().toISOString()
  };
  leads.push(lead);
  res.status(201).json(lead);
});

app.put('/leads/:id', (req, res) => {
  const index = leads.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    leads[index] = { ...leads[index], ...req.body };
    res.json(leads[index]);
  } else {
    res.status(404).json({ error: 'Lead not found' });
  }
});

app.delete('/leads/:id', (req, res) => {
  const index = leads.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    leads.splice(index, 1);
    res.json({ message: 'Lead deleted' });
  } else {
    res.status(404).json({ error: 'Lead not found' });
  }
});

app.get('/dashboard', (req, res) => {
  const type = req.query.type || 'overview';
  const dashboardData = {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.status === 'Hot').length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.total || 0), 0) || 48840,
    totalMembers: memberships.length || 456,
    ptSessions: 180,
    newLeads: leads.filter(l => {
      const created = new Date(l.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created > weekAgo;
    }).length || 89
  };
  res.json(dashboardData);
});

// Simulate real-time Instagram messages
setInterval(() => {
  const demoMessages = [
    'Hello, are you open today?',
    'What are your membership packages?',
    'Do you have personal training?',
    'Can I get a free trial?',
    'What time do you close?'
  ];
  
  const demoUsernames = [
    '@fitness_lover',
    '@gym_enthusiast',
    '@health_seeker',
    '@workout_warrior',
    '@strong_person'
  ];
  
  // Add random message every 30 seconds (for demo)
  if (Math.random() > 0.7) {
    const message = {
      id: uuidv4(),
      instagramId: `ig_${Date.now()}`,
      username: demoUsernames[Math.floor(Math.random() * demoUsernames.length)],
      message: demoMessages[Math.floor(Math.random() * demoMessages.length)],
      timestamp: new Date().toISOString(),
      isRead: false,
      isLead: true,
      branchId: 'branch1'
    };
    instagramMessages.push(message);
    
    // Keep only last 50 messages
    if (instagramMessages.length > 50) {
      instagramMessages.shift();
    }
  }
}, 30000);

// Add some demo data
if (leads.length === 0) {
  leads.push(
    {
      id: uuidv4(),
      name: 'Ahmed Al Rashid',
      phone: '+971 50 123 4567',
      status: 'Hot',
      source: 'Social App',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Sarah Johnson',
      phone: '+971 55 987 6543',
      status: 'Trial',
      source: 'Landing Page',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Mohammed Hassan',
      phone: '+971 52 456 7890',
      status: 'Cold',
      source: 'Referral',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  );
}

app.get('/pos/:type', (req, res) => {
  if (req.params.type === 'products') {
    res.json(products);
  } else {
    res.json(sales);
  }
});

app.post('/pos/:type', (req, res) => {
  if (req.params.type === 'products') {
    const product = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
    products.push(product);
    res.status(201).json(product);
  } else {
    const sale = { id: uuidv4(), ...req.body, timestamp: new Date().toISOString() };
    sales.push(sale);
    res.status(201).json(sale);
  }
});

app.get('/promotions', (req, res) => {
  res.json(promotions);
});

app.post('/promotions', (req, res) => {
  const promotion = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  promotions.push(promotion);
  res.status(201).json(promotion);
});

app.get('/memberships', (req, res) => {
  res.json(memberships);
});

app.post('/memberships', (req, res) => {
  const membership = { id: uuidv4(), ...req.body, status: 'active', createdAt: new Date().toISOString() };
  memberships.push(membership);
  res.status(201).json(membership);
});

app.get('/media', (req, res) => {
  res.json(media);
});

app.post('/media', (req, res) => {
  const mediaItem = { id: uuidv4(), ...req.body, uploadedAt: new Date().toISOString() };
  media.push(mediaItem);
  res.status(201).json(mediaItem);
});

app.get('/settings', (req, res) => {
  res.json(settings);
});

app.put('/settings/:category', (req, res) => {
  settings[req.params.category] = { ...req.body, updatedAt: new Date().toISOString() };
  res.json(settings[req.params.category]);
});

// Members Management
app.get('/members', (req, res) => {
  res.json(members);
});

app.post('/members', (req, res) => {
  const member = {
    id: uuidv4(),
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiryDate: calculateMembershipExpiry(req.body.plan)
  };
  members.push(member);
  res.status(201).json(member);
});

app.put('/members/:id/renew', (req, res) => {
  const index = members.findIndex(m => m.id === req.params.id);
  if (index !== -1) {
    members[index].expiryDate = calculateMembershipExpiry(req.body.plan);
    members[index].renewedAt = new Date().toISOString();
    res.json(members[index]);
  } else {
    res.status(404).json({ error: 'Member not found' });
  }
});

function calculateMembershipExpiry(plan) {
  const now = new Date();
  switch(plan) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
    case 'annual':
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    default:
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
  }
}

// Instagram Integration
app.get('/instagram/messages', (req, res) => {
  const branchId = req.query.branch || 'branch1';
  const branchMessages = instagramMessages.filter(m => m.branchId === branchId);
  res.json(branchMessages);
});

app.post('/instagram/messages', (req, res) => {
  const message = {
    id: uuidv4(),
    ...req.body,
    timestamp: new Date().toISOString(),
    isRead: false,
    isLead: isLeadMessage(req.body.message || '')
  };
  instagramMessages.push(message);
  
  // Auto-create lead if message contains lead keywords
  if (message.isLead) {
    const lead = {
      id: uuidv4(),
      name: message.username,
      phone: '',
      source: 'Instagram',
      status: 'Cold',
      message: message.message,
      instagramId: message.instagramId,
      createdAt: message.timestamp,
      branchId: message.branchId
    };
    leads.push(lead);
  }
  
  res.status(201).json(message);
});

app.put('/instagram/messages/:id/read', (req, res) => {
  const index = instagramMessages.findIndex(m => m.id === req.params.id);
  if (index !== -1) {
    instagramMessages[index].isRead = true;
    res.json(instagramMessages[index]);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

app.post('/instagram/convert-lead', (req, res) => {
  const { messageId, name, phone } = req.body;
  const message = instagramMessages.find(m => m.id === messageId);
  
  if (message) {
    const lead = {
      id: uuidv4(),
      name: name || message.username,
      phone: phone || '',
      source: 'Instagram',
      status: 'Hot',
      message: message.message,
      instagramId: message.instagramId,
      createdAt: new Date().toISOString(),
      branchId: message.branchId
    };
    leads.push(lead);
    message.isLead = true;
    res.json(lead);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

function isLeadMessage(message) {
  const leadKeywords = [
    'membership', 'price', 'cost', 'join', 'sign up', 'register',
    'trial', 'free', 'discount', 'offer', 'class', 'trainer',
    'gym', 'fitness', 'workout', 'schedule', 'timing', 'hello', 'hi'
  ];
  
  return leadKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

// Add demo Instagram messages
if (instagramMessages.length === 0) {
  instagramMessages.push(
    {
      id: uuidv4(),
      instagramId: 'ig_123456',
      username: '@ahmed_fitness',
      message: 'Hi! What are your membership prices?',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      isRead: false,
      isLead: true,
      branchId: 'branch1'
    },
    {
      id: uuidv4(),
      instagramId: 'ig_789012',
      username: '@sarah_wellness',
      message: 'Do you have yoga classes for beginners?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      isLead: true,
      branchId: 'branch1'
    },
    {
      id: uuidv4(),
      instagramId: 'ig_345678',
      username: '@mike_strong',
      message: 'What are your gym timings?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      isRead: false,
      isLead: true,
      branchId: 'branch1'
    }
  );
}

// Professional Revenue Management
const revenueManagement = require('./revenue-management');
const socialFeatures = require('./social-features');
const countryConfig = require('./country-config');
const multiGymSystem = require('./multi-gym-system');

// Country Configuration Routes
app.use('/api/country', countryConfig);
app.use('/api/multi-gym', multiGymSystem);
app.post('/subscriptions', revenueManagement.createSubscription);
app.get('/revenue/forecast', revenueManagement.getRevenueForcast);
app.get('/members/:memberId/ltv', revenueManagement.getMemberLTV);
app.get('/analytics/churn', revenueManagement.getChurnPrediction);
app.get('/pricing/recommendations', revenueManagement.getPricingRecommendations);
app.post('/payments/retry', revenueManagement.processFailedPayments);

// UAE-specific routes
app.post('/transfers/request', uaeFeatures.requestMembershipTransfer);
app.post('/transfers/payment', uaeFeatures.processTransferPayment);
app.post('/transfers/approve', uaeFeatures.approveTransfer);
app.get('/transfers', (req, res) => res.json(uaeFeatures.membershipTransfers));

app.post('/memberships/freeze', uaeFeatures.requestMembershipFreeze);
app.get('/memberships/freezes', (req, res) => res.json(uaeFeatures.membershipFreezes));

app.post('/gate/validate', uaeFeatures.validateGateAccess);
app.get('/gate/logs', (req, res) => res.json(uaeFeatures.gateAccessLogs));

app.post('/events', uaeFeatures.createEvent);
app.post('/events/book', uaeFeatures.bookEvent);
app.get('/events', (req, res) => res.json(uaeFeatures.events));

app.post('/workout-plans', uaeFeatures.createWorkoutPlan);
app.get('/workout-plans', (req, res) => res.json(uaeFeatures.workoutPlans));

app.post('/diet-plans', uaeFeatures.createDietPlan);
app.get('/diet-plans', (req, res) => res.json(uaeFeatures.dietPlans));

app.post('/branches', uaeFeatures.createBranch);
app.get('/branches', (req, res) => res.json(uaeFeatures.branches));

app.post('/members/uae-register', uaeFeatures.registerUAEMember);
app.get('/attendance', (req, res) => res.json(uaeFeatures.attendanceLogs));

// Class Scheduling System (PushPress Features)
const classScheduling = require('./class-scheduling');
app.post('/classes', classScheduling.createClass);
app.post('/classes/schedule', classScheduling.scheduleClass);
app.post('/classes/book', classScheduling.bookClass);
app.post('/classes/cancel', classScheduling.cancelBooking);
app.post('/classes/checkin', classScheduling.checkInToClass);
app.post('/packages', classScheduling.createClassPackage);
app.post('/packages/purchase', classScheduling.purchasePackage);
app.get('/schedule', classScheduling.getClassSchedule);
app.post('/instructors', classScheduling.createInstructor);
app.get('/analytics/classes', classScheduling.getClassAnalytics);

// Omnichannel Messaging (Respond.io Features)
const messaging = require('./omnichannel-messaging');
app.post('/conversations', messaging.createConversation);
app.post('/messages/send', messaging.sendMessage);
app.post('/messages/receive', messaging.receiveMessage);
app.post('/contacts', messaging.createContact);
app.post('/templates', messaging.createTemplate);
app.post('/automations', messaging.createAutomation);
app.get('/analytics/messaging', messaging.getMessagingAnalytics);
app.get('/conversations', (req, res) => res.json(messaging.conversations));
app.get('/messages', (req, res) => res.json(messaging.messages));

// Social Features (Competing with AllUp)
app.post('/social/posts', socialFeatures.createPost);
app.get('/social/feed', socialFeatures.getSocialFeed);
app.post('/social/like', socialFeatures.likePost);
app.post('/challenges', socialFeatures.createChallenge);
app.post('/challenges/join', socialFeatures.joinChallenge);
app.post('/challenges/progress', socialFeatures.updateChallengeProgress);
app.post('/workouts/log', socialFeatures.logWorkout);
app.get('/challenges', (req, res) => res.json(socialFeatures.challenges));
app.get('/achievements', (req, res) => res.json(socialFeatures.achievements));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🏋️ Gymestry UAE Server running on http://localhost:${PORT}`);
  console.log('🇦🇪 UAE Gym Management Features:');
  console.log('  - Membership Transfers (AED 150 fee)');
  console.log('  - Membership Freeze (Yearly only)');
  console.log('  - Multi-Gate Access (QR/BLE/Face)');
  console.log('  - Event/Class Scheduling');
  console.log('  - Workout & Diet Plans');
  console.log('  - Emirates ID Registration');
  console.log('  - Branch Licensing');
  console.log('📊 Standard Features:');
  console.log('  - Lead Management: /leads');
  console.log('  - Dashboard Analytics: /dashboard');
  console.log('  - POS System: /pos/products, /pos/sales');
  console.log('  - Promotions: /promotions');
  console.log('  - Memberships: /memberships');
  console.log('  - Media: /media');
  console.log('  - Settings: /settings');
});