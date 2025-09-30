#!/bin/bash

echo "🚀 Deploying GoGym to GoWideTest..."

# 1. Deploy Core Infrastructure
echo "📦 Deploying core infrastructure..."
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name gogym-core \
  --capabilities CAPABILITY_IAM

# 2. Deploy Complete GoGym Infrastructure  
echo "📦 Deploying GoGym infrastructure..."
aws cloudformation deploy \
  --template-file infrastructure/gogym-complete-infrastructure.yaml \
  --stack-name gogym-complete \
  --capabilities CAPABILITY_IAM

# 3. Deploy Gate Provider API
echo "📦 Deploying gate provider API..."
aws cloudformation deploy \
  --template-file infrastructure/gate-provider-api.yaml \
  --stack-name gogym-gate-api \
  --capabilities CAPABILITY_IAM

# 4. Deploy Web Hosting
echo "📦 Deploying web hosting..."
aws cloudformation deploy \
  --template-file infrastructure/s3-web-hosting.yaml \
  --stack-name gogym-web-hosting \
  --capabilities CAPABILITY_IAM

# 5. Deploy Backend Functions
echo "📦 Deploying backend functions..."
cd backend
npm install
serverless deploy --stage prod

# 6. Build and Deploy Web Portal
echo "📦 Building web portal..."
cd ../admin-panel
npm install
npm run build

# Get S3 bucket name and CloudFront URL
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name gogym-web-hosting \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name gogym-web-hosting \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
  --output text)

aws s3 sync dist/ s3://$BUCKET_NAME --delete

# 7. Build Flutter Web App
echo "📦 Building Flutter web app..."
cd ../frontend
flutter build web --release

# Upload Flutter web to S3
aws s3 sync build/web/ s3://$BUCKET_NAME/app --delete

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name gogym-web-hosting \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Web Portal: $CLOUDFRONT_URL"
echo "📱 Mobile App: $CLOUDFRONT_URL/app"

# 8. Setup Initial Data
echo "📊 Setting up initial data..."
aws lambda invoke \
  --function-name gogym-gym-config-setup \
  --payload '{}' \
  response.json

echo "🎉 GoGym is now live on GoWideTest!"
echo "🔒 All traffic is served over HTTPS via CloudFront"