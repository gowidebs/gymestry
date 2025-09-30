const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body, pathParameters } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (pathParameters?.action === 'trainers') return await getTrainers();
        if (pathParameters?.action === 'sessions') return await getUserSessions(pathParameters.userId);
        return await getTrainerAvailability(pathParameters.trainerId);
      case 'POST':
        return await bookPTSession(JSON.parse(body));
      case 'PUT':
        return await updateSession(pathParameters.sessionId, JSON.parse(body));
      case 'DELETE':
        return await cancelSession(pathParameters.sessionId);
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getTrainers() {
  const result = await dynamodb.scan({
    TableName: 'gogym-trainers',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'active' }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}

async function getTrainerAvailability(trainerId) {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const result = await dynamodb.query({
    TableName: 'gogym-trainer-availability',
    KeyConditionExpression: 'trainerId = :trainerId',
    FilterExpression: '#date BETWEEN :today AND :nextMonth',
    ExpressionAttributeNames: { '#date': 'date' },
    ExpressionAttributeValues: {
      ':trainerId': trainerId,
      ':today': today,
      ':nextMonth': nextMonth
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}

async function bookPTSession(sessionData) {
  const { userId, trainerId, date, time, duration, sessionType, notes } = sessionData;
  const sessionId = `pt_${Date.now()}`;
  
  // Check trainer availability
  const availability = await dynamodb.get({
    TableName: 'gogym-trainer-availability',
    Key: { trainerId, date, time }
  }).promise();
  
  if (!availability.Item || !availability.Item.available) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Trainer not available at this time' }) };
  }
  
  // Get trainer rates
  const trainer = await dynamodb.get({
    TableName: 'gogym-trainers',
    Key: { trainerId }
  }).promise();
  
  const sessionCost = trainer.Item.rates[sessionType] * (duration / 60);
  
  // Create PT session
  await dynamodb.put({
    TableName: 'gogym-pt-sessions',
    Item: {
      sessionId,
      userId,
      trainerId,
      date,
      time,
      duration,
      sessionType,
      notes,
      cost: sessionCost,
      status: 'scheduled',
      bookedAt: new Date().toISOString(),
      paymentStatus: 'pending'
    }
  }).promise();
  
  // Mark trainer as unavailable
  await dynamodb.update({
    TableName: 'gogym-trainer-availability',
    Key: { trainerId, date, time },
    UpdateExpression: 'SET available = :false, sessionId = :sessionId',
    ExpressionAttributeValues: {
      ':false': false,
      ':sessionId': sessionId
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      sessionId,
      cost: sessionCost,
      message: 'PT session booked successfully'
    })
  };
}

async function getUserSessions(userId) {
  const result = await dynamodb.query({
    TableName: 'gogym-pt-sessions',
    IndexName: 'UserSessionsIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ScanIndexForward: false
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}

async function updateSession(sessionId, updateData) {
  const { notes, status, trainerNotes } = updateData;
  
  await dynamodb.update({
    TableName: 'gogym-pt-sessions',
    Key: { sessionId },
    UpdateExpression: 'SET notes = :notes, #status = :status, trainerNotes = :trainerNotes, updatedAt = :time',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':notes': notes,
      ':status': status,
      ':trainerNotes': trainerNotes,
      ':time': new Date().toISOString()
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Session updated successfully'
    })
  };
}

async function cancelSession(sessionId) {
  // Get session details
  const session = await dynamodb.get({
    TableName: 'gogym-pt-sessions',
    Key: { sessionId }
  }).promise();
  
  if (!session.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Session not found' }) };
  }
  
  // Update session status
  await dynamodb.update({
    TableName: 'gogym-pt-sessions',
    Key: { sessionId },
    UpdateExpression: 'SET #status = :status, cancelledAt = :time',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'cancelled',
      ':time': new Date().toISOString()
    }
  }).promise();
  
  // Free up trainer availability
  await dynamodb.update({
    TableName: 'gogym-trainer-availability',
    Key: { 
      trainerId: session.Item.trainerId, 
      date: session.Item.date, 
      time: session.Item.time 
    },
    UpdateExpression: 'SET available = :true REMOVE sessionId',
    ExpressionAttributeValues: { ':true': true }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Session cancelled successfully'
    })
  };
}