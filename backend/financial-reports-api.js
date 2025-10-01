const express = require('express');
const cors = require('cors');
const FinancialPDFGenerator = require('./pdf-generator');
const app = express();

app.use(cors());
app.use(express.json());

// Financial data structure
let financialData = {
  revenue: {
    monthly: 245680,
    yearly: 2456800,
    growth: 15.2,
    sources: {
      memberships: { amount: 159692, percentage: 65 },
      personalTraining: { amount: 61420, percentage: 25 },
      products: { amount: 24568, percentage: 10 }
    },
    monthlyTrend: [180000, 195000, 210000, 225000, 240000, 245680, 250000, 255000, 260000, 265000, 270000, 275000]
  },
  expenses: {
    monthly: 156420,
    yearly: 1564200,
    categories: {
      staffSalaries: { amount: 70389, percentage: 45, budget: 75000 },
      rentUtilities: { amount: 46926, percentage: 30, budget: 45000 },
      equipment: { amount: 23463, percentage: 15, budget: 25000 },
      marketing: { amount: 15642, percentage: 10, budget: 18000 }
    }
  },
  profitLoss: {
    revenue: 245680,
    expenses: 156420,
    grossProfit: 89260,
    netProfit: 89260,
    profitMargin: 36.3,
    ebitda: 95680,
    quarterly: {
      q1: { revenue: 720000, expenses: 480000, profit: 240000 },
      q2: { revenue: 750000, expenses: 495000, profit: 255000 },
      q3: { revenue: 780000, expenses: 510000, profit: 270000 },
      q4: { revenue: 810000, expenses: 525000, profit: 285000 }
    }
  },
  payments: {
    totalMembers: 1234,
    paidMembers: 1156,
    overdueMembers: 78,
    outstandingAmount: 23400,
    collectionRate: 93.7,
    memberPayments: [
      { id: 1, name: "Ahmed Al-Mansouri", plan: "Premium Annual", amount: 2400, dueDate: "2024-12-15", status: "paid" },
      { id: 2, name: "Sarah Johnson", plan: "Standard Monthly", amount: 300, dueDate: "2024-12-20", status: "overdue" },
      { id: 3, name: "Mike Chen", plan: "Premium Monthly", amount: 450, dueDate: "2024-12-25", status: "pending" },
      { id: 4, name: "Lisa Park", plan: "Basic Monthly", amount: 200, dueDate: "2024-12-10", status: "paid" }
    ]
  },
  vat: {
    rate: 5,
    collected: 12284,
    paid: 7821,
    netDue: 4463,
    quarter: "Q4 2024",
    outputVat: {
      memberships: { amount: 159692, vat: 7985 },
      training: { amount: 61420, vat: 3071 },
      products: { amount: 24568, vat: 1228 }
    },
    inputVat: {
      equipment: { amount: 78210, vat: 3911 },
      utilities: { amount: 46926, vat: 2346 },
      marketing: { amount: 31284, vat: 1564 }
    }
  },
  budget: {
    annualTarget: 3200000,
    growthTarget: 18,
    variance: -2.3,
    q1Forecast: 280000,
    quarterly: [
      { quarter: "Q1 2025", revenue: 780000, expenses: 520000, profit: 260000, growth: 15 },
      { quarter: "Q2 2025", revenue: 820000, expenses: 540000, profit: 280000, growth: 18 },
      { quarter: "Q3 2025", revenue: 860000, expenses: 560000, profit: 300000, growth: 20 },
      { quarter: "Q4 2025", revenue: 900000, expenses: 580000, profit: 320000, growth: 22 }
    ]
  }
};

// Revenue Tracking Endpoints
app.get('/api/financial/revenue', (req, res) => {
  res.json({
    success: true,
    data: financialData.revenue,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/financial/revenue/trend', (req, res) => {
  const { period = '12months' } = req.query;
  
  let trendData;
  if (period === '12months') {
    trendData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: financialData.revenue.monthlyTrend
    };
  }
  
  res.json({ success: true, data: trendData });
});

app.post('/api/financial/revenue/record', (req, res) => {
  const { source, amount, date, description } = req.body;
  
  // Simulate recording revenue
  const revenueRecord = {
    id: Date.now(),
    source,
    amount,
    date,
    description,
    recordedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: revenueRecord,
    message: 'Revenue recorded successfully'
  });
});

// Expense Tracking Endpoints
app.get('/api/financial/expenses', (req, res) => {
  res.json({
    success: true,
    data: financialData.expenses,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/financial/expenses/record', (req, res) => {
  const { category, amount, date, description, vendor } = req.body;
  
  const expenseRecord = {
    id: Date.now(),
    category,
    amount,
    date,
    description,
    vendor,
    recordedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: expenseRecord,
    message: 'Expense recorded successfully'
  });
});

app.get('/api/financial/expenses/budget-variance', (req, res) => {
  const variance = Object.keys(financialData.expenses.categories).map(category => {
    const cat = financialData.expenses.categories[category];
    return {
      category,
      budget: cat.budget,
      actual: cat.amount,
      variance: cat.budget - cat.amount,
      variancePercentage: ((cat.budget - cat.amount) / cat.budget * 100).toFixed(1)
    };
  });
  
  res.json({ success: true, data: variance });
});

// Profit & Loss Endpoints
app.get('/api/financial/profit-loss', (req, res) => {
  const { period = 'monthly' } = req.query;
  
  let plData;
  if (period === 'monthly') {
    plData = {
      revenue: financialData.profitLoss.revenue,
      expenses: financialData.profitLoss.expenses,
      grossProfit: financialData.profitLoss.grossProfit,
      netProfit: financialData.profitLoss.netProfit,
      profitMargin: financialData.profitLoss.profitMargin,
      ebitda: financialData.profitLoss.ebitda
    };
  } else if (period === 'quarterly') {
    plData = financialData.profitLoss.quarterly;
  }
  
  res.json({ success: true, data: plData });
});

app.post('/api/financial/profit-loss/generate', (req, res) => {
  const { startDate, endDate } = req.body;
  
  const plStatement = {
    period: `${startDate} to ${endDate}`,
    revenue: {
      memberships: financialData.revenue.sources.memberships.amount,
      training: financialData.revenue.sources.personalTraining.amount,
      products: financialData.revenue.sources.products.amount,
      total: financialData.profitLoss.revenue
    },
    expenses: {
      salaries: financialData.expenses.categories.staffSalaries.amount,
      rent: financialData.expenses.categories.rentUtilities.amount,
      equipment: financialData.expenses.categories.equipment.amount,
      marketing: financialData.expenses.categories.marketing.amount,
      total: financialData.profitLoss.expenses
    },
    profit: {
      gross: financialData.profitLoss.grossProfit,
      net: financialData.profitLoss.netProfit,
      margin: financialData.profitLoss.profitMargin
    },
    generatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: plStatement,
    message: 'P&L statement generated successfully'
  });
});

// Payment Status Endpoints
app.get('/api/financial/payments', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: {
        totalMembers: financialData.payments.totalMembers,
        paidMembers: financialData.payments.paidMembers,
        overdueMembers: financialData.payments.overdueMembers,
        outstandingAmount: financialData.payments.outstandingAmount,
        collectionRate: financialData.payments.collectionRate
      },
      payments: financialData.payments.memberPayments
    }
  });
});

app.get('/api/financial/payments/overdue', (req, res) => {
  const overduePayments = financialData.payments.memberPayments.filter(payment => 
    payment.status === 'overdue'
  );
  
  res.json({ success: true, data: overduePayments });
});

app.post('/api/financial/payments/reminder', (req, res) => {
  const { memberIds } = req.body;
  
  // Simulate sending payment reminders
  const remindersSent = memberIds.map(id => ({
    memberId: id,
    sentAt: new Date().toISOString(),
    method: 'email_sms'
  }));
  
  res.json({
    success: true,
    data: remindersSent,
    message: `Payment reminders sent to ${memberIds.length} members`
  });
});

app.put('/api/financial/payments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, paymentDate, amount } = req.body;
  
  const paymentIndex = financialData.payments.memberPayments.findIndex(p => p.id === parseInt(id));
  if (paymentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }
  
  financialData.payments.memberPayments[paymentIndex].status = status;
  if (paymentDate) financialData.payments.memberPayments[paymentIndex].paymentDate = paymentDate;
  
  res.json({
    success: true,
    data: financialData.payments.memberPayments[paymentIndex],
    message: 'Payment status updated successfully'
  });
});

// UAE VAT Reporting Endpoints
app.get('/api/financial/vat', (req, res) => {
  res.json({
    success: true,
    data: financialData.vat,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/financial/vat/return', (req, res) => {
  const { quarter, year } = req.body;
  
  const vatReturn = {
    quarter,
    year,
    vatRate: financialData.vat.rate,
    outputVat: {
      totalSales: Object.values(financialData.vat.outputVat).reduce((sum, item) => sum + item.amount, 0),
      totalVat: Object.values(financialData.vat.outputVat).reduce((sum, item) => sum + item.vat, 0)
    },
    inputVat: {
      totalPurchases: Object.values(financialData.vat.inputVat).reduce((sum, item) => sum + item.amount, 0),
      totalVat: Object.values(financialData.vat.inputVat).reduce((sum, item) => sum + item.vat, 0)
    },
    netVatDue: financialData.vat.netDue,
    filingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    generatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: vatReturn,
    message: 'VAT return generated successfully'
  });
});

app.get('/api/financial/vat/compliance', (req, res) => {
  const compliance = {
    registrationNumber: 'TRN-100123456789012',
    registrationDate: '2023-01-01',
    filingFrequency: 'Quarterly',
    nextFilingDate: '2025-01-31',
    complianceStatus: 'Compliant',
    lastFilingDate: '2024-10-31',
    penaltiesOutstanding: 0,
    vatThreshold: 375000,
    currentAnnualTurnover: financialData.revenue.yearly
  };
  
  res.json({ success: true, data: compliance });
});

// Budget Forecasting Endpoints
app.get('/api/financial/budget', (req, res) => {
  res.json({
    success: true,
    data: financialData.budget,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/financial/budget/forecast', (req, res) => {
  const { year, growthRate, assumptions } = req.body;
  
  const forecast = {
    year,
    growthRate,
    assumptions,
    quarterly: financialData.budget.quarterly,
    annual: {
      revenue: financialData.budget.annualTarget,
      expenses: financialData.budget.annualTarget * 0.65,
      profit: financialData.budget.annualTarget * 0.35,
      profitMargin: 35
    },
    scenarios: {
      conservative: {
        revenue: financialData.budget.annualTarget * 0.9,
        growth: growthRate - 5
      },
      optimistic: {
        revenue: financialData.budget.annualTarget * 1.15,
        growth: growthRate + 8
      }
    },
    generatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: forecast,
    message: 'Budget forecast generated successfully'
  });
});

app.put('/api/financial/budget/update', (req, res) => {
  const { quarter, revenue, expenses, notes } = req.body;
  
  const quarterIndex = financialData.budget.quarterly.findIndex(q => q.quarter === quarter);
  if (quarterIndex !== -1) {
    financialData.budget.quarterly[quarterIndex].revenue = revenue;
    financialData.budget.quarterly[quarterIndex].expenses = expenses;
    financialData.budget.quarterly[quarterIndex].profit = revenue - expenses;
    financialData.budget.quarterly[quarterIndex].notes = notes;
  }
  
  res.json({
    success: true,
    message: 'Budget updated successfully',
    data: financialData.budget.quarterly[quarterIndex]
  });
});

// Financial Analytics & Reports
app.get('/api/financial/analytics', (req, res) => {
  const analytics = {
    kpis: {
      revenueGrowth: financialData.revenue.growth,
      profitMargin: financialData.profitLoss.profitMargin,
      collectionRate: financialData.payments.collectionRate,
      expenseRatio: (financialData.expenses.monthly / financialData.revenue.monthly * 100).toFixed(1)
    },
    trends: {
      revenue: financialData.revenue.monthlyTrend.slice(-6),
      membershipGrowth: [5.2, 6.1, 7.3, 8.2, 9.1, 10.5],
      averageRevenuePerMember: Math.round(financialData.revenue.monthly / financialData.payments.totalMembers)
    },
    benchmarks: {
      industryProfitMargin: 25,
      industryGrowthRate: 12,
      industryCollectionRate: 88
    },
    alerts: [
      { type: 'warning', message: 'Rent expenses 4.3% over budget', severity: 'medium' },
      { type: 'success', message: 'Revenue target exceeded by 2.1%', severity: 'low' },
      { type: 'info', message: '78 overdue payments require attention', severity: 'high' }
    ]
  };
  
  res.json({ success: true, data: analytics });
});

app.post('/api/financial/reports/export', (req, res) => {
  const { reportType, format, dateRange } = req.body;
  
  const exportData = {
    reportType,
    format,
    dateRange,
    filename: `${reportType}_${dateRange.start}_${dateRange.end}.${format}`,
    downloadUrl: `/downloads/${reportType}_${Date.now()}.${format}`,
    generatedAt: new Date().toISOString(),
    fileSize: '2.4 MB',
    records: 1250
  };
  
  res.json({
    success: true,
    data: exportData,
    message: 'Report exported successfully'
  });
});

// Financial Dashboard Summary
app.get('/api/financial/dashboard', (req, res) => {
  const dashboard = {
    summary: {
      monthlyRevenue: financialData.revenue.monthly,
      monthlyExpenses: financialData.expenses.monthly,
      netProfit: financialData.profitLoss.netProfit,
      profitMargin: financialData.profitLoss.profitMargin,
      outstandingPayments: financialData.payments.outstandingAmount,
      vatDue: financialData.vat.netDue
    },
    charts: {
      revenueVsExpenses: {
        revenue: financialData.revenue.monthlyTrend.slice(-6),
        expenses: [120000, 125000, 130000, 135000, 140000, 145000]
      },
      revenueBreakdown: financialData.revenue.sources,
      quarterlyProfit: Object.values(financialData.profitLoss.quarterly).map(q => q.profit)
    },
    recentTransactions: [
      { date: '2024-12-20', type: 'Revenue', description: 'Membership renewals', amount: 15600 },
      { date: '2024-12-19', type: 'Expense', description: 'Equipment maintenance', amount: -2400 },
      { date: '2024-12-18', type: 'Revenue', description: 'Personal training sessions', amount: 3200 }
    ]
  };
  
  res.json({ success: true, data: dashboard });
});

// PDF Export Endpoint
app.post('/api/financial/export/pdf', async (req, res) => {
  try {
    const pdfGenerator = new FinancialPDFGenerator();
    const result = await pdfGenerator.generateAllReports();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF reports',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`💰 Financial Reports API running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/financial/revenue - Revenue tracking`);
  console.log(`   GET  /api/financial/expenses - Expense management`);
  console.log(`   GET  /api/financial/profit-loss - P&L statements`);
  console.log(`   GET  /api/financial/payments - Payment status`);
  console.log(`   GET  /api/financial/vat - UAE VAT reporting`);
  console.log(`   GET  /api/financial/budget - Budget forecasting`);
  console.log(`   GET  /api/financial/analytics - Financial analytics`);
  console.log(`   GET  /api/financial/dashboard - Dashboard summary`);
});

module.exports = app;