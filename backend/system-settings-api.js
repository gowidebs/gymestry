const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
let users = [
    {
        id: 1,
        username: "admin",
        email: "admin@gym.com",
        role: "admin",
        permissions: ["all"],
        status: "active",
        lastLogin: "2024-12-20T10:30:00Z",
        createdAt: "2023-01-15T00:00:00Z",
        twoFactorEnabled: true
    },
    {
        id: 2,
        username: "receptionist1",
        email: "reception@gym.com",
        role: "receptionist",
        permissions: ["member_checkin", "new_registration", "payment_processing"],
        status: "active",
        lastLogin: "2024-12-20T08:15:00Z",
        createdAt: "2023-03-20T00:00:00Z",
        twoFactorEnabled: false
    }
];

let securitySettings = {
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
    },
    sessionSettings: {
        timeoutMinutes: 30,
        maxConcurrentSessions: 3,
        requireTwoFactor: false
    },
    accessControl: {
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 15,
        ipWhitelist: ["192.168.1.0/24"],
        allowedCountries: ["AE", "US", "GB"]
    }
};

let backupSettings = {
    autoBackup: true,
    frequency: "daily",
    retentionDays: 30,
    backupLocation: "/backups/gymestry",
    lastBackup: "2024-12-20T02:00:00Z",
    backupSize: "2.4 GB",
    status: "completed"
};

let integrationSettings = {
    paymentGateway: {
        provider: "Stripe",
        enabled: true,
        testMode: false,
        webhookUrl: "https://api.gymestry.com/webhooks/stripe"
    },
    emailService: {
        provider: "SendGrid",
        enabled: true,
        apiKey: "sg-****-****",
        fromEmail: "noreply@gymestry.com"
    },
    smsService: {
        provider: "Twilio",
        enabled: true,
        accountSid: "AC****",
        fromNumber: "+971501234567"
    },
    analytics: {
        googleAnalytics: true,
        trackingId: "GA-****-****",
        facebookPixel: false
    }
};

let auditLogs = [
    {
        id: 1,
        timestamp: "2024-12-20T10:30:00Z",
        userId: 1,
        username: "admin",
        action: "USER_LOGIN",
        resource: "system",
        details: "Successful login from IP 192.168.1.100",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        severity: "info"
    },
    {
        id: 2,
        timestamp: "2024-12-20T09:45:00Z",
        userId: 1,
        username: "admin",
        action: "PERMISSION_CHANGE",
        resource: "user_management",
        details: "Updated permissions for user receptionist1",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        severity: "warning"
    },
    {
        id: 3,
        timestamp: "2024-12-20T02:00:00Z",
        userId: 0,
        username: "system",
        action: "BACKUP_COMPLETED",
        resource: "database",
        details: "Daily backup completed successfully (2.4 GB)",
        ipAddress: "127.0.0.1",
        userAgent: "System Process",
        severity: "info"
    }
];

// User Management
app.get('/api/users', (req, res) => {
    const { role, status } = req.query;
    let filteredUsers = users;
    
    if (role) filteredUsers = filteredUsers.filter(u => u.role === role);
    if (status) filteredUsers = filteredUsers.filter(u => u.status === status);
    
    res.json(filteredUsers);
});

app.post('/api/users', (req, res) => {
    const newUser = {
        id: users.length + 1,
        ...req.body,
        status: 'active',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: false
    };
    users.push(newUser);
    
    // Add audit log
    auditLogs.unshift({
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        userId: 1,
        username: "admin",
        action: "USER_CREATED",
        resource: "user_management",
        details: `Created new user: ${newUser.username}`,
        ipAddress: "192.168.1.100",
        userAgent: "System",
        severity: "info"
    });
    
    res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id == req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    users[userIndex] = { ...users[userIndex], ...req.body };
    
    // Add audit log
    auditLogs.unshift({
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        userId: 1,
        username: "admin",
        action: "USER_UPDATED",
        resource: "user_management",
        details: `Updated user: ${users[userIndex].username}`,
        ipAddress: "192.168.1.100",
        userAgent: "System",
        severity: "info"
    });
    
    res.json(users[userIndex]);
});

// Security Settings
app.get('/api/security-settings', (req, res) => {
    res.json(securitySettings);
});

app.put('/api/security-settings', (req, res) => {
    securitySettings = { ...securitySettings, ...req.body };
    
    // Add audit log
    auditLogs.unshift({
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        userId: 1,
        username: "admin",
        action: "SECURITY_SETTINGS_UPDATED",
        resource: "system_settings",
        details: "Security settings modified",
        ipAddress: "192.168.1.100",
        userAgent: "System",
        severity: "warning"
    });
    
    res.json(securitySettings);
});

// Backup Management
app.get('/api/backup-settings', (req, res) => {
    res.json(backupSettings);
});

app.put('/api/backup-settings', (req, res) => {
    backupSettings = { ...backupSettings, ...req.body };
    
    // Add audit log
    auditLogs.unshift({
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        userId: 1,
        username: "admin",
        action: "BACKUP_SETTINGS_UPDATED",
        resource: "system_settings",
        details: "Backup settings modified",
        ipAddress: "192.168.1.100",
        userAgent: "System",
        severity: "info"
    });
    
    res.json(backupSettings);
});

app.post('/api/backup/create', (req, res) => {
    backupSettings.lastBackup = new Date().toISOString();
    backupSettings.status = "in-progress";
    
    // Simulate backup process
    setTimeout(() => {
        backupSettings.status = "completed";
        backupSettings.backupSize = "2.6 GB";
        
        // Add audit log
        auditLogs.unshift({
            id: auditLogs.length + 1,
            timestamp: new Date().toISOString(),
            userId: 1,
            username: "admin",
            action: "MANUAL_BACKUP_CREATED",
            resource: "database",
            details: "Manual backup initiated and completed",
            ipAddress: "192.168.1.100",
            userAgent: "System",
            severity: "info"
        });
    }, 2000);
    
    res.json({ message: "Backup initiated", status: "in-progress" });
});

// Integration Settings
app.get('/api/integration-settings', (req, res) => {
    res.json(integrationSettings);
});

app.put('/api/integration-settings', (req, res) => {
    integrationSettings = { ...integrationSettings, ...req.body };
    
    // Add audit log
    auditLogs.unshift({
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        userId: 1,
        username: "admin",
        action: "INTEGRATION_SETTINGS_UPDATED",
        resource: "system_settings",
        details: "Integration settings modified",
        ipAddress: "192.168.1.100",
        userAgent: "System",
        severity: "info"
    });
    
    res.json(integrationSettings);
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
    const { action, severity, startDate, endDate } = req.query;
    let filteredLogs = auditLogs;
    
    if (action) filteredLogs = filteredLogs.filter(log => log.action === action);
    if (severity) filteredLogs = filteredLogs.filter(log => log.severity === severity);
    if (startDate) filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    if (endDate) filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    
    res.json(filteredLogs);
});

// System Statistics
app.get('/api/system/stats', (req, res) => {
    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        lastBackup: backupSettings.lastBackup,
        backupStatus: backupSettings.status,
        totalAuditLogs: auditLogs.length,
        criticalAlerts: auditLogs.filter(log => log.severity === 'critical').length,
        systemUptime: "99.9%",
        storageUsed: "45.2 GB"
    };
    
    res.json(stats);
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
    console.log(`System Settings API running on port ${PORT}`);
});