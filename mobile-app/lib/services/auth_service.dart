import 'package:flutter/foundation.dart';

class AuthService extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _userToken;
  Map<String, dynamic>? _userData;

  bool get isAuthenticated => _isAuthenticated;
  String? get userToken => _userToken;
  Map<String, dynamic>? get userData => _userData;

  Future<bool> login(String phone, String password) async {
    try {
      // Simulate API call
      await Future.delayed(Duration(seconds: 2));
      
      // Mock successful login
      _isAuthenticated = true;
      _userToken = 'mock_token_${DateTime.now().millisecondsSinceEpoch}';
      _userData = {
        'id': 'user_123',
        'name': 'Ahmed Al Rashid',
        'phone': phone,
        'email': 'ahmed.rashid@email.com',
        'emiratesId': '784-1234-5678901-2',
        'membershipType': 'yearly',
        'membershipStatus': 'active',
      };
      
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _userToken = null;
    _userData = null;
    notifyListeners();
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    try {
      // Simulate API call
      await Future.delayed(Duration(seconds: 2));
      
      // Mock successful registration
      return true;
    } catch (e) {
      return false;
    }
  }
}