import 'package:flutter/material.dart';
import 'screens/mobile_app_simulation.dart';
import 'utils/ultra_modern_theme.dart';

void main() {
  runApp(GymestryApp());
}

class GymestryApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gymestry Global',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.red,
        fontFamily: UltraModernTheme.fontFamily,
        scaffoldBackgroundColor: UltraModernTheme.backgroundColor,
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          iconTheme: IconThemeData(color: UltraModernTheme.textPrimary),
          titleTextStyle: UltraModernTheme.headingMedium,
        ),
      ),
      home: MobileAppSimulation(),
    );
  }
}