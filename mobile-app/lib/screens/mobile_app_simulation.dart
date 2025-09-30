import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../utils/ultra_modern_theme.dart';
import 'dart:ui';

class MobileAppSimulation extends StatefulWidget {
  @override
  _MobileAppSimulationState createState() => _MobileAppSimulationState();
}

class _MobileAppSimulationState extends State<MobileAppSimulation>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  int _currentIndex = 0;
  String _selectedRole = 'member';
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UltraModernTheme.backgroundColor,
      body: Container(
        decoration: BoxDecoration(
          gradient: UltraModernTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: _isLoggedIn ? _buildMainApp() : _buildOnboarding(),
          ),
        ),
      ),
    );
  }

  Widget _buildOnboarding() {
    return PageView(
      children: [
        _buildWelcomeScreen(),
        _buildRoleSelectionScreen(),
        _buildLoginScreen(),
      ],
    );
  }

  Widget _buildWelcomeScreen() {
    return Padding(
      padding: EdgeInsets.all(24),
      child: Column(
        children: [
          Spacer(),
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: UltraModernTheme.primaryGradient,
              borderRadius: BorderRadius.circular(30),
            ),
            child: Icon(
              Icons.fitness_center,
              size: 60,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 32),
          Text(
            'Welcome to Gymestry',
            style: UltraModernTheme.displayLarge.copyWith(fontSize: 32),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 16),
          Text(
            'The future of gym management\nis in your hands',
            style: UltraModernTheme.bodyLarge.copyWith(
              color: UltraModernTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 48),
          _buildFeatureItem(Icons.public, 'Global Support', '5 countries, local compliance'),
          SizedBox(height: 16),
          _buildFeatureItem(Icons.smartphone, 'Multi-Platform', 'iOS, Android, Web'),
          SizedBox(height: 16),
          _buildFeatureItem(Icons.analytics, 'Real-time Analytics', 'Live business insights'),
          Spacer(),
          Container(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () => _nextPage(),
              style: UltraModernTheme.primaryButtonStyle,
              child: Text(
                'Get Started',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: UltraModernTheme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: UltraModernTheme.primaryColor),
        ),
        SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: UltraModernTheme.bodyLarge),
              Text(subtitle, style: UltraModernTheme.bodyMedium),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRoleSelectionScreen() {
    return Padding(
      padding: EdgeInsets.all(24),
      child: Column(
        children: [
          SizedBox(height: 40),
          Text(
            'What\'s your role?',
            style: UltraModernTheme.headingLarge,
          ),
          SizedBox(height: 8),
          Text(
            'Choose your role to customize your experience',
            style: UltraModernTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 40),
          _buildRoleCard(
            'owner',
            'Gym Owner',
            'Manage your gym business',
            Icons.business_center,
            UltraModernTheme.primaryColor,
          ),
          SizedBox(height: 16),
          _buildRoleCard(
            'staff',
            'Staff Member',
            'Daily gym operations',
            Icons.badge,
            UltraModernTheme.accentColor,
          ),
          SizedBox(height: 16),
          _buildRoleCard(
            'member',
            'Gym Member',
            'Track your fitness journey',
            Icons.fitness_center,
            UltraModernTheme.successColor,
          ),
          Spacer(),
          Container(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () => _nextPage(),
              style: UltraModernTheme.primaryButtonStyle,
              child: Text('Continue'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard(String role, String title, String subtitle, IconData icon, Color color) {
    bool isSelected = _selectedRole == role;
    
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => setState(() => _selectedRole = role),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.1) : UltraModernTheme.cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? color : Colors.transparent,
              width: 2,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: UltraModernTheme.bodyLarge),
                    Text(subtitle, style: UltraModernTheme.bodyMedium),
                  ],
                ),
              ),
              if (isSelected)
                Icon(Icons.check_circle, color: color),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoginScreen() {
    return Padding(
      padding: EdgeInsets.all(24),
      child: Column(
        children: [
          SizedBox(height: 40),
          Text(
            'Sign In',
            style: UltraModernTheme.headingLarge,
          ),
          SizedBox(height: 8),
          Text(
            'Welcome back to Gymestry',
            style: UltraModernTheme.bodyMedium,
          ),
          SizedBox(height: 40),
          TextField(
            decoration: UltraModernTheme.getInputDecoration('Email', icon: Icons.email),
            style: UltraModernTheme.bodyLarge,
          ),
          SizedBox(height: 16),
          TextField(
            decoration: UltraModernTheme.getInputDecoration('Password', icon: Icons.lock),
            style: UltraModernTheme.bodyLarge,
            obscureText: true,
          ),
          SizedBox(height: 24),
          Container(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.lightImpact();
                setState(() => _isLoggedIn = true);
              },
              style: UltraModernTheme.primaryButtonStyle,
              child: Text('Sign In'),
            ),
          ),
          SizedBox(height: 16),
          TextButton(
            onPressed: () {},
            child: Text(
              'Forgot Password?',
              style: UltraModernTheme.bodyMedium.copyWith(
                color: UltraModernTheme.primaryColor,
              ),
            ),
          ),
          Spacer(),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.fingerprint),
                  label: Text('Face ID'),
                  style: UltraModernTheme.glassmorphicButtonStyle,
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.qr_code),
                  label: Text('QR Code'),
                  style: UltraModernTheme.glassmorphicButtonStyle,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMainApp() {
    return Column(
      children: [
        _buildAppBar(),
        Expanded(child: _buildCurrentScreen()),
        _buildBottomNavigation(),
      ],
    );
  }

  Widget _buildAppBar() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: UltraModernTheme.glassmorphismDecoration,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Fitness First Dubai',
                  style: UltraModernTheme.headingMedium.copyWith(fontSize: 18),
                ),
                Text(
                  _getRoleTitle(),
                  style: UltraModernTheme.bodyMedium,
                ),
              ],
            ),
            Spacer(),
            Stack(
              children: [
                IconButton(
                  onPressed: () {},
                  icon: Icon(Icons.notifications_outlined, color: UltraModernTheme.textPrimary),
                ),
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: UltraModernTheme.errorColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentScreen() {
    switch (_currentIndex) {
      case 0: return _buildHomeScreen();
      case 1: return _buildStatsScreen();
      case 2: return _buildClassesScreen();
      case 3: return _buildChatScreen();
      case 4: return _buildProfileScreen();
      default: return _buildHomeScreen();
    }
  }

  Widget _buildHomeScreen() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildWelcomeCard(),
          SizedBox(height: 24),
          _buildQuickStats(),
          SizedBox(height: 24),
          _buildQuickActions(),
          SizedBox(height: 24),
          _buildRecentActivity(),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            UltraModernTheme.primaryColor.withOpacity(0.1),
            UltraModernTheme.accentColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Good ${_getTimeOfDay()}!',
            style: UltraModernTheme.headingMedium,
          ),
          SizedBox(height: 8),
          Text(
            _getWelcomeMessage(),
            style: UltraModernTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats() {
    return GridView.count(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.2,
      children: _getStatsForRole().map((stat) => _buildStatCard(stat)).toList(),
    );
  }

  Widget _buildStatCard(Map<String, dynamic> stat) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: UltraModernTheme.glassmorphismDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(stat['icon'], color: stat['color'], size: 24),
          Spacer(),
          Text(
            stat['value'],
            style: UltraModernTheme.headingMedium.copyWith(
              color: stat['color'],
              fontSize: 20,
            ),
          ),
          Text(
            stat['title'],
            style: UltraModernTheme.bodyMedium.copyWith(fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: UltraModernTheme.headingMedium),
        SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          crossAxisCount: 3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: _getActionsForRole().map((action) => _buildActionCard(action)).toList(),
        ),
      ],
    );
  }

  Widget _buildActionCard(Map<String, dynamic> action) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${action['title']} feature coming soon!')),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: EdgeInsets.all(16),
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(action['icon'], color: UltraModernTheme.primaryColor, size: 24),
              SizedBox(height: 8),
              Text(
                action['title'],
                style: UltraModernTheme.bodyMedium.copyWith(fontSize: 11),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Recent Activity', style: UltraModernTheme.headingMedium),
        SizedBox(height: 16),
        Container(
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: ListView.builder(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: 3,
            itemBuilder: (context, index) {
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: UltraModernTheme.primaryColor.withOpacity(0.2),
                  child: Icon(Icons.fitness_center, color: UltraModernTheme.primaryColor),
                ),
                title: Text('Member checked in', style: UltraModernTheme.bodyLarge),
                subtitle: Text('${index + 2} minutes ago', style: UltraModernTheme.bodyMedium),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildStatsScreen() {
    return Center(
      child: Text('Analytics Dashboard', style: UltraModernTheme.headingLarge),
    );
  }

  Widget _buildClassesScreen() {
    return Center(
      child: Text('Class Schedule', style: UltraModernTheme.headingLarge),
    );
  }

  Widget _buildChatScreen() {
    return Center(
      child: Text('Messages', style: UltraModernTheme.headingLarge),
    );
  }

  Widget _buildProfileScreen() {
    return Center(
      child: Text('Profile Settings', style: UltraModernTheme.headingLarge),
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      height: 80,
      decoration: BoxDecoration(
        color: UltraModernTheme.surfaceColor.withOpacity(0.9),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildNavItem(0, Icons.home, 'Home'),
          _buildNavItem(1, Icons.analytics, 'Stats'),
          _buildNavItem(2, Icons.calendar_today, 'Classes'),
          _buildNavItem(3, Icons.chat, 'Chat'),
          _buildNavItem(4, Icons.person, 'Profile'),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    bool isActive = _currentIndex == index;
    
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        setState(() => _currentIndex = index);
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: isActive ? UltraModernTheme.primaryColor : UltraModernTheme.textSecondary,
            size: 24,
          ),
          SizedBox(height: 4),
          Text(
            label,
            style: UltraModernTheme.labelLarge.copyWith(
              color: isActive ? UltraModernTheme.primaryColor : UltraModernTheme.textSecondary,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  void _nextPage() {
    HapticFeedback.lightImpact();
    // Simulate page navigation
  }

  String _getRoleTitle() {
    switch (_selectedRole) {
      case 'owner': return 'Gym Owner';
      case 'staff': return 'Staff Member';
      default: return 'Member';
    }
  }

  String _getTimeOfDay() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  String _getWelcomeMessage() {
    switch (_selectedRole) {
      case 'owner': return 'Your gym is performing excellently today';
      case 'staff': return 'Ready to help members achieve their goals';
      default: return 'Time to crush your fitness goals';
    }
  }

  List<Map<String, dynamic>> _getStatsForRole() {
    switch (_selectedRole) {
      case 'owner':
        return [
          {'title': 'Revenue', 'value': 'AED 45K', 'icon': Icons.attach_money, 'color': UltraModernTheme.successColor},
          {'title': 'Members', 'value': '1,234', 'icon': Icons.people, 'color': UltraModernTheme.primaryColor},
          {'title': 'Classes', 'value': '24', 'icon': Icons.fitness_center, 'color': UltraModernTheme.accentColor},
          {'title': 'Staff', 'value': '12', 'icon': Icons.badge, 'color': UltraModernTheme.warningColor},
        ];
      case 'staff':
        return [
          {'title': 'Check-ins', 'value': '89', 'icon': Icons.login, 'color': UltraModernTheme.primaryColor},
          {'title': 'Classes', 'value': '6', 'icon': Icons.schedule, 'color': UltraModernTheme.accentColor},
        ];
      default:
        return [
          {'title': 'Workouts', 'value': '4', 'icon': Icons.fitness_center, 'color': UltraModernTheme.primaryColor},
          {'title': 'Calories', 'value': '2,340', 'icon': Icons.local_fire_department, 'color': UltraModernTheme.errorColor},
        ];
    }
  }

  List<Map<String, dynamic>> _getActionsForRole() {
    switch (_selectedRole) {
      case 'owner':
        return [
          {'title': 'Analytics', 'icon': Icons.analytics},
          {'title': 'Staff', 'icon': Icons.people},
          {'title': 'Revenue', 'icon': Icons.attach_money},
          {'title': 'Settings', 'icon': Icons.settings},
          {'title': 'Reports', 'icon': Icons.assessment},
          {'title': 'Marketing', 'icon': Icons.campaign},
        ];
      case 'staff':
        return [
          {'title': 'Check-in', 'icon': Icons.qr_code_scanner},
          {'title': 'Members', 'icon': Icons.people},
          {'title': 'Classes', 'icon': Icons.schedule},
        ];
      default:
        return [
          {'title': 'Check-in', 'icon': Icons.qr_code},
          {'title': 'Classes', 'icon': Icons.fitness_center},
          {'title': 'Workout', 'icon': Icons.play_arrow},
        ];
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}