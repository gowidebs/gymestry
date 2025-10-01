# Class Scheduling System Documentation

## Overview
The Class Scheduling System is a comprehensive smart class management solution for Gymestry that handles class scheduling, instructor assignments, capacity management, booking system, waitlist handling, and attendance tracking.

## Features

### 1. Class Schedule Management
- **Create Classes**: Add new fitness classes with instructor, time, capacity, room, and pricing
- **Edit Classes**: Modify existing class details and schedules
- **Cancel Classes**: Remove classes with automatic member notifications
- **Capacity Management**: Track bookings vs. capacity with real-time updates
- **Room Assignment**: Assign classes to specific gym rooms/areas

### 2. Booking System
- **Member Bookings**: Allow members to book classes online or at reception
- **Booking Confirmation**: Instant confirmation for available spots
- **Automatic Waitlist**: Seamless transition to waitlist when class is full
- **Booking Cancellation**: Easy cancellation with automatic waitlist processing
- **Payment Integration**: Link bookings to member payment systems

### 3. Waitlist Management
- **Automatic Waitlist**: Members automatically added when class is full
- **Priority Queue**: First-come, first-served waitlist processing
- **Automatic Confirmation**: Move waitlisted members to confirmed when spots open
- **Notifications**: SMS/Email alerts for waitlist status changes
- **Waitlist Analytics**: Track waitlist patterns and demand

### 4. Attendance Tracking
- **Digital Check-in**: QR code or manual attendance marking
- **Real-time Tracking**: Live attendance rates and no-show tracking
- **Attendance Reports**: Detailed analytics on class attendance patterns
- **Member History**: Individual attendance tracking for each member
- **Instructor Performance**: Track instructor attendance rates

### 5. Instructor Scheduling
- **Instructor Assignment**: Assign qualified instructors to classes
- **Schedule Management**: View and manage instructor weekly schedules
- **Utilization Tracking**: Monitor instructor workload and efficiency
- **Performance Metrics**: Track instructor ratings and class success
- **Availability Management**: Handle instructor time-off and substitutions

## API Endpoints

### Classes Management
- `GET /api/classes` - Get all classes with optional filters
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class details
- `DELETE /api/classes/:id` - Delete class

### Booking Management
- `POST /api/classes/:id/book` - Book a class
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/classes/:id/bookings` - Get class bookings

### Attendance Tracking
- `POST /api/classes/:id/attendance` - Mark attendance
- `GET /api/classes/:id/attendance` - Get class attendance

### Instructor Management
- `GET /api/instructors/:id/schedule` - Get instructor schedule

## Technical Implementation

### Backend (Node.js/Express)
```javascript
// Class Scheduling API running on port 3006
const express = require('express');
const cors = require('cors');

// Mock data structures for classes, bookings, and attendance
let classes = [...];
let bookings = [...];
let attendance = [...];
```

### Frontend Integration
- **Dashboard Integration**: Accessible from Admin dashboard
- **Real-time Updates**: Live capacity and booking status
- **Mobile Responsive**: Works on all devices
- **Interactive UI**: Drag-and-drop scheduling interface

### Data Models

#### Class Model
```javascript
{
  id: 1,
  name: "Morning Yoga",
  instructor: "Sarah Johnson",
  instructorId: 1,
  date: "2024-01-15",
  time: "07:00",
  duration: 60,
  capacity: 20,
  booked: 15,
  waitlist: 3,
  room: "Studio A",
  price: 50,
  status: "active"
}
```

#### Booking Model
```javascript
{
  id: 1,
  classId: 1,
  memberId: 101,
  memberName: "Ahmed Al-Rashid",
  status: "confirmed", // confirmed, waitlist
  bookedAt: "2024-01-10T10:00:00Z"
}
```

#### Attendance Model
```javascript
{
  id: 1,
  classId: 1,
  memberId: 101,
  memberName: "Ahmed Al-Rashid",
  status: "present", // present, absent
  checkedInAt: "2024-01-15T06:55:00Z"
}
```

## User Interface

### Class Overview
- **Grid Layout**: Visual class cards with key information
- **Status Indicators**: Active, Full, Cancelled class statuses
- **Quick Actions**: Edit, View Bookings, Cancel buttons
- **Capacity Visualization**: Progress bars showing booking levels

### Booking Management
- **Table View**: Comprehensive booking list with member details
- **Status Tracking**: Confirmed, Waitlist, Cancelled statuses
- **Quick Actions**: Cancel bookings, move from waitlist
- **Search & Filter**: Find bookings by member, class, or date

### Waitlist Management
- **Priority Queue**: Ordered list of waitlisted members
- **One-click Confirmation**: Move members from waitlist to confirmed
- **Automatic Processing**: Batch process waitlist when spots open
- **Notification System**: Alert members of status changes

### Attendance Tracking
- **Digital Check-in**: QR code scanning for quick attendance
- **Visual Indicators**: Present/Absent status with color coding
- **Attendance Rates**: Real-time calculation of attendance percentages
- **Export Reports**: Generate attendance reports for analysis

### Instructor Scheduling
- **Calendar View**: Weekly schedule overview for each instructor
- **Workload Tracking**: Monitor instructor utilization rates
- **Performance Metrics**: Track ratings and class success rates
- **Schedule Conflicts**: Automatic detection and resolution

## Business Benefits

### Operational Efficiency
- **Automated Processes**: Reduce manual booking and scheduling tasks
- **Real-time Updates**: Instant capacity and availability information
- **Streamlined Workflow**: Integrated booking, payment, and attendance
- **Resource Optimization**: Maximize class utilization and instructor efficiency

### Member Experience
- **Easy Booking**: Simple online booking system
- **Waitlist Management**: Fair and transparent waitlist system
- **Instant Notifications**: Real-time updates on booking status
- **Flexible Cancellation**: Easy cancellation with automatic waitlist processing

### Revenue Optimization
- **Capacity Management**: Maximize class attendance and revenue
- **Demand Analytics**: Identify popular classes and optimal scheduling
- **Pricing Flexibility**: Dynamic pricing based on demand and capacity
- **No-show Tracking**: Identify patterns and implement policies

### Data Analytics
- **Attendance Patterns**: Identify peak times and popular classes
- **Member Behavior**: Track booking and attendance trends
- **Instructor Performance**: Monitor class success and member satisfaction
- **Revenue Analysis**: Track class-based revenue and profitability

## Integration Points

### Member Management System
- **Member Profiles**: Link bookings to member accounts
- **Payment History**: Track class payments and outstanding balances
- **Membership Status**: Verify active membership for bookings
- **Communication**: Send booking confirmations and reminders

### Financial System
- **Revenue Tracking**: Track class-based revenue
- **Payment Processing**: Handle class fees and cancellation refunds
- **Instructor Payments**: Calculate instructor compensation
- **Financial Reporting**: Include class revenue in financial reports

### Staff Management
- **Instructor Scheduling**: Coordinate with staff schedules
- **Performance Tracking**: Monitor instructor effectiveness
- **Payroll Integration**: Calculate class-based compensation
- **Training Records**: Track instructor certifications and training

## Security & Compliance

### Data Protection
- **Member Privacy**: Secure handling of member booking data
- **Payment Security**: PCI compliance for payment processing
- **Access Control**: Role-based access to scheduling functions
- **Audit Trail**: Complete logging of all booking and scheduling changes

### Business Compliance
- **Capacity Limits**: Enforce safety and regulatory capacity limits
- **Cancellation Policies**: Implement and enforce cancellation rules
- **Refund Processing**: Handle refunds according to gym policies
- **Insurance Compliance**: Maintain records for insurance requirements

## Future Enhancements

### Advanced Features
- **AI-Powered Scheduling**: Optimize class schedules based on demand patterns
- **Dynamic Pricing**: Adjust prices based on demand and capacity
- **Predictive Analytics**: Forecast class demand and member behavior
- **Mobile App Integration**: Native mobile app for bookings and check-ins

### Integration Expansions
- **Wearable Device Integration**: Sync with fitness trackers for attendance
- **Social Media Integration**: Share class achievements and schedules
- **Third-party Fitness Apps**: Connect with popular fitness applications
- **Equipment Integration**: Link classes to specific equipment usage

This Class Scheduling System provides a comprehensive solution for managing all aspects of fitness class operations, from initial scheduling to final attendance tracking, ensuring optimal member experience and operational efficiency.