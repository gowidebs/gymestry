const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PAYMENTS_TABLE = 'gogym-payments';

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        return await processPayment(JSON.parse(body));
      case 'GET':
        return await getPayments();
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function processPayment(paymentData) {
  const { userId, amount, method, description, vatIncluded = false } = paymentData;
  
  let finalAmount = amount;
  let vatAmount = 0;
  
  // Calculate VAT if applicable (5% in UAE)
  if (vatIncluded) {
    vatAmount = Math.round(amount * 0.05 * 100) / 100;
    finalAmount = amount + vatAmount;
  }
  
  const payment = {
    id: uuidv4(),
    userId,
    amount: finalAmount,
    baseAmount: amount,
    vatAmount,
    currency: 'AED',
    method,
    description,
    status: 'pending',
    createdAt: new Date().toISOString(),
    invoiceId: generateInvoiceId()
  };
  
  // Process based on payment method
  switch (method) {
    case 'cash':
      payment.status = 'completed';
      payment.completedAt = new Date().toISOString();
      break;
    case 'card':
      payment.status = 'completed';
      payment.completedAt = new Date().toISOString();
      payment.cardLast4 = paymentData.cardLast4;
      break;
    case 'stripe':
      const stripeResult = await processStripePayment(payment, paymentData.stripeToken);
      payment.status = stripeResult.success ? 'completed' : 'failed';
      payment.stripePaymentId = stripeResult.paymentId;
      payment.completedAt = stripeResult.success ? new Date().toISOString() : null;
      break;
    case 'paytabs':
      const paytabsResult = await processPayTabsPayment(payment, paymentData.paytabsData);
      payment.status = paytabsResult.success ? 'completed' : 'failed';
      payment.paytabsTransactionId = paytabsResult.transactionId;
      payment.completedAt = paytabsResult.success ? new Date().toISOString() : null;
      break;
    default:
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid payment method' })
      };
  }
  
  await dynamodb.put({
    TableName: PAYMENTS_TABLE,
    Item: payment
  }).promise();
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      payment,
      invoice: generateInvoice(payment)
    })
  };
}

async function processStripePayment(payment, stripeToken) {
  // Simulate Stripe UAE payment processing
  try {
    // In real implementation, use Stripe SDK
    const success = Math.random() > 0.1; // 90% success rate
    return {
      success,
      paymentId: success ? `pi_${uuidv4().substring(0, 24)}` : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function processPayTabsPayment(payment, paytabsData) {
  // Simulate PayTabs payment processing
  try {
    const success = Math.random() > 0.1; // 90% success rate
    return {
      success,
      transactionId: success ? `pt_${uuidv4().substring(0, 20)}` : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateInvoiceId() {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `INV${year}${month}${random}`;
}

function generateInvoice(payment) {
  return {
    invoiceId: payment.invoiceId,
    date: payment.createdAt,
    amount: payment.amount,
    baseAmount: payment.baseAmount,
    vatAmount: payment.vatAmount,
    currency: payment.currency,
    method: payment.method,
    description: payment.description,
    status: payment.status,
    companyDetails: {
      name: 'GoGym UAE',
      address: 'Dubai, UAE',
      trn: 'TRN123456789012345' // UAE Tax Registration Number
    }
  };
}

async function getPayments() {
  const result = await dynamodb.scan({ TableName: PAYMENTS_TABLE }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}