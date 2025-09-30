import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService extends ChangeNotifier {
  static const String baseUrl = 'http://localhost:3000';
  
  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load data');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      );
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to post data');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // UAE-specific API calls
  Future<Map<String, dynamic>> requestMembershipTransfer(String fromUserId, Map<String, dynamic> toUserData) async {
    return await post('/transfers/request', {
      'fromUserId': fromUserId,
      'toUserName': toUserData['name'],
      'toUserPhone': toUserData['phone'],
      'toUserEmiratesId': toUserData['emiratesId'],
    });
  }

  Future<Map<String, dynamic>> requestMembershipFreeze(String userId, String reason) async {
    return await post('/memberships/freeze', {
      'userId': userId,
      'reason': reason,
    });
  }

  Future<Map<String, dynamic>> validateGateAccess(String userId, String method, String data) async {
    return await post('/gate/validate', {
      'userId': userId,
      'method': method,
      'data': data,
      'gateId': 'gate_001',
    });
  }

  Future<List<dynamic>> getEvents() async {
    final response = await get('/events');
    return response['events'] ?? [];
  }

  Future<Map<String, dynamic>> bookEvent(String eventId, String userId) async {
    return await post('/events/book', {
      'eventId': eventId,
      'userId': userId,
    });
  }

  Future<List<dynamic>> getWorkoutPlans(String userId) async {
    final response = await get('/workout-plans?userId=$userId');
    return response['plans'] ?? [];
  }

  Future<List<dynamic>> getDietPlans(String userId) async {
    final response = await get('/diet-plans?userId=$userId');
    return response['plans'] ?? [];
  }
}