import 'package:flutter/material.dart';
import '../services/country_service.dart';
import '../utils/ultra_modern_theme.dart';

class CountrySelectionScreen extends StatefulWidget {
  @override
  _CountrySelectionScreenState createState() => _CountrySelectionScreenState();
}

class _CountrySelectionScreenState extends State<CountrySelectionScreen> {
  String? selectedCountry;
  
  @override
  void initState() {
    super.initState();
    selectedCountry = CountryService.detectUserCountry();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UltraModernTheme.backgroundColor,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 40),
              Text(
                'Select Your Country',
                style: UltraModernTheme.headingLarge,
              ),
              SizedBox(height: 12),
              Text(
                'Choose your location to customize features and pricing',
                style: UltraModernTheme.bodyLarge.copyWith(
                  color: UltraModernTheme.textSecondary,
                ),
              ),
              SizedBox(height: 40),
              Expanded(
                child: ListView.builder(
                  itemCount: CountryService.supportedCountries.length,
                  itemBuilder: (context, index) {
                    final countryCode = CountryService.supportedCountries.keys.elementAt(index);
                    final countryName = CountryService.supportedCountries[countryCode]!;
                    final isSelected = selectedCountry == countryCode;
                    
                    return Container(
                      margin: EdgeInsets.only(bottom: 16),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => setState(() => selectedCountry = countryCode),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: isSelected 
                                ? UltraModernTheme.primaryColor.withOpacity(0.1)
                                : UltraModernTheme.cardColor,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected 
                                  ? UltraModernTheme.primaryColor
                                  : Colors.transparent,
                                width: 2,
                              ),
                              boxShadow: UltraModernTheme.cardShadow,
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: _getCountryColor(countryCode),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: Text(
                                      _getCountryFlag(countryCode),
                                      style: TextStyle(fontSize: 24),
                                    ),
                                  ),
                                ),
                                SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        countryName,
                                        style: UltraModernTheme.bodyLarge.copyWith(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        _getCountryCurrency(countryCode),
                                        style: UltraModernTheme.bodyMedium,
                                      ),
                                    ],
                                  ),
                                ),
                                if (isSelected)
                                  Icon(
                                    Icons.check_circle,
                                    color: UltraModernTheme.primaryColor,
                                    size: 24,
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              Container(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: selectedCountry != null ? _continueWithCountry : null,
                  style: UltraModernTheme.primaryButtonStyle,
                  child: Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  String _getCountryFlag(String countryCode) {
    const flags = {
      'UAE': '🇦🇪',
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'CANADA': '🇨🇦',
      'AUSTRALIA': '🇦🇺',
    };
    return flags[countryCode] ?? '🌍';
  }
  
  Color _getCountryColor(String countryCode) {
    const colors = {
      'UAE': Color(0xFFE53E3E),
      'USA': Color(0xFF3182CE),
      'UK': Color(0xFF805AD5),
      'CANADA': Color(0xFFD53F8C),
      'AUSTRALIA': Color(0xFF38A169),
    };
    return colors[countryCode] ?? UltraModernTheme.primaryColor;
  }
  
  String _getCountryCurrency(String countryCode) {
    const currencies = {
      'UAE': 'AED - United Arab Emirates Dirham',
      'USA': 'USD - US Dollar',
      'UK': 'GBP - British Pound',
      'CANADA': 'CAD - Canadian Dollar',
      'AUSTRALIA': 'AUD - Australian Dollar',
    };
    return currencies[countryCode] ?? 'Local Currency';
  }
  
  void _continueWithCountry() {
    // Save selected country and navigate to main app
    Navigator.pushReplacementNamed(context, '/home');
  }
}