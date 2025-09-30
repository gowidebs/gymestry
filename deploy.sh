#!/bin/bash

echo "🚀 Deploying GoGym to AWS..."

# Step 1: Deploy Infrastructure
echo "📦 Deploying infrastructure..."
cd infrastructure
aws cloudformation deploy \
  --template-file cloudformation.yaml \
  --stack-name gogym-infrastructure \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

if [ $? -ne 0 ]; then
    echo "❌ Infrastructure deployment failed"
    exit 1
fi

# Step 2: Deploy Lambda Functions
echo "⚡ Deploying Lambda functions..."
cd ../backend
npm install
serverless deploy --region us-east-1

if [ $? -ne 0 ]; then
    echo "❌ Lambda deployment failed"
    exit 1
fi

# Step 3: Seed Database
echo "🌱 Seeding database..."
node seed-data.js

# Step 4: Get API Gateway URL
echo "🔗 Getting API Gateway URL..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name gogym-infrastructure \
  --query 'Stacks[0].Outputs[?OutputKey==`APIGatewayURL`].OutputValue' \
  --output text \
  --region us-east-1)

echo "✅ Deployment complete!"
echo "📱 API Gateway URL: $API_URL"
echo "🔧 Update your Flutter app with this URL in lib/services/api_service.dart"

# Step 5: Update Flutter API URL
cd ../frontend
sed -i.bak "s|http://localhost:3000|$API_URL|g" lib/services/api_service.dart
echo "📱 Flutter API URL updated automatically"

echo "🎉 GoGym deployed successfully to AWS!"