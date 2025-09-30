import 'package:flutter/material.dart';
import 'dart:ui';

class UltraModernTheme {
  // Dynamic colors based on gym branding
  static Color primaryColor = const Color(0xFFE53E3E);
  static Color secondaryColor = const Color(0xFFFFFFFF);
  
  // Ultra-modern color palette
  static const Color backgroundColor = Color(0xFF0A0A0B);
  static const Color surfaceColor = Color(0xFF1A1A1D);
  static const Color cardColor = Color(0xFF2D2D30);
  static const Color accentColor = Color(0xFF6C5CE7);
  static const Color successColor = Color(0xFF00D4AA);
  static const Color warningColor = Color(0xFFFFB800);
  static const Color errorColor = Color(0xFFFF6B6B);
  
  // Text colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0B3);
  static const Color textTertiary = Color(0xFF6C6C70);
  
  // Glassmorphism effects
  static BoxDecoration get glassmorphismDecoration => BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Colors.white.withOpacity(0.1),
        Colors.white.withOpacity(0.05),
      ],
    ),
    borderRadius: BorderRadius.circular(20),
    border: Border.all(
      color: Colors.white.withOpacity(0.1),
      width: 1,
    ),
  );
  
  // Advanced shadows
  static List<BoxShadow> get neuomorphicShadow => [
    BoxShadow(
      color: Colors.black.withOpacity(0.3),
      offset: const Offset(8, 8),
      blurRadius: 16,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Colors.white.withOpacity(0.05),
      offset: const Offset(-4, -4),
      blurRadius: 8,
      spreadRadius: 0,
    ),
  ];
  
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: primaryColor.withOpacity(0.1),
      offset: const Offset(0, 8),
      blurRadius: 32,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.2),
      offset: const Offset(0, 2),
      blurRadius: 8,
      spreadRadius: 0,
    ),
  ];
  
  // Typography with SF Pro
  static const String fontFamily = 'SF Pro Display';
  
  static TextStyle get displayLarge => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 48,
    fontWeight: FontWeight.w700,
    color: textPrimary,
    letterSpacing: -1.5,
    height: 1.1,
  );
  
  static TextStyle get headingLarge => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 32,
    fontWeight: FontWeight.w600,
    color: textPrimary,
    letterSpacing: -0.5,
    height: 1.2,
  );
  
  static TextStyle get headingMedium => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: textPrimary,
    letterSpacing: -0.25,
    height: 1.3,
  );
  
  static TextStyle get bodyLarge => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: textPrimary,
    letterSpacing: 0,
    height: 1.5,
  );
  
  static TextStyle get bodyMedium => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: textSecondary,
    letterSpacing: 0.1,
    height: 1.4,
  );
  
  static TextStyle get labelLarge => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: textTertiary,
    letterSpacing: 0.5,
    height: 1.3,
  );
  
  // Gradients
  static LinearGradient get primaryGradient => LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      primaryColor,
      primaryColor.withOpacity(0.8),
    ],
  );
  
  static LinearGradient get accentGradient => const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      accentColor,
      Color(0xFF74B9FF),
    ],
  );
  
  static LinearGradient get backgroundGradient => const LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      backgroundColor,
      Color(0xFF151518),
    ],
  );
  
  // Button styles
  static ButtonStyle get primaryButtonStyle => ElevatedButton.styleFrom(
    backgroundColor: primaryColor,
    foregroundColor: Colors.white,
    elevation: 0,
    shadowColor: Colors.transparent,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
    ),
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
  );
  
  static ButtonStyle get glassmorphicButtonStyle => ElevatedButton.styleFrom(
    backgroundColor: Colors.white.withOpacity(0.1),
    foregroundColor: textPrimary,
    elevation: 0,
    shadowColor: Colors.transparent,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: BorderSide(
        color: Colors.white.withOpacity(0.1),
        width: 1,
      ),
    ),
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
  );
  
  // Input decoration
  static InputDecoration getInputDecoration(String label, {IconData? icon}) => InputDecoration(
    labelText: label,
    labelStyle: bodyMedium,
    prefixIcon: icon != null ? Icon(icon, color: textSecondary) : null,
    filled: true,
    fillColor: surfaceColor,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide.none,
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(color: primaryColor, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  );
  
  // Animation durations
  static const Duration fastAnimation = Duration(milliseconds: 200);
  static const Duration normalAnimation = Duration(milliseconds: 300);
  static const Duration slowAnimation = Duration(milliseconds: 500);
  
  // Spacing
  static const double spacingXS = 4;
  static const double spacingSM = 8;
  static const double spacingMD = 16;
  static const double spacingLG = 24;
  static const double spacingXL = 32;
  static const double spacingXXL = 48;
  
  // Border radius
  static const double radiusSM = 8;
  static const double radiusMD = 16;
  static const double radiusLG = 24;
  static const double radiusXL = 32;
  
  // Update theme colors based on gym branding
  static void updateBranding({
    required Color primary,
    required Color secondary,
  }) {
    primaryColor = primary;
    secondaryColor = secondary;
  }
}