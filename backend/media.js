const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const MEDIA_TABLE = 'gogym-media';
const BUCKET_NAME = process.env.MEDIA_BUCKET || 'gogym-media-bucket';

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        return await getMedia(pathParameters);
      case 'POST':
        return await uploadMedia(JSON.parse(body));
      case 'DELETE':
        return await deleteMedia(pathParameters.id);
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getMedia(pathParameters) {
  if (pathParameters?.id) {
    const result = await dynamodb.get({
      TableName: MEDIA_TABLE,
      Key: { id: pathParameters.id }
    }).promise();
    return { statusCode: 200, body: JSON.stringify(result.Item) };
  }
  
  const type = pathParameters?.type;
  let filterExpression = '';
  let expressionAttributeValues = {};
  
  if (type) {
    filterExpression = '#type = :type';
    expressionAttributeValues = { ':type': type };
  }
  
  const params = {
    TableName: MEDIA_TABLE,
    ...(filterExpression && {
      FilterExpression: filterExpression,
      ExpressionAttributeNames: { '#type': 'type' },
      ExpressionAttributeValues: expressionAttributeValues
    })
  };
  
  const result = await dynamodb.scan(params).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function uploadMedia(mediaData) {
  const media = {
    id: uuidv4(),
    ...mediaData,
    uploadedAt: new Date().toISOString(),
    url: `https://${BUCKET_NAME}.s3.amazonaws.com/${mediaData.key}`
  };
  
  await dynamodb.put({
    TableName: MEDIA_TABLE,
    Item: media
  }).promise();
  
  // Generate presigned URL for upload
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: mediaData.key,
    ContentType: mediaData.contentType,
    Expires: 3600
  });
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      media,
      uploadUrl
    })
  };
}

async function deleteMedia(id) {
  // Get media info first
  const result = await dynamodb.get({
    TableName: MEDIA_TABLE,
    Key: { id }
  }).promise();
  
  if (result.Item) {
    // Delete from S3
    const key = result.Item.key;
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key
    }).promise();
    
    // Delete from DynamoDB
    await dynamodb.delete({
      TableName: MEDIA_TABLE,
      Key: { id }
    }).promise();
  }
  
  return { statusCode: 200, body: JSON.stringify({ message: 'Media deleted' }) };
}