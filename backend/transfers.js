const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TRANSFERS_TABLE = 'gogym-transfers';
const MEMBERSHIPS_TABLE = 'gogym-memberships';
const TRANSFER_FEE = 150; // AED

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        return await getTransfers();
      case 'POST':
        return await requestTransfer(JSON.parse(body));
      case 'PUT':
        return await approveTransfer(pathParameters.id, JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function requestTransfer(transferData) {
  const { fromUserId, toUserId, toUserDetails, paymentMethod } = transferData;
  
  // Validate source membership
  const fromMembership = await dynamodb.get({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId: fromUserId }
  }).promise();
  
  if (!fromMembership.Item || fromMembership.Item.status !== 'active') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid source membership' })
    };
  }
  
  const transfer = {
    id: uuidv4(),
    fromUserId,
    toUserId: toUserId || null,
    toUserDetails,
    fee: TRANSFER_FEE,
    feePaid: false,
    status: 'pending_payment',
    paymentMethod,
    requestedAt: new Date().toISOString(),
    approvedBy: null
  };
  
  await dynamodb.put({
    TableName: TRANSFERS_TABLE,
    Item: transfer
  }).promise();
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      transfer,
      paymentRequired: TRANSFER_FEE,
      currency: 'AED'
    })
  };
}

async function approveTransfer(transferId, approvalData) {
  const { approvedBy, feePaid } = approvalData;
  
  if (!feePaid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Transfer fee must be paid first' })
    };
  }
  
  // Get transfer details
  const transfer = await dynamodb.get({
    TableName: TRANSFERS_TABLE,
    Key: { id: transferId }
  }).promise();
  
  if (!transfer.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Transfer not found' })
    };
  }
  
  const transferData = transfer.Item;
  
  // Create new membership for recipient
  if (!transferData.toUserId) {
    // Create new user account
    const newUser = {
      id: uuidv4(),
      ...transferData.toUserDetails,
      role: 'member',
      createdAt: new Date().toISOString()
    };
    
    await dynamodb.put({
      TableName: 'gogym-users',
      Item: newUser
    }).promise();
    
    transferData.toUserId = newUser.id;
  }
  
  // Get source membership
  const sourceMembership = await dynamodb.get({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId: transferData.fromUserId }
  }).promise();
  
  // Transfer membership
  const newMembership = {
    ...sourceMembership.Item,
    userId: transferData.toUserId,
    transferredFrom: transferData.fromUserId,
    transferredAt: new Date().toISOString()
  };
  
  // Update source membership to transferred
  await dynamodb.update({
    TableName: MEMBERSHIPS_TABLE,
    Key: { userId: transferData.fromUserId },
    UpdateExpression: 'SET #status = :status, transferredTo = :toUser, transferredAt = :date',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'transferred',
      ':toUser': transferData.toUserId,
      ':date': new Date().toISOString()
    }
  }).promise();
  
  // Create new membership
  await dynamodb.put({
    TableName: MEMBERSHIPS_TABLE,
    Item: newMembership
  }).promise();
  
  // Update transfer status
  await dynamodb.update({
    TableName: TRANSFERS_TABLE,
    Key: { id: transferId },
    UpdateExpression: 'SET #status = :status, approvedBy = :approver, approvedAt = :date, feePaid = :paid',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'completed',
      ':approver': approvedBy,
      ':date': new Date().toISOString(),
      ':paid': true
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Transfer completed successfully',
      newMembershipId: newMembership.userId
    })
  };
}

async function getTransfers() {
  const result = await dynamodb.scan({ TableName: TRANSFERS_TABLE }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}