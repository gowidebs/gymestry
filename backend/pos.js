const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE = 'gogym-products';
const SALES_TABLE = 'gogym-sales';

exports.handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        return pathParameters?.type === 'products' ? await getProducts() : await getSales();
      case 'POST':
        return pathParameters?.type === 'products' ? await addProduct(JSON.parse(body)) : await processSale(JSON.parse(body));
      case 'PUT':
        return await updateProduct(pathParameters.id, JSON.parse(body));
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getProducts() {
  const result = await dynamodb.scan({ TableName: PRODUCTS_TABLE }).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function getSales() {
  const result = await dynamodb.scan({ TableName: SALES_TABLE }).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function addProduct(productData) {
  const product = {
    id: uuidv4(),
    ...productData,
    createdAt: new Date().toISOString()
  };
  
  await dynamodb.put({
    TableName: PRODUCTS_TABLE,
    Item: product
  }).promise();
  
  return { statusCode: 201, body: JSON.stringify(product) };
}

async function processSale(saleData) {
  const sale = {
    id: uuidv4(),
    ...saleData,
    timestamp: new Date().toISOString(),
    total: saleData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };
  
  await dynamodb.put({
    TableName: SALES_TABLE,
    Item: sale
  }).promise();
  
  // Update product inventory
  for (const item of saleData.items) {
    await dynamodb.update({
      TableName: PRODUCTS_TABLE,
      Key: { id: item.productId },
      UpdateExpression: 'SET inventory = inventory - :qty',
      ExpressionAttributeValues: { ':qty': item.quantity }
    }).promise();
  }
  
  return { statusCode: 201, body: JSON.stringify(sale) };
}

async function updateProduct(id, updates) {
  const updateExpression = 'SET ' + Object.keys(updates).map(key => `#${key} = :${key}`).join(', ');
  const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
    acc[`#${key}`] = key;
    return acc;
  }, {});
  const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => {
    acc[`:${key}`] = updates[key];
    return acc;
  }, {});
  
  await dynamodb.update({
    TableName: PRODUCTS_TABLE,
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }).promise();
  
  return { statusCode: 200, body: JSON.stringify({ message: 'Product updated' }) };
}