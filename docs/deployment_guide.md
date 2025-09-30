# GoGym Deployment Guide

## Prerequisites
- AWS CLI configured
- Node.js 18+
- Flutter SDK
- Firebase project setup

## Backend Deployment

### 1. Deploy Infrastructure
```bash
cd infrastructure
aws cloudformation deploy \
  --template-file cloudformation.yaml \
  --stack-name gogym-infrastructure \
  --capabilities CAPABILITY_IAM
```

### 2. Deploy Lambda Functions
```bash
cd backend
npm install
npm install -g serverless
serverless deploy
```

### 3. Seed Database (Optional)
```bash
# Run seed script to populate sample data
node scripts/seed-data.js
```

## Frontend Deployment

### 1. Configure Firebase
```bash
cd frontend
flutter pub get
# Add google-services.json to android/app/
# Add GoogleService-Info.plist to ios/Runner/
```

### 2. Build and Deploy
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release
```

## Environment Configuration

### Backend Environment Variables
```
DYNAMODB_TABLE_PREFIX=GoGym
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=<from-cloudformation-output>
```

### Frontend Configuration
```dart
// lib/config/app_config.dart
class AppConfig {
  static const String apiBaseUrl = 'https://api.gogym.com/v1';
  static const String cognitoUserPoolId = '<user-pool-id>';
  static const String cognitoClientId = '<client-id>';
}
```

## Cost Optimization
- Use DynamoDB on-demand billing
- Enable Lambda provisioned concurrency only for high-traffic functions
- Use S3 Intelligent Tiering for images
- Enable CloudFront caching

## Monitoring
- CloudWatch for Lambda metrics
- X-Ray for distributed tracing
- Firebase Analytics for mobile app metrics

## Security Checklist
- [ ] Enable WAF on API Gateway
- [ ] Configure CORS properly
- [ ] Use least privilege IAM roles
- [ ] Enable encryption at rest for DynamoDB
- [ ] Configure S3 bucket policies