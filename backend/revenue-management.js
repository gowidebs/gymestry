const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Professional Revenue Management Features
const subscriptions = [];
const payments = [];
const invoices = [];
const revenueAnalytics = [];

// Automated Billing System
const createSubscription = (req, res) => {
  const { memberId, planType, amount, billingCycle, startDate } = req.body;
  
  const subscription = {
    id: uuidv4(),
    memberId,
    planType,
    amount, // AED
    billingCycle, // monthly, quarterly, yearly
    startDate,
    nextBillingDate: calculateNextBilling(startDate, billingCycle),
    status: 'active',
    autoRenew: true,
    createdAt: new Date().toISOString()
  };
  
  subscriptions.push(subscription);
  res.status(201).json({ subscription });
};

// Revenue Forecasting
const getRevenueForcast = (req, res) => {
  const { months = 12 } = req.query;
  
  const forecast = [];
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  
  for (let i = 0; i < months; i++) {
    const month = moment().add(i, 'months');
    let monthlyRevenue = 0;
    
    activeSubscriptions.forEach(sub => {
      if (sub.billingCycle === 'monthly') {
        monthlyRevenue += sub.amount;
      } else if (sub.billingCycle === 'quarterly' && month.month() % 3 === 0) {
        monthlyRevenue += sub.amount;
      } else if (sub.billingCycle === 'yearly' && month.month() === moment(sub.startDate).month()) {
        monthlyRevenue += sub.amount;
      }
    });
    
    forecast.push({
      month: month.format('YYYY-MM'),
      projectedRevenue: monthlyRevenue,
      activeMembers: activeSubscriptions.length,
      averageRevenuePerMember: monthlyRevenue / activeSubscriptions.length || 0
    });
  }
  
  res.json({ forecast });
};

// Member Lifetime Value
const getMemberLTV = (req, res) => {
  const { memberId } = req.params;
  
  const memberPayments = payments.filter(p => p.memberId === memberId);
  const totalRevenue = memberPayments.reduce((sum, p) => sum + p.amount, 0);
  const membershipDuration = calculateMembershipDuration(memberId);
  const averageMonthlyRevenue = totalRevenue / membershipDuration;
  
  // Predict LTV based on churn rate
  const churnRate = 0.05; // 5% monthly churn
  const predictedLTV = averageMonthlyRevenue / churnRate;
  
  res.json({
    memberId,
    totalRevenue,
    membershipDuration,
    averageMonthlyRevenue,
    predictedLTV,
    currency: 'AED'
  });
};

// Churn Prediction
const getChurnPrediction = (req, res) => {
  const predictions = [];
  
  subscriptions.forEach(sub => {
    const member = members.find(m => m.id === sub.memberId);
    if (!member) return;
    
    // Calculate churn risk factors
    const lastPayment = payments.filter(p => p.memberId === sub.memberId).pop();
    const daysSinceLastPayment = moment().diff(lastPayment?.date, 'days') || 0;
    const attendanceFrequency = calculateAttendanceFrequency(sub.memberId);
    
    let churnRisk = 'low';
    let riskScore = 0;
    
    // Risk factors
    if (daysSinceLastPayment > 30) riskScore += 30;
    if (attendanceFrequency < 2) riskScore += 25; // Less than 2 visits per week
    if (sub.planType === 'monthly') riskScore += 15; // Monthly plans have higher churn
    
    if (riskScore > 50) churnRisk = 'high';
    else if (riskScore > 25) churnRisk = 'medium';
    
    predictions.push({
      memberId: sub.memberId,
      memberName: member.name,
      churnRisk,
      riskScore,
      lastPayment: lastPayment?.date,
      attendanceFrequency,
      recommendations: generateRetentionRecommendations(riskScore)
    });
  });
  
  res.json({ predictions });
};

// Dynamic Pricing
const getPricingRecommendations = (req, res) => {
  const { planType, targetMargin = 0.3 } = req.query;
  
  // Analyze competitor pricing and demand
  const currentPlans = subscriptions.filter(s => s.planType === planType);
  const averagePrice = currentPlans.reduce((sum, s) => sum + s.amount, 0) / currentPlans.length;
  const demandScore = currentPlans.length / subscriptions.length;
  
  let recommendedPrice = averagePrice;
  
  // Adjust based on demand
  if (demandScore > 0.6) {
    recommendedPrice *= 1.1; // High demand, increase price
  } else if (demandScore < 0.3) {
    recommendedPrice *= 0.9; // Low demand, decrease price
  }
  
  // UAE market adjustments
  const uaeMarketMultiplier = 1.15; // UAE premium
  recommendedPrice *= uaeMarketMultiplier;
  
  res.json({
    planType,
    currentAveragePrice: averagePrice,
    recommendedPrice: Math.round(recommendedPrice),
    demandScore,
    targetMargin,
    currency: 'AED',
    marketAnalysis: {
      competitorRange: [averagePrice * 0.8, averagePrice * 1.2],
      uaeMarketPremium: '15%',
      priceElasticity: demandScore > 0.5 ? 'low' : 'high'
    }
  });
};

// Payment Retry Logic
const processFailedPayments = (req, res) => {
  const failedPayments = payments.filter(p => p.status === 'failed');
  const retryResults = [];
  
  failedPayments.forEach(payment => {
    const retryAttempts = payment.retryAttempts || 0;
    
    if (retryAttempts < 3) {
      // Simulate retry
      const success = Math.random() > 0.3; // 70% success rate on retry
      
      if (success) {
        payment.status = 'completed';
        payment.completedAt = new Date().toISOString();
      } else {
        payment.retryAttempts = retryAttempts + 1;
        payment.nextRetryDate = moment().add(retryAttempts + 1, 'days').toISOString();
      }
      
      retryResults.push({
        paymentId: payment.id,
        memberId: payment.memberId,
        amount: payment.amount,
        status: payment.status,
        retryAttempt: retryAttempts + 1,
        nextRetryDate: payment.nextRetryDate
      });
    }
  });
  
  res.json({ retryResults, totalProcessed: retryResults.length });
};

// Helper Functions
const calculateNextBilling = (startDate, cycle) => {
  const start = moment(startDate);
  switch (cycle) {
    case 'monthly':
      return start.add(1, 'month').toISOString();
    case 'quarterly':
      return start.add(3, 'months').toISOString();
    case 'yearly':
      return start.add(1, 'year').toISOString();
    default:
      return start.add(1, 'month').toISOString();
  }
};

const calculateMembershipDuration = (memberId) => {
  const member = members.find(m => m.id === memberId);
  if (!member) return 0;
  return moment().diff(member.registrationDate, 'months') || 1;
};

const calculateAttendanceFrequency = (memberId) => {
  const memberAttendance = attendanceLogs.filter(a => a.userId === memberId);
  const lastMonth = memberAttendance.filter(a => 
    moment(a.checkInTime).isAfter(moment().subtract(1, 'month'))
  );
  return lastMonth.length / 4; // Average per week
};

const generateRetentionRecommendations = (riskScore) => {
  const recommendations = [];
  
  if (riskScore > 40) {
    recommendations.push('Offer personal training session');
    recommendations.push('Send retention discount (10% off next month)');
  }
  if (riskScore > 25) {
    recommendations.push('Schedule check-in call');
    recommendations.push('Invite to group classes');
  }
  
  recommendations.push('Send workout tips via app');
  return recommendations;
};

module.exports = {
  createSubscription,
  getRevenueForcast,
  getMemberLTV,
  getChurnPrediction,
  getPricingRecommendations,
  processFailedPayments,
  subscriptions,
  payments,
  invoices
};