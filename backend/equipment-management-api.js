const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
let equipment = [
    {
        id: 1,
        name: "Treadmill Pro X1",
        category: "Cardio",
        brand: "TechnoGym",
        model: "Run Now 700",
        serialNumber: "TG-2024-001",
        purchaseDate: "2023-01-15",
        purchasePrice: 15000,
        warrantyExpiry: "2026-01-15",
        status: "active",
        location: "Cardio Zone A",
        usageHours: 2847,
        maxUsageHours: 10000,
        lastMaintenance: "2024-11-15",
        nextMaintenance: "2025-02-15",
        maintenanceCost: 450,
        repairHistory: 2,
        condition: "good"
    },
    {
        id: 2,
        name: "Bench Press Station",
        category: "Strength",
        brand: "Hammer Strength",
        model: "Olympic Bench",
        serialNumber: "HS-2023-045",
        purchaseDate: "2023-03-20",
        purchasePrice: 2800,
        warrantyExpiry: "2025-03-20",
        status: "maintenance",
        location: "Free Weights Area",
        usageHours: 1654,
        maxUsageHours: 15000,
        lastMaintenance: "2024-12-01",
        nextMaintenance: "2024-12-20",
        maintenanceCost: 180,
        repairHistory: 1,
        condition: "fair"
    }
];

let maintenanceSchedule = [
    {
        id: 1,
        equipmentId: 1,
        equipmentName: "Treadmill Pro X1",
        type: "routine",
        scheduledDate: "2025-02-15",
        description: "Belt replacement and motor service",
        estimatedCost: 450,
        assignedTechnician: "Ahmed Al-Rashid",
        status: "scheduled",
        priority: "medium"
    },
    {
        id: 2,
        equipmentId: 2,
        equipmentName: "Bench Press Station",
        type: "repair",
        scheduledDate: "2024-12-20",
        description: "Replace worn padding and adjust mechanism",
        estimatedCost: 180,
        assignedTechnician: "Mike Wilson",
        status: "in-progress",
        priority: "high"
    }
];

let repairHistory = [
    {
        id: 1,
        equipmentId: 1,
        date: "2024-08-15",
        issue: "Belt slipping during high-speed operation",
        solution: "Belt tension adjustment and lubrication",
        cost: 120,
        technician: "Ahmed Al-Rashid",
        downtime: 2,
        partsUsed: ["Belt lubricant", "Tension bolts"]
    },
    {
        id: 2,
        equipmentId: 2,
        date: "2024-10-05",
        issue: "Bench padding worn and torn",
        solution: "Replaced bench padding and covers",
        cost: 85,
        technician: "Mike Wilson",
        downtime: 1,
        partsUsed: ["Bench padding", "Vinyl covers"]
    }
];

let usageAnalytics = [
    {
        equipmentId: 1,
        date: "2024-12-20",
        dailyUsage: 8.5,
        peakHours: ["06:00-09:00", "18:00-21:00"],
        userCount: 24,
        avgSessionTime: 21.3,
        efficiency: 85
    },
    {
        equipmentId: 2,
        date: "2024-12-20",
        dailyUsage: 6.2,
        peakHours: ["17:00-20:00"],
        userCount: 18,
        avgSessionTime: 20.7,
        efficiency: 78
    }
];

// Get all equipment
app.get('/api/equipment', (req, res) => {
    const { category, status, location } = req.query;
    let filteredEquipment = equipment;
    
    if (category) filteredEquipment = filteredEquipment.filter(e => e.category === category);
    if (status) filteredEquipment = filteredEquipment.filter(e => e.status === status);
    if (location) filteredEquipment = filteredEquipment.filter(e => e.location === location);
    
    res.json(filteredEquipment);
});

// Add new equipment
app.post('/api/equipment', (req, res) => {
    const newEquipment = {
        id: equipment.length + 1,
        ...req.body,
        usageHours: 0,
        repairHistory: 0,
        status: 'active',
        condition: 'excellent'
    };
    equipment.push(newEquipment);
    res.json(newEquipment);
});

// Update equipment
app.put('/api/equipment/:id', (req, res) => {
    const equipmentIndex = equipment.findIndex(e => e.id == req.params.id);
    if (equipmentIndex === -1) return res.status(404).json({ error: 'Equipment not found' });
    
    equipment[equipmentIndex] = { ...equipment[equipmentIndex], ...req.body };
    res.json(equipment[equipmentIndex]);
});

// Get maintenance schedule
app.get('/api/maintenance', (req, res) => {
    const { status, priority, date } = req.query;
    let filteredSchedule = maintenanceSchedule;
    
    if (status) filteredSchedule = filteredSchedule.filter(m => m.status === status);
    if (priority) filteredSchedule = filteredSchedule.filter(m => m.priority === priority);
    if (date) filteredSchedule = filteredSchedule.filter(m => m.scheduledDate === date);
    
    res.json(filteredSchedule);
});

// Schedule maintenance
app.post('/api/maintenance', (req, res) => {
    const newMaintenance = {
        id: maintenanceSchedule.length + 1,
        ...req.body,
        status: 'scheduled'
    };
    maintenanceSchedule.push(newMaintenance);
    res.json(newMaintenance);
});

// Update maintenance status
app.put('/api/maintenance/:id', (req, res) => {
    const maintenanceIndex = maintenanceSchedule.findIndex(m => m.id == req.params.id);
    if (maintenanceIndex === -1) return res.status(404).json({ error: 'Maintenance not found' });
    
    maintenanceSchedule[maintenanceIndex] = { ...maintenanceSchedule[maintenanceIndex], ...req.body };
    res.json(maintenanceSchedule[maintenanceIndex]);
});

// Get repair history
app.get('/api/repairs', (req, res) => {
    const { equipmentId } = req.query;
    let filteredRepairs = repairHistory;
    
    if (equipmentId) filteredRepairs = filteredRepairs.filter(r => r.equipmentId == equipmentId);
    
    res.json(filteredRepairs);
});

// Add repair record
app.post('/api/repairs', (req, res) => {
    const newRepair = {
        id: repairHistory.length + 1,
        ...req.body,
        date: new Date().toISOString().split('T')[0]
    };
    repairHistory.push(newRepair);
    
    // Update equipment repair count
    const equipmentItem = equipment.find(e => e.id == req.body.equipmentId);
    if (equipmentItem) {
        equipmentItem.repairHistory++;
        equipmentItem.maintenanceCost += req.body.cost;
    }
    
    res.json(newRepair);
});

// Get usage analytics
app.get('/api/usage-analytics', (req, res) => {
    const { equipmentId, startDate, endDate } = req.query;
    let filteredAnalytics = usageAnalytics;
    
    if (equipmentId) filteredAnalytics = filteredAnalytics.filter(u => u.equipmentId == equipmentId);
    
    res.json(filteredAnalytics);
});

// Get replacement recommendations
app.get('/api/replacement-planning', (req, res) => {
    const recommendations = equipment.map(item => {
        const usagePercentage = (item.usageHours / item.maxUsageHours) * 100;
        const ageInYears = (new Date() - new Date(item.purchaseDate)) / (365 * 24 * 60 * 60 * 1000);
        
        let priority = 'low';
        let recommendation = 'Continue monitoring';
        
        if (usagePercentage > 80 || ageInYears > 5 || item.repairHistory > 3) {
            priority = 'high';
            recommendation = 'Schedule replacement within 6 months';
        } else if (usagePercentage > 60 || ageInYears > 3 || item.repairHistory > 1) {
            priority = 'medium';
            recommendation = 'Plan replacement within 12 months';
        }
        
        return {
            equipmentId: item.id,
            name: item.name,
            usagePercentage: Math.round(usagePercentage),
            ageInYears: Math.round(ageInYears * 10) / 10,
            repairHistory: item.repairHistory,
            priority,
            recommendation,
            estimatedReplacementCost: item.purchasePrice * 1.2
        };
    });
    
    res.json(recommendations);
});

// Get equipment statistics
app.get('/api/equipment/stats', (req, res) => {
    const stats = {
        totalEquipment: equipment.length,
        activeEquipment: equipment.filter(e => e.status === 'active').length,
        maintenanceEquipment: equipment.filter(e => e.status === 'maintenance').length,
        outOfOrderEquipment: equipment.filter(e => e.status === 'out-of-order').length,
        totalValue: equipment.reduce((sum, e) => sum + e.purchasePrice, 0),
        avgUsageHours: Math.round(equipment.reduce((sum, e) => sum + e.usageHours, 0) / equipment.length),
        totalMaintenanceCost: equipment.reduce((sum, e) => sum + e.maintenanceCost, 0),
        upcomingMaintenance: maintenanceSchedule.filter(m => m.status === 'scheduled').length
    };
    
    res.json(stats);
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`Equipment Management API running on port ${PORT}`);
});