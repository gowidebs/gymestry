const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { httpMethod, body, pathParameters } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (pathParameters?.action === 'products') return await getProducts();
        if (pathParameters?.action === 'orders') return await getUserOrders(pathParameters.userId);
        if (pathParameters?.action === 'cart') return await getCart(pathParameters.userId);
        return await getProduct(pathParameters.productId);
      case 'POST':
        const { action } = JSON.parse(body);
        if (action === 'add_to_cart') return await addToCart(JSON.parse(body));
        if (action === 'checkout') return await checkout(JSON.parse(body));
        return await createOrder(JSON.parse(body));
      case 'PUT':
        return await updateCartItem(pathParameters.cartItemId, JSON.parse(body));
      case 'DELETE':
        return await removeFromCart(pathParameters.cartItemId);
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function getProducts() {
  const result = await dynamodb.scan({
    TableName: 'gogym-store-products',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'active' }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}

async function getProduct(productId) {
  const result = await dynamodb.get({
    TableName: 'gogym-store-products',
    Key: { productId }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  };
}

async function addToCart(cartData) {
  const { userId, productId, quantity, selectedOptions } = cartData;
  const cartItemId = `cart_${Date.now()}`;
  
  // Get product details
  const product = await dynamodb.get({
    TableName: 'gogym-store-products',
    Key: { productId }
  }).promise();
  
  if (!product.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Product not found' }) };
  }
  
  // Check stock
  if (product.Item.stock < quantity) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Insufficient stock' }) };
  }
  
  // Add to cart
  await dynamodb.put({
    TableName: 'gogym-shopping-cart',
    Item: {
      cartItemId,
      userId,
      productId,
      productName: product.Item.name,
      price: product.Item.price,
      quantity,
      selectedOptions,
      addedAt: new Date().toISOString()
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      cartItemId,
      message: 'Item added to cart'
    })
  };
}

async function getCart(userId) {
  const result = await dynamodb.query({
    TableName: 'gogym-shopping-cart',
    IndexName: 'UserCartIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  }).promise();
  
  // Calculate total
  const total = result.Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: result.Items,
      total,
      itemCount: result.Items.length
    })
  };
}

async function updateCartItem(cartItemId, updateData) {
  const { quantity } = updateData;
  
  await dynamodb.update({
    TableName: 'gogym-shopping-cart',
    Key: { cartItemId },
    UpdateExpression: 'SET quantity = :quantity, updatedAt = :time',
    ExpressionAttributeValues: {
      ':quantity': quantity,
      ':time': new Date().toISOString()
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Cart updated'
    })
  };
}

async function removeFromCart(cartItemId) {
  await dynamodb.delete({
    TableName: 'gogym-shopping-cart',
    Key: { cartItemId }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Item removed from cart'
    })
  };
}

async function checkout(checkoutData) {
  const { userId, paymentMethod, deliveryAddress, loyaltyPointsUsed } = checkoutData;
  const orderId = `order_${Date.now()}`;
  
  // Get cart items
  const cart = await dynamodb.query({
    TableName: 'gogym-shopping-cart',
    IndexName: 'UserCartIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  }).promise();
  
  if (cart.Items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) };
  }
  
  // Calculate totals
  const subtotal = cart.Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const loyaltyDiscount = loyaltyPointsUsed * 0.01; // 1 point = $0.01
  const total = subtotal - loyaltyDiscount;
  
  // Create order
  await dynamodb.put({
    TableName: 'gogym-store-orders',
    Item: {
      orderId,
      userId,
      items: cart.Items,
      subtotal,
      loyaltyDiscount,
      total,
      paymentMethod,
      deliveryAddress,
      status: 'pending',
      orderDate: new Date().toISOString()
    }
  }).promise();
  
  // Clear cart
  for (const item of cart.Items) {
    await dynamodb.delete({
      TableName: 'gogym-shopping-cart',
      Key: { cartItemId: item.cartItemId }
    }).promise();
  }
  
  // Update product stock
  for (const item of cart.Items) {
    await dynamodb.update({
      TableName: 'gogym-store-products',
      Key: { productId: item.productId },
      UpdateExpression: 'SET stock = stock - :quantity',
      ExpressionAttributeValues: { ':quantity': item.quantity }
    }).promise();
  }
  
  // Award loyalty points (1 point per $1 spent)
  await dynamodb.update({
    TableName: 'gogym-users',
    Key: { userId },
    UpdateExpression: 'SET loyaltyPoints = loyaltyPoints + :points',
    ExpressionAttributeValues: { ':points': Math.floor(total) }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      orderId,
      total,
      message: 'Order placed successfully'
    })
  };
}

async function getUserOrders(userId) {
  const result = await dynamodb.query({
    TableName: 'gogym-store-orders',
    IndexName: 'UserOrdersIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ScanIndexForward: false
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  };
}