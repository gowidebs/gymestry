const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Member analytics data
let analyticsData = {
  growth: {
    monthlyGrowthRate: 12.3,
    newMembersYTD: 742,
    retentionRate: 87.5,
    churnRate: 12.5,
    netGrowth: 628,
    monthlyData: [45, 52, 48, 61, 55, 67, 72, 58, 63, 69, 74, 78],
    churnData: [12, 15, 18, 14, 16, 13, 11, 19, 17, 14, 12, 15]
  },
  churn: {
    highRiskMembers: 62,
    mediumRiskMembers: 247,
    predictedChurn: 15.2,
    revenueAtRisk: 18600,
    predictionAccuracy: 85,
    riskDistribution: {
      lowRisk: 65,
      mediumRisk: 20,
      highRisk: 10,
      criticalRisk: 5
    }
  },
  usage: {
    peakHours: '6-9 PM',
    busiestDay: 'Friday',
    equipmentUsage: 78,
    avgVisitsPerWeek: 3.2,
    weeklyPatterns: {
      morning: [180, 165, 172, 168, 175, 145, 120],
      evening: [220, 210, 225, 215, 230, 195, 160]
    }
  },
  ltv: {
    averageLTV: 4250,
    highValueLTV: 8500,
    ltvGrowth: 18,
    paybackPeriod: 8.2,
    revenuePerMember: 295,
    segments: {
      highValue: { members: 156, percentage: 12.6, revenue: 1326000, tenure: 28 },
      mediumValue: { members: 742, percentage: 60.1, revenue: 3153500, tenure: 18 },
      standardValue: { members: 336, percentage: 27.3, revenue: 806400, tenure: 8 }
    }
  },
  demographics: {
    genderSplit: { male: 58, female: 42 },
    dominantAgeGroup: '26-35',
    uaeNationals: 65,
    ageDistribution: {
      male: [120, 280, 220, 150, 80],
      female: [95, 240, 180, 120, 65]
    },
    nationality: {
      uae: { percentage: 65, count: 802 },
      indian: { percentage: 15, count: 185 },
      pakistani: { percentage: 8, count: 99 },
      other: { percentage: 12, count: 148 }
    },
    income: {
      high: { percentage: 70, count: 864 },
      medium: { percentage: 25, count: 309 },
      low: { percentage: 5, count: 61 }
    }
  }
};

// Growth & Retention Analytics
app.get('/api/analytics/growth', (req, res) => {
  res.json({
    success: true,
    data: analyticsData.growth,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics/retention-cohort', (req, res) => {
  const cohortData = [
    { cohort: 'Jan 2024', month1: 95, month3: 89, month6: 82, month12: 75 },
    { cohort: 'Feb 2024', month1: 93, month3: 87, month6: 80, month12: 73 },
    { cohort: 'Mar 2024', month1: 96, month3: 91, month6: 85, month12: 78 }
  ];
  
  res.json({ success: true, data: cohortData });
});

// Churn Prediction Analytics
app.get('/api/analytics/churn', (req, res) => {
  res.json({
    success: true,
    data: analyticsData.churn,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics/churn/high-risk-members', (req, res) => {
  const highRiskMembers = [
    { id: 1, name: 'Sarah Johnson', riskScore: 92, lastVisit: '15 days ago', membership: 'Premium Monthly' },
    { id: 2, name: 'Mike Chen', riskScore: 78, lastVisit: '8 days ago', membership: 'Standard Monthly' },
    { id: 3, name: 'Lisa Park', riskScore: 71, lastVisit: '12 days ago', membership: 'Basic Monthly' }
  ];
  
  res.json({ success: true, data: highRiskMembers });
});

app.post('/api/analytics/churn/intervention', (req, res) => {
  const { memberIds, interventionType } = req.body;
  
  const interventions = memberIds.map(id => ({
    memberId: id,
    interventionType,
    scheduledAt: new Date().toISOString(),
    status: 'Scheduled'
  }));
  
  res.json({
    success: true,
    data: interventions,
    message: `${interventionType} intervention scheduled for ${memberIds.length} members`
  });
});

// Usage Patterns Analytics
app.get('/api/analytics/usage', (req, res) => {
  res.json({
    success: true,
    data: analyticsData.usage,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics/usage/patterns', (req, res) => {
  const { period = 'weekly' } = req.query;
  
  let patternData;
  if (period === 'weekly') {
    patternData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      morning: analyticsData.usage.weeklyPatterns.morning,
      evening: analyticsData.usage.weeklyPatterns.evening
    };
  }
  
  res.json({ success: true, data: patternData });
});

app.get('/api/analytics/usage/insights', (req, res) => {
  const insights = [
    {
      type: 'Morning Warriors',
      timeSlot: '6-9 AM',
      percentage: 22,
      averageMembers: 168,
      description: '22% of members prefer morning workouts'
    },
    {
      type: 'Evening Rush',
      timeSlot: '6-9 PM',
      percentage: 35,
      averageMembers: 215,
      description: 'Peak capacity with highest engagement'
    },
    {
      type: 'Cardio Enthusiasts',
      equipment: 'Treadmills',
      percentage: 65,
      description: '65% prefer cardio over strength training'
    },
    {
      type: 'Strength Trainers',
      equipment: 'Weight Training',
      percentage: 35,
      peakDays: ['Monday', 'Wednesday', 'Friday'],
      description: '35% focus on weight training'
    }
  ];
  
  res.json({ success: true, data: insights });
});

// Lifetime Value Analytics
app.get('/api/analytics/ltv', (req, res) => {
  res.json({
    success: true,
    data: analyticsData.ltv,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics/ltv/segments', (req, res) => {
  const segments = [
    {
      name: 'High-Value',
      threshold: 8500,
      members: analyticsData.ltv.segments.highValue.members,
      percentage: analyticsData.ltv.segments.highValue.percentage,
      revenue: analyticsData.ltv.segments.highValue.revenue,
      avgTenure: analyticsData.ltv.segments.highValue.tenure
    },
    {
      name: 'Medium-Value',
      threshold: '3000-8500',
      members: analyticsData.ltv.segments.mediumValue.members,
      percentage: analyticsData.ltv.segments.mediumValue.percentage,
      revenue: analyticsData.ltv.segments.mediumValue.revenue,
      avgTenure: analyticsData.ltv.segments.mediumValue.tenure
    },
    {
      name: 'Standard-Value',
      threshold: 'Under 3000',
      members: analyticsData.ltv.segments.standardValue.members,
      percentage: analyticsData.ltv.segments.standardValue.percentage,
      revenue: analyticsData.ltv.segments.standardValue.revenue,
      avgTenure: analyticsData.ltv.segments.standardValue.tenure
    }
  ];
  
  res.json({ success: true, data: segments });
});

app.get('/api/analytics/ltv/trend', (req, res) => {
  const ltvTrend = [
    { tenure: 6, ltv: 1800 },
    { tenure: 12, ltv: 3600 },
    { tenure: 18, ltv: 5400 },
    { tenure: 24, ltv: 7200 },
    { tenure: 30, ltv: 9000 },
    { tenure: 36, ltv: 10800 }
  ];
  
  res.json({ success: true, data: ltvTrend });
});

// Demographics Analytics
app.get('/api/analytics/demographics', (req, res) => {
  res.json({
    success: true,
    data: analyticsData.demographics,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics/demographics/age-gender', (req, res) => {
  const ageGenderData = {
    labels: ['18-25', '26-35', '36-45', '46-55', '55+'],
    male: analyticsData.demographics.ageDistribution.male,
    female: analyticsData.demographics.ageDistribution.female
  };
  
  res.json({ success: true, data: ageGenderData });
});

app.get('/api/analytics/demographics/nationality', (req, res) => {
  const nationalityData = [
    {
      country: 'UAE',
      flag: '🇦🇪',
      percentage: analyticsData.demographics.nationality.uae.percentage,
      count: analyticsData.demographics.nationality.uae.count
    },
    {
      country: 'India',
      flag: '🇮🇳',
      percentage: analyticsData.demographics.nationality.indian.percentage,
      count: analyticsData.demographics.nationality.indian.count
    },
    {
      country: 'Pakistan',
      flag: '🇵🇰',
      percentage: analyticsData.demographics.nationality.pakistani.percentage,
      count: analyticsData.demographics.nationality.pakistani.count
    },
    {
      country: 'Other',
      flag: '🌍',
      percentage: analyticsData.demographics.nationality.other.percentage,
      count: analyticsData.demographics.nationality.other.count
    }
  ];
  
  res.json({ success: true, data: nationalityData });
});

app.get('/api/analytics/demographics/income', (req, res) => {
  const incomeData = [
    {
      level: 'High Income (AED 15K+)',
      icon: '💎',
      percentage: analyticsData.demographics.income.high.percentage,
      count: analyticsData.demographics.income.high.count
    },
    {
      level: 'Medium Income (AED 8-15K)',
      icon: '⭐',
      percentage: analyticsData.demographics.income.medium.percentage,
      count: analyticsData.demographics.income.medium.count
    },
    {
      level: 'Lower Income (Under AED 8K)',
      icon: '📊',
      percentage: analyticsData.demographics.income.low.percentage,
      count: analyticsData.demographics.income.low.count
    }
  ];
  
  res.json({ success: true, data: incomeData });
});

// Analytics Dashboard Summary
app.get('/api/analytics/dashboard', (req, res) => {
  const dashboard = {
    summary: {
      totalMembers: 1234,
      monthlyGrowth: analyticsData.growth.monthlyGrowthRate,
      retentionRate: analyticsData.growth.retentionRate,
      averageLTV: analyticsData.ltv.averageLTV,
      churnRisk: analyticsData.churn.highRiskMembers,
      peakUsage: analyticsData.usage.peakHours
    },
    trends: {
      memberGrowth: analyticsData.growth.monthlyData.slice(-6),
      churnTrend: analyticsData.churn.riskDistribution,
      usagePattern: analyticsData.usage.weeklyPatterns.evening,
      ltvGrowth: [3800, 4000, 4100, 4200, 4250, 4300]
    },
    alerts: [
      { type: 'warning', message: '62 members at high churn risk', severity: 'high' },
      { type: 'success', message: 'Retention rate improved by 2.3%', severity: 'low' },
      { type: 'info', message: 'Peak usage on Friday evenings', severity: 'medium' }
    ]
  };
  
  res.json({ success: true, data: dashboard });
});

// Report Generation
app.post('/api/analytics/reports/generate', (req, res) => {
  const { reportType, dateRange, format } = req.body;
  
  const reports = {
    growth: {
      title: 'Growth & Retention Analysis',
      data: analyticsData.growth,
      insights: ['Monthly growth rate of 12.3%', 'Retention rate at 87.5%', '742 new members YTD']
    },
    churn: {
      title: 'Churn Prediction Report',
      data: analyticsData.churn,
      insights: ['62 high-risk members identified', '15.2% predicted churn rate', 'AED 18,600 revenue at risk']
    },
    usage: {
      title: 'Usage Pattern Analysis',
      data: analyticsData.usage,
      insights: ['Peak hours: 6-9 PM', 'Friday is busiest day', '78% equipment utilization']
    },
    ltv: {
      title: 'Lifetime Value Analysis',
      data: analyticsData.ltv,
      insights: ['Average LTV: AED 4,250', '18% LTV growth YoY', '8.2 months payback period']
    },
    demographics: {
      title: 'Demographic Report',
      data: analyticsData.demographics,
      insights: ['58% male, 42% female split', '26-35 age group dominates', '65% UAE nationals']
    }
  };
  
  const report = reports[reportType];
  if (!report) {
    return res.status(400).json({ success: false, message: 'Invalid report type' });
  }
  
  const generatedReport = {
    ...report,
    dateRange,
    format,
    generatedAt: new Date().toISOString(),
    filename: `${reportType}_analytics_${Date.now()}.${format}`
  };
  
  res.json({
    success: true,
    data: generatedReport,
    message: 'Analytics report generated successfully'
  });
});

// Export Analytics Data
app.post('/api/analytics/export', (req, res) => {
  const { sections, format } = req.body;
  
  const exportData = {
    format,
    sections,
    files: sections.map(section => `${section}_analytics.${format}`),
    generatedAt: new Date().toISOString(),
    totalRecords: 1234,
    fileSize: '3.2 MB'
  };
  
  res.json({
    success: true,
    data: exportData,
    message: `Analytics data exported in ${format.toUpperCase()} format`
  });
});

// Predictive Analytics
app.get('/api/analytics/predictions', (req, res) => {
  const predictions = {
    memberGrowth: {
      nextMonth: 85,
      nextQuarter: 245,
      confidence: 87
    },
    churnPrediction: {
      nextMonth: 18,
      nextQuarter: 52,
      confidence: 85
    },
    revenueImpact: {
      churnLoss: -18600,
      growthGain: 25400,
      netImpact: 6800
    },
    recommendations: [
      'Focus retention efforts on high-risk members',
      'Increase marketing during off-peak hours',
      'Develop premium services for high-LTV segments'
    ]
  };
  
  res.json({ success: true, data: predictions });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`📊 Member Analytics API running on port ${PORT}`);
  console.log(`🔍 Available endpoints:`);
  console.log(`   GET  /api/analytics/growth - Growth & retention data`);
  console.log(`   GET  /api/analytics/churn - Churn prediction analytics`);
  console.log(`   GET  /api/analytics/usage - Usage patterns & behavior`);
  console.log(`   GET  /api/analytics/ltv - Lifetime value analysis`);
  console.log(`   GET  /api/analytics/demographics - Demographic insights`);
  console.log(`   GET  /api/analytics/dashboard - Analytics dashboard`);
  console.log(`   POST /api/analytics/reports/generate - Generate reports`);
});

module.exports = app;