import 'package:flutter/material.dart';
import '../utils/ultra_modern_theme.dart';
import 'dart:ui';

class MobileOptimizedDashboard extends StatefulWidget {
  final String gymName;
  final String userRole;
  
  const MobileOptimizedDashboard({
    Key? key,
    required this.gymName,
    required this.userRole,
  }) : super(key: key);

  @override
  _MobileOptimizedDashboardState createState() => _MobileOptimizedDashboardState();
}

class _MobileOptimizedDashboardState extends State<MobileOptimizedDashboard>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: Duration(milliseconds: 800),
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
            child: CustomScrollView(
              slivers: [
                _buildMobileAppBar(),
                SliverPadding(
                  padding: EdgeInsets.all(20),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      _buildWelcomeCard(),
                      SizedBox(height: 24),
                      _buildStatsGrid(),
                      SizedBox(height: 24),
                      _buildQuickActions(),
                      SizedBox(height: 24),
                      _buildRecentActivity(),
                      SizedBox(height: 100), // Bottom padding for iPhone home indicator
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(),
    );
  }

  Widget _buildMobileAppBar() {
    return SliverAppBar(
      expandedHeight: 100,
      floating: false,
      pinned: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        widget.gymName,
                        style: UltraModernTheme.headingMedium.copyWith(fontSize: 20),
                      ),
                      Text(
                        _getRoleTitle(),
                        style: UltraModernTheme.bodyMedium,
                      ),
                    ],
                  ),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: UltraModernTheme.primaryColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.person,
                      color: UltraModernTheme.primaryColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            UltraModernTheme.primaryColor.withOpacity(0.1),
            UltraModernTheme.accentColor.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: UltraModernTheme.primaryColor.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Good ${_getTimeOfDay()}!',
              style: UltraModernTheme.headingLarge.copyWith(fontSize: 28),
            ),
            SizedBox(height: 8),
            Text(
              _getWelcomeMessage(),
              style: UltraModernTheme.bodyLarge.copyWith(
                color: UltraModernTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid() {
    final stats = _getStatsForRole();
    
    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.2,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return _buildStatCard(
          title: stat['title'],
          value: stat['value'],
          icon: stat['icon'],
          color: stat['color'],
          trend: stat['trend'],
        );
      },
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    String? trend,
  }) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: UltraModernTheme.glassmorphismDecoration,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                if (trend != null)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: UltraModernTheme.successColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      trend,
                      style: UltraModernTheme.labelLarge.copyWith(
                        color: UltraModernTheme.successColor,
                        fontSize: 10,
                      ),
                    ),
                  ),
              ],
            ),
            Spacer(),
            Text(
              value,
              style: UltraModernTheme.headingMedium.copyWith(
                color: color,
                fontSize: 20,
              ),
            ),
            Text(
              title,
              style: UltraModernTheme.bodyMedium.copyWith(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = _getActionsForRole();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: UltraModernTheme.headingMedium.copyWith(fontSize: 20),
        ),
        SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1,
          ),
          itemCount: actions.length,
          itemBuilder: (context, index) {
            final action = actions[index];
            return _buildActionCard(
              title: action['title'],
              icon: action['icon'],
              onTap: action['onTap'],
            );
          },
        ),
      ],
    );
  }

  Widget _buildActionCard({
    required String title,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: EdgeInsets.all(16),
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  color: UltraModernTheme.primaryColor,
                  size: 24,
                ),
                SizedBox(height: 8),
                Text(
                  title,
                  style: UltraModernTheme.bodyMedium.copyWith(fontSize: 11),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Activity',
          style: UltraModernTheme.headingMedium.copyWith(fontSize: 20),
        ),
        SizedBox(height: 16),
        Container(
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: ListView.separated(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: 3,
              separatorBuilder: (context, index) => Divider(
                color: UltraModernTheme.textTertiary.withOpacity(0.1),
                height: 1,
              ),
              itemBuilder: (context, index) {
                return ListTile(
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: CircleAvatar(
                    radius: 20,
                    backgroundColor: UltraModernTheme.primaryColor.withOpacity(0.2),
                    child: Icon(
                      Icons.fitness_center,
                      color: UltraModernTheme.primaryColor,
                      size: 16,
                    ),
                  ),
                  title: Text(
                    'Member checked in',
                    style: UltraModernTheme.bodyLarge.copyWith(fontSize: 14),
                  ),
                  subtitle: Text(
                    '${index + 2} minutes ago',
                    style: UltraModernTheme.bodyMedium.copyWith(fontSize: 12),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      height: 90,
      decoration: BoxDecoration(
        color: UltraModernTheme.surfaceColor.withOpacity(0.9),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildNavItem(Icons.home, 'Home', true),
            _buildNavItem(Icons.fitness_center, 'Workout', false),
            _buildNavItem(Icons.calendar_today, 'Classes', false),
            _buildNavItem(Icons.person, 'Profile', false),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, bool isActive) {
    return Column(
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
    );
  }

  String _getRoleTitle() {
    switch (widget.userRole) {
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
    switch (widget.userRole) {
      case 'owner': return 'Your gym is performing excellently today';
      case 'staff': return 'Ready to help members achieve their goals';
      default: return 'Time to crush your fitness goals';
    }
  }

  List<Map<String, dynamic>> _getStatsForRole() {
    switch (widget.userRole) {
      case 'owner':
        return [
          {'title': 'Revenue', 'value': 'AED 45K', 'icon': Icons.attach_money, 'color': UltraModernTheme.successColor, 'trend': '+12%'},
          {'title': 'Members', 'value': '1,234', 'icon': Icons.people, 'color': UltraModernTheme.primaryColor, 'trend': '+8%'},
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
    switch (widget.userRole) {
      case 'owner':
        return [
          {'title': 'Analytics', 'icon': Icons.analytics, 'onTap': () {}},
          {'title': 'Staff', 'icon': Icons.people, 'onTap': () {}},
          {'title': 'Revenue', 'icon': Icons.attach_money, 'onTap': () {}},
          {'title': 'Settings', 'icon': Icons.settings, 'onTap': () {}},
          {'title': 'Reports', 'icon': Icons.assessment, 'onTap': () {}},
          {'title': 'Marketing', 'icon': Icons.campaign, 'onTap': () {}},
        ];
      case 'staff':
        return [
          {'title': 'Check-in', 'icon': Icons.qr_code_scanner, 'onTap': () {}},
          {'title': 'Members', 'icon': Icons.people, 'onTap': () {}},
          {'title': 'Classes', 'icon': Icons.schedule, 'onTap': () {}},
        ];
      default:
        return [
          {'title': 'Check-in', 'icon': Icons.qr_code, 'onTap': () {}},
          {'title': 'Classes', 'icon': Icons.fitness_center, 'onTap': () {}},
          {'title': 'Workout', 'icon': Icons.play_arrow, 'onTap': () {}},
        ];
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}