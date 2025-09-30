import 'package:flutter/material.dart';
import '../../utils/app_theme.dart';

class ClassesScreen extends StatefulWidget {
  @override
  _ClassesScreenState createState() => _ClassesScreenState();
}

class _ClassesScreenState extends State<ClassesScreen> {
  DateTime _selectedDate = DateTime.now();
  String _selectedCategory = 'All';
  final List<String> _categories = ['All', 'Yoga', 'HIIT', 'Strength', 'Cardio'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Classes'),
        actions: [
          IconButton(icon: Icon(Icons.calendar_today), onPressed: _selectDate),
          IconButton(icon: Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          _buildDateSelector(),
          _buildCategoryFilter(),
          _buildMyBookings(),
          Expanded(child: _buildClassesList()),
        ],
      ),
    );
  }

  Widget _buildDateSelector() {
    return Container(
      height: 80,
      padding: EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 7,
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index));
          final isSelected = date.day == _selectedDate.day;
          
          return GestureDetector(
            onTap: () => setState(() => _selectedDate = date),
            child: Container(
              width: 60,
              margin: EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryRed : AppTheme.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.lightGrey),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.weekday % 7],
                    style: TextStyle(
                      fontSize: 12,
                      color: isSelected ? AppTheme.white : AppTheme.grey,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '${date.day}',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? AppTheme.white : AppTheme.darkGrey,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = _selectedCategory == category;
          
          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = category),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              margin: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryRed : AppTheme.lightGrey,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                category,
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

  Widget _buildMyBookings() {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'My Bookings Today',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildBookingCard('Yoga Flow', '9:00 AM', 'Confirmed')),
                SizedBox(width: 12),
                Expanded(child: _buildBookingCard('HIIT Training', '6:00 PM', 'Waitlist #2')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingCard(String className, String time, String status) {
    final isConfirmed = status == 'Confirmed';
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isConfirmed ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isConfirmed ? Colors.green : Colors.orange,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            className,
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          ),
          SizedBox(height: 4),
          Text(time, style: TextStyle(color: AppTheme.grey, fontSize: 12)),
          SizedBox(height: 4),
          Text(
            status,
            style: TextStyle(
              color: isConfirmed ? Colors.green : Colors.orange,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClassesList() {
    final classes = [
      {
        'name': 'Morning Yoga Flow',
        'instructor': 'Sarah Johnson',
        'time': '7:00 AM - 8:00 AM',
        'capacity': '12/15',
        'price': 'AED 45',
        'level': 'Beginner',
        'available': true,
      },
      {
        'name': 'HIIT Bootcamp',
        'instructor': 'Ahmed Al Rashid',
        'time': '8:30 AM - 9:30 AM',
        'capacity': '20/20',
        'price': 'AED 60',
        'level': 'Advanced',
        'available': false,
      },
      {
        'name': 'Strength Training',
        'instructor': 'Mohammed Hassan',
        'time': '6:00 PM - 7:00 PM',
        'capacity': '8/12',
        'price': 'AED 55',
        'level': 'Intermediate',
        'available': true,
      },
    ];

    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: classes.length,
      itemBuilder: (context, index) {
        final classData = classes[index];
        return _buildClassCard(classData);
      },
    );
  }

  Widget _buildClassCard(Map<String, dynamic> classData) {
    final isAvailable = classData['available'] as bool;
    
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    classData['name'],
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getLevelColor(classData['level']).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    classData['level'],
                    style: TextStyle(
                      color: _getLevelColor(classData['level']),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.person, size: 16, color: AppTheme.grey),
                SizedBox(width: 4),
                Text(
                  classData['instructor'],
                  style: TextStyle(color: AppTheme.grey),
                ),
              ],
            ),
            SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.access_time, size: 16, color: AppTheme.grey),
                SizedBox(width: 4),
                Text(
                  classData['time'],
                  style: TextStyle(color: AppTheme.grey),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Text(
                  classData['price'],
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryRed,
                  ),
                ),
                Spacer(),
                Text(
                  classData['capacity'],
                  style: TextStyle(color: AppTheme.grey),
                ),
                SizedBox(width: 12),
                ElevatedButton(
                  onPressed: isAvailable ? () => _bookClass(classData) : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isAvailable ? AppTheme.primaryRed : AppTheme.grey,
                    padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  ),
                  child: Text(
                    isAvailable ? 'Book' : 'Full',
                    style: TextStyle(color: AppTheme.white),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getLevelColor(String level) {
    switch (level) {
      case 'Beginner':
        return Colors.green;
      case 'Intermediate':
        return Colors.orange;
      case 'Advanced':
        return Colors.red;
      default:
        return AppTheme.grey;
    }
  }

  void _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 30)),
    );
    
    if (date != null) {
      setState(() => _selectedDate = date);
    }
  }

  void _bookClass(Map<String, dynamic> classData) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Book Class'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Class: ${classData['name']}'),
            Text('Instructor: ${classData['instructor']}'),
            Text('Time: ${classData['time']}'),
            Text('Price: ${classData['price']}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Class booked successfully!'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: Text('Confirm Booking'),
          ),
        ],
      ),
    );
  }
}