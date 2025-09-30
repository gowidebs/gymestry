const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Multi-gym franchise management
const gyms = [];
const gymOwners = [];
const franchiseSettings = {};

// Create new gym franchise
router.post('/gyms/create', (req, res) => {
  const { ownerName, gymName, branding, location, country, subscription } = req.body;
  
  const gym = {
    gymId: uuidv4(),
    ownerId: uuidv4(),
    gymName,
    branding: {
      logo: branding?.logo || '',
      primaryColor: branding?.primaryColor || '#E53E3E',
      secondaryColor: branding?.secondaryColor || '#FFFFFF',
      customDomain: `${gymName.toLowerCase().replace(/\s+/g, '')}.gymestry.com`
    },
    location,
    country,
    subscription: {
      plan: subscription?.plan || 'starter',
      price: subscription?.price || 399,
      currency: subscription?.currency || 'AED',
      status: 'active',
      startDate: new Date().toISOString(),
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    features: getFeaturesByPlan(subscription?.plan || 'starter'),
    settings: {
      maxMembers: subscription?.plan === 'enterprise' ? 10000 : subscription?.plan === 'professional' ? 2000 : 500,
      maxStaff: subscription?.plan === 'enterprise' ? 100 : subscription?.plan === 'professional' ? 20 : 5,
      maxBranches: subscription?.plan === 'enterprise' ? 50 : subscription?.plan === 'professional' ? 5 : 1
    },
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  const owner = {
    ownerId: gym.ownerId,
    name: ownerName,
    email: req.body.email,
    phone: req.body.phone,
    gyms: [gym.gymId],
    role: 'gym_owner',
    createdAt: new Date().toISOString()
  };
  
  gyms.push(gym);
  gymOwners.push(owner);
  
  res.status(201).json({
    success: true,
    gym,
    owner,
    loginUrl: `https://${gym.branding.customDomain}/login`,
    setupInstructions: generateSetupInstructions(gym)
  });
});

// Get gym configuration
router.get('/gyms/:gymId/config', (req, res) => {
  const gym = gyms.find(g => g.gymId === req.params.gymId);
  if (!gym) {
    return res.status(404).json({ error: 'Gym not found' });
  }
  
  res.json({
    gym,
    branding: gym.branding,
    features: gym.features,
    settings: gym.settings,
    subscription: gym.subscription
  });
});

// Update gym branding
router.put('/gyms/:gymId/branding', (req, res) => {
  const gym = gyms.find(g => g.gymId === req.params.gymId);
  if (!gym) {
    return res.status(404).json({ error: 'Gym not found' });
  }
  
  gym.branding = { ...gym.branding, ...req.body };
  gym.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    branding: gym.branding,
    message: 'Branding updated successfully'
  });
});

// Subscription management
router.post('/gyms/:gymId/upgrade', (req, res) => {
  const { newPlan } = req.body;
  const gym = gyms.find(g => g.gymId === req.params.gymId);
  
  if (!gym) {
    return res.status(404).json({ error: 'Gym not found' });
  }
  
  const pricing = {
    starter: { price: 399, currency: 'AED' },
    professional: { price: 799, currency: 'AED' },
    enterprise: { price: 1199, currency: 'AED' }
  };
  
  gym.subscription.plan = newPlan;
  gym.subscription.price = pricing[newPlan].price;
  gym.features = getFeaturesByPlan(newPlan);
  gym.settings = {
    maxMembers: newPlan === 'enterprise' ? 10000 : newPlan === 'professional' ? 2000 : 500,
    maxStaff: newPlan === 'enterprise' ? 100 : newPlan === 'professional' ? 20 : 5,
    maxBranches: newPlan === 'enterprise' ? 50 : newPlan === 'professional' ? 5 : 1
  };
  
  res.json({
    success: true,
    subscription: gym.subscription,
    features: gym.features,
    message: `Upgraded to ${newPlan} plan successfully`
  });
});

// Franchise analytics
router.get('/franchise/analytics', (req, res) => {
  const totalGyms = gyms.length;
  const activeGyms = gyms.filter(g => g.status === 'active').length;
  const totalRevenue = gyms.reduce((sum, g) => sum + g.subscription.price, 0);
  const planDistribution = gyms.reduce((acc, g) => {
    acc[g.subscription.plan] = (acc[g.subscription.plan] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    totalGyms,
    activeGyms,
    totalRevenue,
    planDistribution,
    averageRevenuePerGym: totalRevenue / totalGyms || 0,
    countryDistribution: gyms.reduce((acc, g) => {
      acc[g.country] = (acc[g.country] || 0) + 1;
      return acc;
    }, {})
  });
});

function getFeaturesByPlan(plan) {
  const features = {
    starter: [
      'member_management', 'basic_analytics', 'payment_processing',
      'class_scheduling', 'mobile_app', 'email_support'
    ],
    professional: [
      'member_management', 'advanced_analytics', 'payment_processing',
      'class_scheduling', 'mobile_app', 'staff_management',
      'marketing_tools', 'integrations', 'phone_support', 'custom_branding'
    ],
    enterprise: [
      'member_management', 'advanced_analytics', 'payment_processing',
      'class_scheduling', 'mobile_app', 'staff_management',
      'marketing_tools', 'integrations', 'multi_branch', 'api_access',
      'custom_branding', 'priority_support', 'dedicated_manager',
      'advanced_reporting', 'white_label'
    ]
  };
  
  return features[plan] || features.starter;
}

function generateSetupInstructions(gym) {
  return {
    steps: [
      'Complete gym profile and upload logo',
      'Add staff members and assign roles',
      'Configure membership packages and pricing',
      'Set up payment gateway integration',
      'Import existing member data (if any)',
      'Configure class schedules and instructors',
      'Test mobile app with custom branding',
      'Launch and start onboarding members'
    ],
    estimatedTime: '2-4 hours',
    supportContact: 'setup@gymestry.com'
  };
}

module.exports = router;