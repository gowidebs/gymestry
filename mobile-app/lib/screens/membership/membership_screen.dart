import 'package:flutter/material.dart';
import '../../utils/app_theme.dart';

class MembershipScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Membership'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCurrentMembership(),
            SizedBox(height: 20),
            _buildMembershipActions(),
            SizedBox(height: 20),
            _buildPaymentHistory(),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentMembership() {
    return Card(
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.primaryRed, AppTheme.darkRed],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.card_membership, color: AppTheme.white, size: 28),
                SizedBox(width: 12),
                Text(
                  'Yearly Membership',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.white,
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            _buildMembershipDetail('Member ID', 'GYM2024001'),
            _buildMembershipDetail('Start Date', 'Jan 1, 2024'),
            _buildMembershipDetail('End Date', 'Dec 31, 2024'),
            _buildMembershipDetail('Status', 'Active'),
            SizedBox(height: 12),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'PREMIUM MEMBER',
                style: TextStyle(
                  color: AppTheme.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMembershipDetail(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: TextStyle(
              color: AppTheme.white.withOpacity(0.8),
              fontSize: 14,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: AppTheme.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMembershipActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Membership Actions',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 12),
        _buildActionCard(
          'Transfer Membership',
          'Transfer to another person (AED 150 fee)',
          Icons.swap_horiz,
          Colors.orange,
        ),
        SizedBox(height: 12),
        _buildActionCard(
          'Freeze Membership',
          'Freeze for 1 month (Yearly plans only)',
          Icons.pause_circle,
          Colors.blue,
        ),
        SizedBox(height: 12),
        _buildActionCard(
          'Renew Membership',
          'Extend your membership period',
          Icons.refresh,
          Colors.green,
        ),
      ],
    );
  }

  Widget _buildActionCard(String title, String subtitle, IconData icon, Color color) {
    return Card(
      child: ListTile(
        leading: Container(
          padding: EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(
          title,
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(subtitle),
        trailing: Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {},
      ),
    );
  }

  Widget _buildPaymentHistory() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Payment History',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 12),
        Card(
          child: Column(
            children: [
              _buildPaymentItem('Yearly Membership', 'AED 2,400', 'Jan 1, 2024', true),
              Divider(height: 1),
              _buildPaymentItem('Personal Training', 'AED 300', 'Nov 15, 2024', true),
              Divider(height: 1),
              _buildPaymentItem('Supplement Purchase', 'AED 150', 'Oct 20, 2024', true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentItem(String title, String amount, String date, bool isPaid) {
    return ListTile(
      title: Text(title),
      subtitle: Text(date),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            amount,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isPaid ? Colors.green : Colors.red,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              isPaid ? 'PAID' : 'PENDING',
              style: TextStyle(
                color: AppTheme.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}