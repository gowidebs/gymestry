# 👨‍💼 Staff Management System - Gymestry

## Overview
Complete staff management solution for gym operations with employee profiles, scheduling, payroll management, performance tracking, attendance monitoring, and role-based permissions.

## 🚀 Features

### 1. Employee Profiles & Management
- **Employee Database**: Complete staff profiles with personal and professional information
- **Role Management**: Trainers, Receptionists, Managers, Support Staff
- **Contact Information**: Phone, email, emergency contacts
- **Employment Details**: Hire date, salary, department, status
- **Document Management**: ID copies, certifications, contracts

### 2. Staff Scheduling System
- **Shift Management**: Morning, Evening, Night shifts
- **Employee Assignment**: Assign staff to specific shifts and days
- **Schedule Templates**: Recurring weekly/monthly schedules
- **Shift Swapping**: Allow employees to swap shifts with approval
- **Overtime Tracking**: Monitor and calculate overtime hours

### 3. Payroll Management
- **Salary Calculation**: Base salary + overtime + bonuses - deductions
- **Automated Payroll**: Monthly payroll generation with tax calculations
- **Payment Processing**: Direct deposit integration
- **Payslip Generation**: Digital payslips with detailed breakdown
- **Tax Compliance**: UAE VAT and labor law compliance
- **Bonus System**: Performance-based bonuses and incentives

### 4. Performance Tracking
- **KPI Monitoring**: Track key performance indicators by role
- **Client Satisfaction**: Customer feedback and ratings
- **Sales Targets**: Revenue generation tracking for trainers
- **Punctuality**: Attendance and timeliness metrics
- **Goal Setting**: Individual and team performance goals
- **Review Cycles**: Regular performance reviews and feedback

### 5. Attendance Monitoring
- **Digital Check-in/Out**: QR code or biometric attendance
- **Real-time Tracking**: Live attendance status dashboard
- **Absence Management**: Leave requests and approval workflow
- **Late Arrival Tracking**: Monitor punctuality patterns
- **Overtime Calculation**: Automatic overtime hour calculation
- **Attendance Reports**: Daily, weekly, monthly attendance summaries

### 6. Role-Based Permissions
- **Access Control**: Granular permissions by role and individual
- **Security Levels**: Different access levels for sensitive data
- **Feature Restrictions**: Limit access to specific system features
- **Audit Trail**: Track user actions and system access
- **Permission Templates**: Pre-defined role-based permission sets

## 📊 Dashboard Features

### Owner Dashboard
- Total staff count and department breakdown
- Monthly payroll summary and costs
- Staff performance overview
- Attendance rates and trends
- Revenue per employee metrics

### Admin Dashboard
- Employee management and scheduling
- Performance monitoring and reviews
- Attendance tracking and reports
- System configuration and settings

### HR Dashboard
- Recruitment and onboarding
- Employee records management
- Payroll processing and reports
- Compliance and documentation

## 🔧 Technical Implementation

### Frontend Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live attendance and schedule updates
- **Interactive Charts**: Performance and attendance visualizations
- **Export Functions**: PDF and Excel report generation
- **Search & Filter**: Advanced employee search and filtering

### Backend API Endpoints

#### Employee Management
```
GET    /api/staff/employees          - Get all employees
GET    /api/staff/employees/:id      - Get specific employee
POST   /api/staff/employees          - Add new employee
PUT    /api/staff/employees/:id      - Update employee
DELETE /api/staff/employees/:id      - Delete employee
```

#### Schedule Management
```
GET    /api/staff/schedules          - Get all schedules
POST   /api/staff/schedules          - Create new schedule
PUT    /api/staff/schedules/:id      - Update schedule
DELETE /api/staff/schedules/:id      - Delete schedule
```

#### Payroll Management
```
GET    /api/staff/payroll            - Get payroll data
POST   /api/staff/payroll/generate   - Generate monthly payroll
GET    /api/staff/payroll/:id        - Get employee payroll
PUT    /api/staff/payroll/:id        - Update payroll details
```

#### Performance Tracking
```
GET    /api/staff/performance        - Get all performance data
GET    /api/staff/performance/:id    - Get employee performance
PUT    /api/staff/performance/:id    - Update performance metrics
POST   /api/staff/performance/review - Create performance review
```

#### Attendance Management
```
GET    /api/staff/attendance         - Get attendance data
POST   /api/staff/attendance/checkin - Record check-in
POST   /api/staff/attendance/checkout- Record check-out
GET    /api/staff/attendance/:id     - Get employee attendance
```

#### Permissions & Roles
```
GET    /api/staff/permissions        - Get role permissions
PUT    /api/staff/permissions/:id    - Update user permissions
GET    /api/staff/roles              - Get all roles
POST   /api/staff/roles              - Create new role
```

## 💼 Staff Roles & Permissions

### 🏆 Gym Owner
- **Full System Access**: Complete control over all features
- **Financial Reports**: Revenue, expenses, payroll summaries
- **Staff Management**: Hire, fire, promote, salary adjustments
- **Business Analytics**: Performance metrics and growth insights

### 🔧 Admin Manager
- **Operational Management**: Day-to-day gym operations
- **Staff Scheduling**: Create and manage work schedules
- **Performance Reviews**: Conduct employee evaluations
- **System Configuration**: Manage gym settings and policies

### 🏪 Receptionist
- **Front Desk Operations**: Member check-in and customer service
- **Basic Staff Info**: View colleague contact information
- **Schedule Viewing**: Check work schedules and shifts
- **Attendance Recording**: Clock in/out for self

### 💪 Personal Trainer
- **Client Management**: Manage assigned clients
- **Schedule Access**: View personal schedule and availability
- **Performance Tracking**: Track personal KPIs and goals
- **Attendance**: Self check-in/out and time tracking

## 📈 Analytics & Reporting

### Staff Analytics
- **Headcount Trends**: Hiring and turnover rates
- **Department Distribution**: Staff allocation by department
- **Performance Metrics**: Average ratings and KPIs
- **Cost Analysis**: Payroll costs and ROI per employee

### Attendance Reports
- **Daily Attendance**: Real-time attendance dashboard
- **Monthly Summaries**: Attendance patterns and trends
- **Absence Analysis**: Sick leave and vacation tracking
- **Punctuality Reports**: Late arrival and early departure tracking

### Performance Reports
- **Individual Reviews**: Employee performance summaries
- **Team Performance**: Department and team metrics
- **Goal Tracking**: Progress toward performance targets
- **Training Needs**: Skill gaps and development opportunities

### Payroll Reports
- **Monthly Payroll**: Complete payroll breakdown
- **Tax Reports**: Tax deductions and compliance
- **Overtime Analysis**: Overtime costs and patterns
- **Bonus Distribution**: Performance bonus allocations

## 🛠️ Setup Instructions

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Access
1. Open `docs/index.html` in web browser
2. Login with Owner credentials: `owner@gym.com` / `admin123`
3. Click "Staff Management" to access the system

### API Testing
```bash
# Test employee endpoint
curl http://localhost:3001/api/staff/employees

# Test payroll endpoint
curl http://localhost:3001/api/staff/payroll

# Test attendance endpoint
curl http://localhost:3001/api/staff/attendance
```

## 🔐 Security Features

### Data Protection
- **Encrypted Storage**: Sensitive data encryption
- **Access Logging**: Track all system access and changes
- **Role-based Security**: Granular permission controls
- **Session Management**: Secure user sessions and timeouts

### Compliance
- **UAE Labor Law**: Compliance with local employment regulations
- **Data Privacy**: GDPR-compliant data handling
- **Financial Regulations**: Payroll and tax compliance
- **Audit Trail**: Complete activity logging for compliance

## 📱 Mobile Compatibility

### Responsive Design
- **Mobile-First**: Optimized for smartphone access
- **Touch-Friendly**: Large buttons and easy navigation
- **Offline Capability**: Basic functions work offline
- **Push Notifications**: Attendance reminders and alerts

### Mobile Features
- **QR Code Scanning**: Quick employee check-in
- **Photo Upload**: Profile pictures and document scanning
- **GPS Tracking**: Location-based attendance verification
- **Biometric Integration**: Fingerprint and face recognition

## 🚀 Future Enhancements

### Advanced Features
- **AI Performance Prediction**: Predict employee performance trends
- **Automated Scheduling**: AI-powered optimal shift scheduling
- **Integration APIs**: Connect with external HR and payroll systems
- **Advanced Analytics**: Machine learning insights and recommendations

### Expansion Capabilities
- **Multi-Location Support**: Manage staff across multiple gym locations
- **Franchise Management**: White-label solution for gym franchises
- **Third-party Integrations**: Connect with popular HR and accounting software
- **Advanced Reporting**: Custom report builder and dashboard creator

## 📞 Support & Documentation

### Technical Support
- **API Documentation**: Complete endpoint documentation
- **User Guides**: Step-by-step user manuals
- **Video Tutorials**: Training videos for all features
- **24/7 Support**: Technical support and troubleshooting

### Training Resources
- **Admin Training**: Complete system administration training
- **User Training**: Role-specific training programs
- **Best Practices**: Industry best practices and recommendations
- **Regular Updates**: Feature updates and system improvements

---

**Gymestry Staff Management System** - Complete solution for modern gym staff management with advanced features, security, and scalability.