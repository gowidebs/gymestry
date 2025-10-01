const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3015;

app.use(cors());
app.use(express.json());

// Mock data
let transactions = [
    { id: 1, memberId: 'M001', type: 'membership_renewal', amount: 300, status: 'completed', date: '2024-01-15T10:30:00Z', method: 'card' },
    { id: 2, memberId: 'M002', type: 'personal_training', amount: 150, status: 'pending', date: '2024-01-15T14:20:00Z', method: 'cash' }
];

let members = [
    { id: 'M001', name: 'Ahmed Al-Rashid', membership: 'Premium', balance: 0, nextDue: '2024-02-15' },
    { id: 'M002', name: 'Fatima Hassan', membership: 'Standard', balance: -150, nextDue: '2024-01-20' }
];

let products = [
    { id: 'P001', name: 'Protein Powder', price: 120, stock: 25 },
    { id: 'P002', name: 'Pre-Workout', price: 80, stock: 15 },
    { id: 'P003', name: 'Gym Towel', price: 25, stock: 50 }
];

let paymentPlans = [
    { id: 1, memberId: 'M003', totalAmount: 1200, paidAmount: 400, installments: 4, nextDue: '2024-02-01' }
];

// Process membership renewal
app.post('/api/payments/membership-renewal', (req, res) => {
    const { memberId, planType, amount, paymentMethod } = req.body;
    
    const member = members.find(m => m.id === memberId);
    if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
    }
    
    const transaction = {
        id: transactions.length + 1,
        memberId,
        type: 'membership_renewal',
        amount,
        status: 'completed',
        date: new Date().toISOString(),
        method: paymentMethod,
        details: { planType, previousDue: member.nextDue }
    };
    
    transactions.push(transaction);
    
    // Update member
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    member.nextDue = nextMonth.toISOString().split('T')[0];
    member.balance = 0;
    
    res.json({ success: true, transaction, member });
});

// Process personal training payment
app.post('/api/payments/personal-training', (req, res) => {
    const { memberId, trainerId, sessions, amount, paymentMethod } = req.body;
    
    const transaction = {
        id: transactions.length + 1,
        memberId,
        type: 'personal_training',
        amount,
        status: 'completed',
        date: new Date().toISOString(),
        method: paymentMethod,
        details: { trainerId, sessions }
    };
    
    transactions.push(transaction);
    
    res.json({ success: true, transaction });
});

// Process product sale
app.post('/api/payments/product-sale', (req, res) => {
    const { memberId, items, totalAmount, paymentMethod } = req.body;
    
    // Check stock
    for (let item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${product?.name || 'product'}` });
        }
    }
    
    const transaction = {
        id: transactions.length + 1,
        memberId,
        type: 'product_sale',
        amount: totalAmount,
        status: 'completed',
        date: new Date().toISOString(),
        method: paymentMethod,
        details: { items }
    };
    
    transactions.push(transaction);
    
    // Update stock
    items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        product.stock -= item.quantity;
    });
    
    res.json({ success: true, transaction });
});

// Process refund
app.post('/api/payments/refund', (req, res) => {
    const { originalTransactionId, refundAmount, reason } = req.body;
    
    const originalTransaction = transactions.find(t => t.id === originalTransactionId);
    if (!originalTransaction) {
        return res.status(404).json({ success: false, message: 'Original transaction not found' });
    }
    
    const refundTransaction = {
        id: transactions.length + 1,
        memberId: originalTransaction.memberId,
        type: 'refund',
        amount: -refundAmount,
        status: 'completed',
        date: new Date().toISOString(),
        method: originalTransaction.method,
        details: { originalTransactionId, reason }
    };
    
    transactions.push(refundTransaction);
    
    res.json({ success: true, refund: refundTransaction });
});

// Create payment plan
app.post('/api/payments/payment-plan', (req, res) => {
    const { memberId, totalAmount, installments, firstPayment } = req.body;
    
    const paymentPlan = {
        id: paymentPlans.length + 1,
        memberId,
        totalAmount,
        paidAmount: firstPayment,
        installments,
        remainingAmount: totalAmount - firstPayment,
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
    };
    
    paymentPlans.push(paymentPlan);
    
    // Create initial payment transaction
    const transaction = {
        id: transactions.length + 1,
        memberId,
        type: 'payment_plan_installment',
        amount: firstPayment,
        status: 'completed',
        date: new Date().toISOString(),
        method: 'card',
        details: { paymentPlanId: paymentPlan.id, installmentNumber: 1 }
    };
    
    transactions.push(transaction);
    
    res.json({ success: true, paymentPlan, transaction });
});

// Process payment plan installment
app.post('/api/payments/installment/:planId', (req, res) => {
    const planId = parseInt(req.params.planId);
    const { amount, paymentMethod } = req.body;
    
    const plan = paymentPlans.find(p => p.id === planId);
    if (!plan) {
        return res.status(404).json({ success: false, message: 'Payment plan not found' });
    }
    
    plan.paidAmount += amount;
    plan.remainingAmount -= amount;
    
    if (plan.remainingAmount <= 0) {
        plan.status = 'completed';
    } else {
        const nextMonth = new Date(plan.nextDue);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        plan.nextDue = nextMonth.toISOString().split('T')[0];
    }
    
    const transaction = {
        id: transactions.length + 1,
        memberId: plan.memberId,
        type: 'payment_plan_installment',
        amount,
        status: 'completed',
        date: new Date().toISOString(),
        method: paymentMethod,
        details: { paymentPlanId: planId }
    };
    
    transactions.push(transaction);
    
    res.json({ success: true, transaction, paymentPlan: plan });
});

// Get member transactions
app.get('/api/payments/member/:memberId', (req, res) => {
    const memberId = req.params.memberId;
    const memberTransactions = transactions.filter(t => t.memberId === memberId);
    res.json(memberTransactions);
});

// Get all transactions
app.get('/api/payments/transactions', (req, res) => {
    res.json(transactions);
});

// Get products
app.get('/api/payments/products', (req, res) => {
    res.json(products);
});

// Get payment plans
app.get('/api/payments/payment-plans', (req, res) => {
    res.json(paymentPlans);
});

// Get members for payment
app.get('/api/payments/members', (req, res) => {
    res.json(members);
});

app.listen(PORT, () => {
    console.log(`Payment Processing API running on port ${PORT}`);
});