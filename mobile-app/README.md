# Gymestry UAE - Mobile Application

## 🏋️ Complete UAE Gym Management Solution

### Features Overview
- **Multi-Gate Access**: QR Code, Bluetooth, Facial Recognition
- **UAE Compliance**: Emirates ID, AED Currency, VAT Support
- **Membership Management**: Transfer (AED 150), Freeze (Yearly only)
- **Real-time Features**: Event booking, Workout plans, Diet plans
- **Payment Integration**: Stripe UAE, Cash, Card payments

### App Store Ready
- **iOS**: App Store submission ready
- **Android**: Play Store submission ready
- **Design**: Red & White theme optimized for UAE market

### Quick Start
```bash
flutter pub get
flutter run
```

### Build for Production
```bash
# iOS
flutter build ios --release

# Android
flutter build appbundle --release
```

### App Structure
```
lib/
├── main.dart                 # App entry point
├── utils/
│   └── app_theme.dart       # Red & White theme
├── screens/
│   ├── splash_screen.dart   # Animated splash
│   ├── auth/
│   │   └── login_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── membership/
│   │   └── membership_screen.dart
│   ├── gate/
│   │   └── gate_access_screen.dart
│   └── profile/
│       └── profile_screen.dart
└── services/
    ├── auth_service.dart    # Authentication
    └── api_service.dart     # UAE API calls
```

### UAE-Specific Features
- Emirates ID registration
- AED pricing with VAT
- Membership transfer system
- Arabic language support ready
- UAE legal compliance

### Gate Access Methods
1. **QR Code**: Dynamic QR generation
2. **Bluetooth**: Smart lock integration
3. **Facial Recognition**: ML Kit integration

### Ready for Deployment
- All permissions configured
- App icons included
- Store metadata ready
- UAE market optimized