import 'package:flutter/material.dart';
import '../../utils/app_theme.dart';

class AnalyticsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Analytics'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            _buildRevenueCard(),
            SizedBox(height: 16),
            _buildMembershipStats(),
            SizedBox(height: 16),
            _buildAttendanceChart(),
          ],
        ),
      ),
    );
  }

  Widget _buildRevenueCard() {
    return Card(
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.primaryRed, AppTheme.darkRed],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Monthly Revenue',
              style: TextStyle(color: AppTheme.white, fontSize: 16),
            ),
            SizedBox(height: 8),
            Text(
              'AED 48,840',
              style: TextStyle(
                color: AppTheme.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              '+12.5% from last month',
              style: TextStyle(color: Colors.green, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMembershipStats() {
    return Row(
      children: [
        Expanded(child: _buildStatCard('Active Members', '456', Colors.blue)),
        SizedBox(width: 12),
        Expanded(child: _buildStatCard('New This Month', '23', Colors.green)),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text(title, style: TextStyle(color: AppTheme.grey)),
            SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendanceChart() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Weekly Attendance',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 16),
            Container(
              height: 150,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _buildBar('Mon', 0.8),
                  _buildBar('Tue', 0.6),
                  _buildBar('Wed', 0.9),
                  _buildBar('Thu', 0.7),
                  _buildBar('Fri', 0.5),
                  _buildBar('Sat', 1.0),
                  _buildBar('Sun', 0.4),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBar(String day, double height) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Container(
          width: 25,
          height: 100 * height,
          decoration: BoxDecoration(
            color: AppTheme.primaryRed,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        SizedBox(height: 8),
        Text(day, style: TextStyle(fontSize: 12)),
      ],
    );
  }
}