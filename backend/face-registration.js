const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body } = event;
  
  try {
    switch (httpMethod) {
      case 'POST':
        return await registerFace(JSON.parse(body));
      case 'DELETE':
        return await deleteFace(JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function registerFace(data) {
  const { userId, gymId, imageBase64 } = data;
  
  // Convert base64 to buffer
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  
  // Create face collection if not exists
  const collectionId = `gogym-faces-${gymId}`;
  await createCollectionIfNotExists(collectionId);
  
  // Index face in Rekognition
  const indexResult = await rekognition.indexFaces({
    CollectionId: collectionId,
    Image: { Bytes: imageBuffer },
    ExternalImageId: userId,
    MaxFaces: 1,
    QualityFilter: 'AUTO'
  }).promise();
  
  if (indexResult.FaceRecords.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No face detected' }) };
  }
  
  const faceId = indexResult.FaceRecords[0].Face.FaceId;
  
  // Store face mapping
  await dynamodb.put({
    TableName: 'gogym-face-mappings',
    Item: {
      userId,
      gymId,
      faceId,
      collectionId,
      registeredAt: new Date().toISOString()
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      faceId,
      message: 'Face registered successfully'
    })
  };
}

async function createCollectionIfNotExists(collectionId) {
  try {
    await rekognition.createCollection({ CollectionId: collectionId }).promise();
  } catch (error) {
    if (error.code !== 'ResourceAlreadyExistsException') {
      throw error;
    }
  }
}

async function deleteFace(data) {
  const { userId, gymId } = data;
  
  // Get face mapping
  const mapping = await dynamodb.get({
    TableName: 'gogym-face-mappings',
    Key: { userId, gymId }
  }).promise();
  
  if (!mapping.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Face not found' }) };
  }
  
  // Delete from Rekognition
  await rekognition.deleteFaces({
    CollectionId: mapping.Item.collectionId,
    FaceIds: [mapping.Item.faceId]
  }).promise();
  
  // Delete mapping
  await dynamodb.delete({
    TableName: 'gogym-face-mappings',
    Key: { userId, gymId }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Face deleted successfully' })
  };
}