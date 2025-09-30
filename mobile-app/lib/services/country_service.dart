import 'dart:convert';
import 'package:http/http.dart' as http;

class CountryService {
  static const String baseUrl = 'http://localhost:3000/api/country';
  
  // Supported countries
  static const Map<String, String> supportedCountries = {
    'UAE': 'United Arab Emirates',
    'USA': 'United States',
    'UK': 'United Kingdom',
    'CANADA': 'Canada',
    'AUSTRALIA': 'Australia',
  };
  
  // Get country configuration
  static Future<CountryConfig> getCountryConfig(String countryCode) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/config/$countryCode'),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return CountryConfig.fromJson(data['config']);
      }
      
      // Default to UAE if country not found
      return CountryConfig.uaeDefault();
    } catch (e) {
      return CountryConfig.uaeDefault();
    }
  }
  
  // Get user's country from device locale
  static String detectUserCountry() {
    // This would use device locale in production
    // For now, default to UAE
    return 'UAE';
  }
  
  // Format currency based on country
  static String formatCurrency(double amount, String currency) {
    switch (currency) {
      case 'AED':
        return 'AED ${amount.toStringAsFixed(2)}';
      case 'USD':
        return '\$${amount.toStringAsFixed(2)}';
      case 'GBP':
        return '£${amount.toStringAsFixed(2)}';
      case 'CAD':
        return 'CAD \$${amount.toStringAsFixed(2)}';
      case 'AUD':
        return 'AUD \$${amount.toStringAsFixed(2)}';
      default:
        return '${currency} ${amount.toStringAsFixed(2)}';
    }
  }
}

class CountryConfig {
  final String currency;
  final double vatRate;
  final String idType;
  final double transferFee;
  final String freezePolicy;
  final List<String> languages;
  final List<String> paymentMethods;
  final List<String> legalRequirements;
  
  CountryConfig({
    required this.currency,
    required this.vatRate,
    required this.idType,
    required this.transferFee,
    required this.freezePolicy,
    required this.languages,
    required this.paymentMethods,
    required this.legalRequirements,
  });
  
  factory CountryConfig.fromJson(Map<String, dynamic> json) {
    return CountryConfig(
      currency: json['currency'],
      vatRate: json['vatRate'].toDouble(),
      idType: json['idType'],
      transferFee: json['transferFee'].toDouble(),
      freezePolicy: json['freezePolicy'],
      languages: List<String>.from(json['languages']),
      paymentMethods: List<String>.from(json['paymentMethods']),
      legalRequirements: List<String>.from(json['legalRequirements']),
    );
  }
  
  // UAE default configuration
  factory CountryConfig.uaeDefault() {
    return CountryConfig(
      currency: 'AED',
      vatRate: 0.05,
      idType: 'Emirates ID',
      transferFee: 150.0,
      freezePolicy: 'yearly_only',
      languages: ['en', 'ar'],
      paymentMethods: ['stripe_uae', 'cash', 'card'],
      legalRequirements: ['uae_waiver', 'emirates_id'],
    );
  }
  
  String get formattedTransferFee => CountryService.formatCurrency(transferFee, currency);
  String get formattedVatRate => '${(vatRate * 100).toStringAsFixed(1)}%';
  
  bool get supportsArabic => languages.contains('ar');
  bool get requiresEmiratesId => legalRequirements.contains('emirates_id');
  bool get isYearlyFreezeOnly => freezePolicy == 'yearly_only';
}