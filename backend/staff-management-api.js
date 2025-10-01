const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Sample staff data
let staffData = {
  employees: [
    {
      id: 1,
      name: "Ahmed Al-Rashid",
      role: "Senior Trainer",
      email: "ahmed@gym.com",
      phone: "+971-50-123-4567",
      salary: 4500,
      hireDate: "2023-01-15",
      department: "Training",
      status: "Active",
      permissions: ["client_management", "workout_plans", "progress_tracking"],
      performance: {
        clientSatisfaction: 95,
        punctuality: 88,
        salesTarget: 120,
        rating: 4.9
      },
      attendance: {
        present: 22,
        absent: 1,
        late: 2,
        overtime: 8
      }
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Receptionist",
      email: "sarah@gym.com",
      phone: "+971-50-234-5678",
      salary: 3200,
      hireDate: "2023-03-20",
      department: "Front Desk",
      status: "Active",
      permissions: ["member_checkin", "registration", "payment_processing"],
      performance: {
        customerService: 92,
        efficiency: 85,
        accuracy: 94,
        rating: 4.6
      },
      attendance: {
        present: 23,
        absent: 0,
        late: 1,
        overtime: 4
      }
    },
    {
      id: 3,
      name: "Mike Chen",
      role: "Fitness Trainer",
      email: "mike@gym.com",
      phone: "+971-50-345-6789",
      salary: 4000,
      hireDate: "2023-02-10",
      department: "Training",
      status: "Active",
      permissions: ["client_management", "workout_plans"],
      performance: {
        clientSatisfaction: 89,
        punctuality: 92,
        salesTarget: 105,
        rating: 4.7
      },
      attendance: {
        present: 20,
        absent: 3,
        late: 1,
        overtime: 6
      }
    }
  ],
  schedules: [
    {
      id: 1,
      shift: "Morning Shift",
      startTime: "06:00",
      endTime: "14:00",
      employees: [1, 2, 3],
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    {
      id: 2,
      shift: "Evening Shift",
      startTime: "14:00",
      endTime: "22:00",
      employees: [4, 5, 6],
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
  ],
  payroll: {
    totalMonthlyPayroll: 45600,
    averageSalary: 3800,
    benefitsAndBonuses: 6840,
    taxDeductions: 4560,
    netPayroll: 41040
  },
  attendance: {
    totalWorkingDays: 25,
    averageAttendance: 92,
    totalAbsences: 12,
    totalLateArrivals: 8
  }
};

// Employee Management Endpoints
app.get('/api/staff/employees', (req, res) => {
  res.json({
    success: true,
    data: staffData.employees,
    total: staffData.employees.length
  });
});

app.get('/api/staff/employees/:id', (req, res) => {
  const employee = staffData.employees.find(emp => emp.id === parseInt(req.params.id));
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  res.json({ success: true, data: employee });
});

app.post('/api/staff/employees', (req, res) => {
  const newEmployee = {
    id: staffData.employees.length + 1,
    ...req.body,
    hireDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    performance: {
      clientSatisfaction: 0,
      punctuality: 0,
      salesTarget: 0,
      rating: 0
    },
    attendance: {
      present: 0,
      absent: 0,
      late: 0,
      overtime: 0
    }
  };
  
  staffData.employees.push(newEmployee);
  res.json({ success: true, data: newEmployee, message: 'Employee added successfully' });
});

app.put('/api/staff/employees/:id', (req, res) => {
  const employeeIndex = staffData.employees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  staffData.employees[employeeIndex] = { ...staffData.employees[employeeIndex], ...req.body };
  res.json({ success: true, data: staffData.employees[employeeIndex], message: 'Employee updated successfully' });
});

app.delete('/api/staff/employees/:id', (req, res) => {
  const employeeIndex = staffData.employees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  staffData.employees.splice(employeeIndex, 1);
  res.json({ success: true, message: 'Employee deleted successfully' });
});

// Schedule Management Endpoints
app.get('/api/staff/schedules', (req, res) => {
  const schedulesWithEmployeeNames = staffData.schedules.map(schedule => ({
    ...schedule,
    employeeDetails: schedule.employees.map(empId => {
      const employee = staffData.employees.find(emp => emp.id === empId);
      return employee ? { id: employee.id, name: employee.name, role: employee.role } : null;
    }).filter(emp => emp !== null)
  }));
  
  res.json({ success: true, data: schedulesWithEmployeeNames });
});

app.post('/api/staff/schedules', (req, res) => {
  const newSchedule = {
    id: staffData.schedules.length + 1,
    ...req.body
  };
  
  staffData.schedules.push(newSchedule);
  res.json({ success: true, data: newSchedule, message: 'Schedule created successfully' });
});

app.put('/api/staff/schedules/:id', (req, res) => {
  const scheduleIndex = staffData.schedules.findIndex(sch => sch.id === parseInt(req.params.id));
  if (scheduleIndex === -1) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }
  
  staffData.schedules[scheduleIndex] = { ...staffData.schedules[scheduleIndex], ...req.body };
  res.json({ success: true, data: staffData.schedules[scheduleIndex], message: 'Schedule updated successfully' });
});

// Payroll Management Endpoints
app.get('/api/staff/payroll', (req, res) => {
  const payrollDetails = staffData.employees.map(employee => ({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    baseSalary: employee.salary,
    overtime: Math.floor(Math.random() * 500) + 100,
    bonuses: Math.floor(Math.random() * 300) + 50,
    deductions: Math.floor(employee.salary * 0.05),
    total: employee.salary + Math.floor(Math.random() * 500) + 100 + Math.floor(Math.random() * 300) + 50 - Math.floor(employee.salary * 0.05)
  }));
  
  res.json({
    success: true,
    data: {
      summary: staffData.payroll,
      employees: payrollDetails,
      generatedAt: new Date().toISOString()
    }
  });
});

app.post('/api/staff/payroll/generate', (req, res) => {
  const { month, year } = req.body;
  
  // Simulate payroll generation
  const payrollReport = {
    month,
    year,
    totalEmployees: staffData.employees.length,
    totalPayroll: staffData.payroll.totalMonthlyPayroll,
    status: 'Generated',
    generatedAt: new Date().toISOString(),
    employees: staffData.employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      baseSalary: emp.salary,
      overtime: emp.attendance.overtime * 50,
      bonuses: Math.floor(Math.random() * 500),
      total: emp.salary + (emp.attendance.overtime * 50) + Math.floor(Math.random() * 500)
    }))
  };
  
  res.json({ success: true, data: payrollReport, message: 'Payroll generated successfully' });
});

// Performance Tracking Endpoints
app.get('/api/staff/performance', (req, res) => {
  const performanceData = staffData.employees.map(employee => ({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    department: employee.department,
    performance: employee.performance,
    lastReviewDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
  
  res.json({ success: true, data: performanceData });
});

app.put('/api/staff/performance/:id', (req, res) => {
  const employeeIndex = staffData.employees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  staffData.employees[employeeIndex].performance = { ...staffData.employees[employeeIndex].performance, ...req.body };
  res.json({ success: true, data: staffData.employees[employeeIndex].performance, message: 'Performance updated successfully' });
});

// Attendance Management Endpoints
app.get('/api/staff/attendance', (req, res) => {
  const attendanceData = staffData.employees.map(employee => ({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    attendance: employee.attendance,
    attendanceRate: Math.round((employee.attendance.present / (employee.attendance.present + employee.attendance.absent)) * 100),
    lastCheckIn: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    status: employee.attendance.present > employee.attendance.absent ? 'Present' : 'Absent'
  }));
  
  res.json({ success: true, data: attendanceData });
});

app.post('/api/staff/attendance/checkin', (req, res) => {
  const { employeeId, checkInTime } = req.body;
  
  const employeeIndex = staffData.employees.findIndex(emp => emp.id === parseInt(employeeId));
  if (employeeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  // Update attendance
  staffData.employees[employeeIndex].attendance.present += 1;
  
  res.json({ 
    success: true, 
    message: 'Check-in recorded successfully',
    data: {
      employeeId,
      checkInTime,
      status: 'Checked In'
    }
  });
});

app.post('/api/staff/attendance/checkout', (req, res) => {
  const { employeeId, checkOutTime } = req.body;
  
  const employeeIndex = staffData.employees.findIndex(emp => emp.id === parseInt(employeeId));
  if (employeeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  res.json({ 
    success: true, 
    message: 'Check-out recorded successfully',
    data: {
      employeeId,
      checkOutTime,
      status: 'Checked Out'
    }
  });
});

// Role-Based Permissions Endpoints
app.get('/api/staff/permissions', (req, res) => {
  const roles = {
    'Gym Owner': {
      permissions: ['full_system_access', 'financial_reports', 'staff_management', 'system_settings'],
      description: 'Complete administrative control'
    },
    'Admin Manager': {
      permissions: ['member_management', 'class_scheduling', 'equipment_management', 'staff_view'],
      description: 'Operational management access'
    },
    'Receptionist': {
      permissions: ['member_checkin', 'registration', 'payment_processing', 'customer_support'],
      description: 'Front desk operations'
    },
    'Personal Trainer': {
      permissions: ['client_management', 'workout_plans', 'progress_tracking', 'session_booking'],
      description: 'Training and client management'
    }
  };
  
  res.json({ success: true, data: roles });
});

app.put('/api/staff/permissions/:id', (req, res) => {
  const { permissions } = req.body;
  const employeeIndex = staffData.employees.findIndex(emp => emp.id === parseInt(req.params.id));
  
  if (employeeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  staffData.employees[employeeIndex].permissions = permissions;
  res.json({ success: true, message: 'Permissions updated successfully' });
});

// Analytics and Reports Endpoints
app.get('/api/staff/analytics', (req, res) => {
  const analytics = {
    totalStaff: staffData.employees.length,
    departmentBreakdown: {
      Training: staffData.employees.filter(emp => emp.department === 'Training').length,
      'Front Desk': staffData.employees.filter(emp => emp.department === 'Front Desk').length,
      Management: staffData.employees.filter(emp => emp.department === 'Management').length,
      Support: staffData.employees.filter(emp => emp.department === 'Support').length
    },
    averagePerformance: {
      overall: Math.round(staffData.employees.reduce((acc, emp) => acc + (emp.performance.rating || 0), 0) / staffData.employees.length * 10) / 10,
      punctuality: Math.round(staffData.employees.reduce((acc, emp) => acc + (emp.performance.punctuality || 0), 0) / staffData.employees.length),
      satisfaction: Math.round(staffData.employees.reduce((acc, emp) => acc + (emp.performance.clientSatisfaction || emp.performance.customerService || 0), 0) / staffData.employees.length)
    },
    attendanceStats: {
      averageAttendance: staffData.attendance.averageAttendance,
      totalAbsences: staffData.attendance.totalAbsences,
      punctualityRate: Math.round(((staffData.attendance.totalWorkingDays * staffData.employees.length - staffData.attendance.totalLateArrivals) / (staffData.attendance.totalWorkingDays * staffData.employees.length)) * 100)
    },
    payrollStats: staffData.payroll
  };
  
  res.json({ success: true, data: analytics });
});

app.get('/api/staff/reports/export', (req, res) => {
  const { type, format } = req.query;
  
  // Simulate report generation
  const reports = {
    performance: 'Staff_Performance_Report.pdf',
    attendance: 'Attendance_Summary.xlsx',
    payroll: 'Payroll_Details.pdf',
    schedule: 'Schedule_Overview.pdf'
  };
  
  res.json({
    success: true,
    message: 'Report generated successfully',
    data: {
      filename: reports[type] || 'Staff_Report.pdf',
      downloadUrl: `/downloads/${reports[type]}`,
      generatedAt: new Date().toISOString()
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏋️ Staff Management API running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/staff/employees - Get all employees`);
  console.log(`   POST /api/staff/employees - Add new employee`);
  console.log(`   GET  /api/staff/schedules - Get staff schedules`);
  console.log(`   GET  /api/staff/payroll - Get payroll data`);
  console.log(`   GET  /api/staff/performance - Get performance metrics`);
  console.log(`   GET  /api/staff/attendance - Get attendance data`);
  console.log(`   GET  /api/staff/permissions - Get role permissions`);
  console.log(`   GET  /api/staff/analytics - Get staff analytics`);
});

module.exports = app;