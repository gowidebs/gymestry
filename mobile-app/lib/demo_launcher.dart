import 'package:flutter/material.dart';
import 'utils/ultra_modern_theme.dart';

class DemoLauncher extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UltraModernTheme.backgroundColor,
      body: Container(
        decoration: BoxDecoration(
          gradient: UltraModernTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 40),
                Text(
                  'Gymestry Ultra-Modern Demo',
                  style: UltraModernTheme.displayLarge.copyWith(fontSize: 36),
                ),
                SizedBox(height: 12),
                Text(
                  'Experience the future of gym management',
                  style: UltraModernTheme.bodyLarge.copyWith(
                    color: UltraModernTheme.textSecondary,
                  ),
                ),
                SizedBox(height: 60),
                
                // Demo Cards
                _buildDemoCard(
                  context,
                  'Gym Owner Dashboard',
                  'Complete business management with analytics',
                  Icons.business_center,
                  UltraModernTheme.primaryColor,
                  () => Navigator.pushNamed(context, '/owner-dashboard'),
                ),
                
                SizedBox(height: 20),
                
                _buildDemoCard(
                  context,
                  'Staff Dashboard',
                  'Efficient tools for gym staff operations',
                  Icons.badge,
                  UltraModernTheme.accentColor,
                  () => Navigator.pushNamed(context, '/staff-dashboard'),
                ),
                
                SizedBox(height: 20),
                
                _buildDemoCard(
                  context,
                  'Member Experience',
                  'Personalized fitness journey tracking',
                  Icons.fitness_center,
                  UltraModernTheme.successColor,
                  () => Navigator.pushNamed(context, '/member-dashboard'),
                ),
                
                Spacer(),
                
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(20),
                  decoration: UltraModernTheme.glassmorphismDecoration,
                  child: Column(
                    children: [
                      Text(
                        '🌍 Global Multi-Gym System',
                        style: UltraModernTheme.headingMedium.copyWith(fontSize: 18),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'White-label solution for gym franchises worldwide',
                        style: UltraModernTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildDemoCard(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color.withOpacity(0.1),
                color.withOpacity(0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: color.withOpacity(0.2),
              width: 1,
            ),
            boxShadow: UltraModernTheme.cardShadow,
          ),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 28,
                ),
              ),
              SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: UltraModernTheme.headingMedium.copyWith(fontSize: 18),
                    ),
                    SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: UltraModernTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                color: UltraModernTheme.textSecondary,
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }
}