const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body, pathParameters } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (pathParameters?.action === 'schedule') return await getClassSchedule();
        if (pathParameters?.action === 'bookings') return await getUserBookings(pathParameters.userId);
        return await getClasses();
      case 'POST':
        return await bookClass(JSON.parse(body));
      case 'DELETE':
        return await cancelBooking(pathParameters.bookingId);
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getClasses() {
  const result = await dynamodb.scan({
    TableName: 'gogym-classes'
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}

async function getClassSchedule() {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const result = await dynamodb.scan({
    TableName: 'gogym-class-schedule',
    FilterExpression: '#date BETWEEN :today AND :nextWeek',
    ExpressionAttributeNames: { '#date': 'date' },
    ExpressionAttributeValues: {
      ':today': today,
      ':nextWeek': nextWeek
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}

async function bookClass(bookingData) {
  const { userId, classId, scheduleId, paymentRequired } = bookingData;
  const bookingId = `booking_${Date.now()}`;
  
  // Check class capacity
  const classInfo = await dynamodb.get({
    TableName: 'gogym-class-schedule',
    Key: { scheduleId }
  }).promise();
  
  if (!classInfo.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Class not found' }) };
  }
  
  if (classInfo.Item.currentBookings >= classInfo.Item.maxCapacity) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Class is full' }) };
  }
  
  // Create booking
  await dynamodb.put({
    TableName: 'gogym-class-bookings',
    Item: {
      bookingId,
      userId,
      classId,
      scheduleId,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      paymentStatus: paymentRequired ? 'pending' : 'not_required'
    }
  }).promise();
  
  // Update class capacity
  await dynamodb.update({
    TableName: 'gogym-class-schedule',
    Key: { scheduleId },
    UpdateExpression: 'SET currentBookings = currentBookings + :inc',
    ExpressionAttributeValues: { ':inc': 1 }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      bookingId,
      message: 'Class booked successfully'
    })
  };
}

async function getUserBookings(userId) {
  const result = await dynamodb.query({
    TableName: 'gogym-class-bookings',
    IndexName: 'UserBookingsIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}

async function cancelBooking(bookingId) {
  // Get booking details
  const booking = await dynamodb.get({
    TableName: 'gogym-class-bookings',
    Key: { bookingId }
  }).promise();
  
  if (!booking.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Booking not found' }) };
  }
  
  // Update booking status
  await dynamodb.update({
    TableName: 'gogym-class-bookings',
    Key: { bookingId },
    UpdateExpression: 'SET #status = :status, cancelledAt = :time',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'cancelled',
      ':time': new Date().toISOString()
    }
  }).promise();
  
  // Update class capacity
  await dynamodb.update({
    TableName: 'gogym-class-schedule',
    Key: { scheduleId: booking.Item.scheduleId },
    UpdateExpression: 'SET currentBookings = currentBookings - :dec',
    ExpressionAttributeValues: { ':dec': 1 }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Booking cancelled successfully'
    })
  };
}