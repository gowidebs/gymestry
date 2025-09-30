import 'package:flutter/material.dart';
import '../utils/ultra_modern_theme.dart';
import 'dart:ui';

class UltraModernDashboard extends StatefulWidget {
  final String gymName;
  final String userRole; // 'member', 'staff', 'owner'
  
  const UltraModernDashboard({
    Key? key,
    required this.gymName,
    required this.userRole,
  }) : super(key: key);

  @override
  _UltraModernDashboardState createState() => _UltraModernDashboardState();
}

class _UltraModernDashboardState extends State<UltraModernDashboard>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: UltraModernTheme.normalAnimation,
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animationController, curve: Curves.easeOut));
    
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
            child: SlideTransition(
              position: _slideAnimation,
              child: CustomScrollView(
                slivers: [
                  _buildAppBar(),
                  SliverPadding(
                    padding: const EdgeInsets.all(UltraModernTheme.spacingLG),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        _buildQuickStats(),
                        const SizedBox(height: UltraModernTheme.spacingXL),
                        _buildQuickActions(),
                        const SizedBox(height: UltraModernTheme.spacingXL),
                        _buildRecentActivity(),
                        const SizedBox(height: UltraModernTheme.spacingXL),
                        _buildUpcomingEvents(),
                      ]),
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

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Padding(
              padding: const EdgeInsets.all(UltraModernTheme.spacingLG),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Welcome back',
                    style: UltraModernTheme.bodyMedium,
                  ),
                  Text(
                    widget.gymName,
                    style: UltraModernTheme.headingLarge,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined, color: UltraModernTheme.textPrimary),
          onPressed: () {},
        ),
        IconButton(
          icon: const Icon(Icons.person_outline, color: UltraModernTheme.textPrimary),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildQuickStats() {
    final stats = _getStatsForRole();
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: UltraModernTheme.spacingMD,
        mainAxisSpacing: UltraModernTheme.spacingMD,
        childAspectRatio: 1.5,
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
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withOpacity(0.1),
            color.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(UltraModernTheme.radiusLG),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: UltraModernTheme.cardShadow,
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Padding(
          padding: const EdgeInsets.all(UltraModernTheme.spacingMD),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(icon, color: color, size: 24),
                  if (trend != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: UltraModernTheme.successColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        trend,
                        style: UltraModernTheme.labelLarge.copyWith(
                          color: UltraModernTheme.successColor,
                        ),
                      ),
                    ),
                ],
              ),
              const Spacer(),
              Text(
                value,
                style: UltraModernTheme.headingMedium.copyWith(color: color),
              ),
              Text(
                title,
                style: UltraModernTheme.bodyMedium,
              ),
            ],
          ),
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
          style: UltraModernTheme.headingMedium,
        ),
        const SizedBox(height: UltraModernTheme.spacingMD),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: UltraModernTheme.spacingMD,
            mainAxisSpacing: UltraModernTheme.spacingMD,
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
        borderRadius: BorderRadius.circular(UltraModernTheme.radiusMD),
        child: Container(
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Padding(
              padding: const EdgeInsets.all(UltraModernTheme.spacingMD),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    icon,
                    color: UltraModernTheme.primaryColor,
                    size: 32,
                  ),
                  const SizedBox(height: UltraModernTheme.spacingSM),
                  Text(
                    title,
                    style: UltraModernTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
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
          style: UltraModernTheme.headingMedium,
        ),
        const SizedBox(height: UltraModernTheme.spacingMD),
        Container(
          decoration: UltraModernTheme.glassmorphismDecoration,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 3,
              separatorBuilder: (context, index) => Divider(
                color: UltraModernTheme.textTertiary.withOpacity(0.1),
              ),
              itemBuilder: (context, index) {
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: UltraModernTheme.primaryColor.withOpacity(0.2),
                    child: Icon(
                      Icons.fitness_center,
                      color: UltraModernTheme.primaryColor,
                    ),
                  ),
                  title: Text(
                    'Member checked in',
                    style: UltraModernTheme.bodyLarge,
                  ),
                  subtitle: Text(
                    '2 minutes ago',
                    style: UltraModernTheme.bodyMedium,
                  ),
                  trailing: Icon(
                    Icons.chevron_right,
                    color: UltraModernTheme.textSecondary,
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUpcomingEvents() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Upcoming Classes',
          style: UltraModernTheme.headingMedium,
        ),
        const SizedBox(height: UltraModernTheme.spacingMD),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: 3,
            itemBuilder: (context, index) {
              return Container(
                width: 280,
                margin: const EdgeInsets.only(right: UltraModernTheme.spacingMD),
                decoration: UltraModernTheme.glassmorphismDecoration,
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Padding(
                    padding: const EdgeInsets.all(UltraModernTheme.spacingMD),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'HIIT Training',
                          style: UltraModernTheme.headingMedium.copyWith(fontSize: 18),
                        ),
                        const SizedBox(height: UltraModernTheme.spacingSM),
                        Text(
                          'High-intensity interval training session',
                          style: UltraModernTheme.bodyMedium,
                        ),
                        const Spacer(),
                        Row(
                          children: [
                            Icon(
                              Icons.schedule,
                              color: UltraModernTheme.textSecondary,
                              size: 16,
                            ),
                            const SizedBox(width: UltraModernTheme.spacingSM),
                            Text(
                              '6:00 PM - 7:00 PM',
                              style: UltraModernTheme.bodyMedium,
                            ),
                          ],
                        ),
                        const SizedBox(height: UltraModernTheme.spacingSM),
                        Row(
                          children: [
                            Icon(
                              Icons.people,
                              color: UltraModernTheme.textSecondary,
                              size: 16,
                            ),
                            const SizedBox(width: UltraModernTheme.spacingSM),
                            Text(
                              '12/15 spots filled',
                              style: UltraModernTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  List<Map<String, dynamic>> _getStatsForRole() {
    switch (widget.userRole) {
      case 'owner':
        return [
          {
            'title': 'Total Revenue',
            'value': 'AED 45,230',
            'icon': Icons.attach_money,
            'color': UltraModernTheme.successColor,
            'trend': '+12%',
          },
          {
            'title': 'Active Members',
            'value': '1,234',
            'icon': Icons.people,
            'color': UltraModernTheme.primaryColor,
            'trend': '+8%',
          },
          {
            'title': 'Classes Today',
            'value': '24',
            'icon': Icons.fitness_center,
            'color': UltraModernTheme.accentColor,
          },
          {
            'title': 'Staff Online',
            'value': '12',
            'icon': Icons.badge,
            'color': UltraModernTheme.warningColor,
          },
        ];
      case 'staff':
        return [
          {
            'title': 'Check-ins Today',
            'value': '89',
            'icon': Icons.login,
            'color': UltraModernTheme.primaryColor,
          },
          {
            'title': 'My Classes',
            'value': '6',
            'icon': Icons.schedule,
            'color': UltraModernTheme.accentColor,
          },
        ];
      default: // member
        return [
          {
            'title': 'Workouts This Week',
            'value': '4',
            'icon': Icons.fitness_center,
            'color': UltraModernTheme.primaryColor,
          },
          {
            'title': 'Calories Burned',
            'value': '2,340',
            'icon': Icons.local_fire_department,
            'color': UltraModernTheme.errorColor,
          },
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
      default: // member
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