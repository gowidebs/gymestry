import 'package:flutter/material.dart';
import '../../utils/app_theme.dart';

class MessagingScreen extends StatefulWidget {
  const MessagingScreen({super.key});
  
  @override
  _MessagingScreenState createState() => _MessagingScreenState();
}

class _MessagingScreenState extends State<MessagingScreen> {
  int _selectedTab = 0;
  final List<String> _tabs = ['All', 'WhatsApp', 'Instagram', 'SMS'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Messages'),
        actions: [
          IconButton(icon: Icon(Icons.search), onPressed: () {}),
          IconButton(icon: Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          _buildTabBar(),
          _buildStatsCards(),
          Expanded(child: _buildConversationsList()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppTheme.primaryRed,
        child: Icon(Icons.add),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _tabs.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedTab == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedTab = index),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              margin: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryRed : AppTheme.lightGrey,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _tabs[index],
                style: TextStyle(
                  color: isSelected ? AppTheme.white : AppTheme.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatsCards() {
    return Container(
      height: 100,
      padding: EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(child: _buildStatCard('Open', '23', Colors.orange)),
          SizedBox(width: 12),
          Expanded(child: _buildStatCard('Leads', '8', Colors.green)),
          SizedBox(width: 12),
          Expanded(child: _buildStatCard('Pending', '5', Colors.red)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String count, Color color) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(
            count,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          SizedBox(height: 4),
          Text(title, style: TextStyle(fontSize: 12, color: AppTheme.grey)),
        ],
      ),
    );
  }

  Widget _buildConversationsList() {
    final conversations = [
      {
        'name': 'Ahmed Al Rashid',
        'channel': 'whatsapp',
        'lastMessage': 'What are your membership prices?',
        'time': '2 min ago',
        'unread': 2,
        'isLead': true,
      },
      {
        'name': 'Sarah Johnson',
        'channel': 'instagram',
        'lastMessage': 'Do you have yoga classes?',
        'time': '15 min ago',
        'unread': 0,
        'isLead': true,
      },
    ];

    return ListView.builder(
      itemCount: conversations.length,
      itemBuilder: (context, index) {
        final conv = conversations[index];
        return Card(
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppTheme.primaryRed,
              child: Text(
                (conv['name'] as String? ?? '').isNotEmpty ? (conv['name'] as String)[0] : '?', 
                style: const TextStyle(color: Colors.white)
              ),
            ),
            title: Row(
              children: [
                Expanded(child: Text(
                  conv['name'] as String? ?? '', 
                  style: const TextStyle(fontWeight: FontWeight.w600)
                )),
                if (conv['isLead'] as bool? ?? false)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text('LEAD', style: TextStyle(color: Colors.white, fontSize: 10)),
                  ),
              ],
            ),
            subtitle: Text(
              conv['lastMessage'] as String? ?? '', 
              maxLines: 1, 
              overflow: TextOverflow.ellipsis
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  conv['time'] as String? ?? '', 
                  style: const TextStyle(fontSize: 12, color: Colors.grey)
                ),
                if ((conv['unread'] as int? ?? 0) > 0)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red, 
                      shape: BoxShape.circle
                    ),
                    child: Text(
                      '${conv['unread']}', 
                      style: const TextStyle(color: Colors.white, fontSize: 10)
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}