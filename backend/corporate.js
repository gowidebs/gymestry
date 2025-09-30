const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Create corporate plan
exports.createCorporatePlan = async (event) => {
    try {
        const { 
            companyName, 
            contactEmail, 
            contactPhone, 
            employeeCount, 
            planType = 'standard' 
        } = JSON.parse(event.body);
        
        const corporateId = uuidv4();
        const corporate = {
            corporateId,
            companyName,
            contactEmail,
            contactPhone,
            employeeCount,
            planType, // standard, premium, enterprise
            status: 'pending', // pending, active, suspended
            monthlyPrice: calculateCorporatePrice(employeeCount, planType),
            createdAt: new Date().toISOString(),
            gateAccess: generateGateAccess()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-Corporate',
            Item: corporate
        }).promise();
        
        // Send to CRM for sales follow-up
        await trackCorporateInquiry(corporate);
        
        // Create gate access codes
        await createGateAccess(corporateId, employeeCount);
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                corporate,
                message: 'Corporate plan created. Sales team will contact you within 24 hours.'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Add corporate employee
exports.addCorporateEmployee = async (event) => {
    try {
        const { corporateId } = event.pathParameters;
        const { employeeEmail, employeeName, department } = JSON.parse(event.body);
        
        const employeeId = uuidv4();
        const employee = {
            employeeId,
            corporateId,
            employeeEmail,
            employeeName,
            department,
            accessCode: generateAccessCode(),
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        await dynamodb.put({
            TableName: 'GoGym-CorporateEmployees',
            Item: employee
        }).promise();
        
        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ employee })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Validate gate access
exports.validateGateAccess = async (event) => {
    try {
        const { accessCode, gymId } = JSON.parse(event.body);
        
        const result = await dynamodb.scan({
            TableName: 'GoGym-CorporateEmployees',
            FilterExpression: 'accessCode = :code AND #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues = {
                ':code': accessCode,
                ':status': 'active'
            }
        }).promise();
        
        if (result.Items.length === 0) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Invalid access code' })
            };
        }
        
        const employee = result.Items[0];
        
        // Log access
        await logGateAccess(employee.employeeId, gymId);
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                success: true,
                employee: employee.employeeName,
                company: employee.corporateId
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Get corporate analytics
exports.getCorporateAnalytics = async (event) => {
    try {
        const { corporateId } = event.pathParameters;
        
        const employeesResult = await dynamodb.query({
            TableName: 'GoGym-CorporateEmployees',
            IndexName: 'CorporateEmployeesIndex',
            KeyConditionExpression: 'corporateId = :corporateId',
            ExpressionAttributeValues: {
                ':corporateId': corporateId
            }
        }).promise();
        
        const accessLogsResult = await dynamodb.scan({
            TableName: 'GoGym-GateAccessLogs',
            FilterExpression: 'corporateId = :corporateId',
            ExpressionAttributeValues: {
                ':corporateId': corporateId
            }
        }).promise();
        
        const analytics = {
            totalEmployees: employeesResult.Items.length,
            activeEmployees: employeesResult.Items.filter(e => e.status === 'active').length,
            totalAccess: accessLogsResult.Items.length,
            monthlyUsage: calculateMonthlyUsage(accessLogsResult.Items)
        };
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ analytics })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function calculateCorporatePrice(employeeCount, planType) {
    const basePrices = {
        standard: 25, // AED per employee per month
        premium: 35,
        enterprise: 50
    };
    
    const basePrice = basePrices[planType] || 25;
    const discount = employeeCount > 100 ? 0.15 : employeeCount > 50 ? 0.1 : 0;
    
    return Math.round(basePrice * employeeCount * (1 - discount));
}

function generateGateAccess() {
    return {
        qrEnabled: true,
        nfcEnabled: true,
        biometricEnabled: false
    };
}

function generateAccessCode() {
    return 'GG' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function createGateAccess(corporateId, employeeCount) {
    // Create gate access system integration
    console.log(`Gate access created for ${corporateId} - ${employeeCount} employees`);
}

async function logGateAccess(employeeId, gymId) {
    const log = {
        logId: uuidv4(),
        employeeId,
        gymId,
        accessTime: new Date().toISOString(),
        accessType: 'gate_entry'
    };
    
    await dynamodb.put({
        TableName: 'GoGym-GateAccessLogs',
        Item: log
    }).promise();
}

function calculateMonthlyUsage(accessLogs) {
    const currentMonth = new Date().getMonth();
    const monthlyLogs = accessLogs.filter(log => 
        new Date(log.accessTime).getMonth() === currentMonth
    );
    
    return monthlyLogs.length;
}

async function trackCorporateInquiry(corporate) {
    // Send to CRM for sales team follow-up
    const crmData = {
        event: 'corporate_inquiry',
        companyName: corporate.companyName,
        contactEmail: corporate.contactEmail,
        employeeCount: corporate.employeeCount,
        estimatedRevenue: corporate.monthlyPrice * 12,
        priority: corporate.employeeCount > 100 ? 'high' : 'medium',
        timestamp: corporate.createdAt
    };
    
    console.log('CRM Corporate Lead:', crmData);
}