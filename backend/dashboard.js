const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, queryStringParameters } = event;
  
  try {
    if (httpMethod === 'GET') {
      const type = queryStringParameters?.type || 'overview';
      return await getDashboardData(type);
    }
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getDashboardData(type) {
  switch (type) {
    case 'sales':
      return await getSalesData();
    case 'pt':
      return await getPTData();
    case 'revenue':
      return await getRevenueData();
    case 'contracts':
      return await getContractsData();
    default:
      return await getOverviewData();
  }
}

async function getSalesData() {
  const leads = await dynamodb.scan({ TableName: 'gogym-leads' }).promise();
  const bookings = await dynamodb.scan({ TableName: 'gogym-bookings' }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      totalLeads: leads.Items.length,
      hotLeads: leads.Items.filter(l => l.status === 'Hot').length,
      appointments: bookings.Items.length,
      conversionRate: ((bookings.Items.length / leads.Items.length) * 100).toFixed(2)
    })
  };
}

async function getPTData() {
  const sessions = await dynamodb.scan({ TableName: 'gogym-bookings' }).promise();
  const ptSessions = sessions.Items.filter(s => s.type === 'personal_training');
  
  const trainerStats = ptSessions.reduce((acc, session) => {
    acc[session.trainerId] = (acc[session.trainerId] || 0) + 1;
    return acc;
  }, {});
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      totalPTSessions: ptSessions.length,
      trainerBreakdown: trainerStats
    })
  };
}

async function getRevenueData() {
  const bookings = await dynamodb.scan({ TableName: 'gogym-bookings' }).promise();
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().substring(0, 7);
  
  const dailyRevenue = bookings.Items
    .filter(b => b.date?.startsWith(today))
    .reduce((sum, b) => sum + (b.amount || 0), 0);
    
  const monthlyRevenue = bookings.Items
    .filter(b => b.date?.startsWith(thisMonth))
    .reduce((sum, b) => sum + (b.amount || 0), 0);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      dailyRevenue,
      monthlyRevenue,
      totalRevenue: bookings.Items.reduce((sum, b) => sum + (b.amount || 0), 0)
    })
  };
}

async function getContractsData() {
  const users = await dynamodb.scan({ TableName: 'gogym-users' }).promise();
  const contracts = users.Items.filter(u => u.membershipType);
  
  const contractBreakdown = contracts.reduce((acc, user) => {
    const type = user.membershipType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      totalContracts: contracts.length,
      contractBreakdown
    })
  };
}

async function getOverviewData() {
  const [sales, pt, revenue, contracts] = await Promise.all([
    getSalesData(),
    getPTData(),
    getRevenueData(),
    getContractsData()
  ]);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      sales: JSON.parse(sales.body),
      pt: JSON.parse(pt.body),
      revenue: JSON.parse(revenue.body),
      contracts: JSON.parse(contracts.body)
    })
  };
}