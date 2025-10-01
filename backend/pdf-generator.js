const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class FinancialPDFGenerator {
  constructor() {
    this.ensureDownloadsFolder();
  }

  ensureDownloadsFolder() {
    const downloadsPath = path.join(__dirname, '../downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
  }

  generateRevenueAnalysis() {
    const doc = new PDFDocument();
    const filename = `Revenue_Analysis_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../downloads', filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    // Header
    doc.fontSize(20).text('Revenue Analysis Report', 50, 50);
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    
    // Key Metrics
    doc.fontSize(16).text('Key Metrics', 50, 120);
    doc.fontSize(12)
       .text('Monthly Revenue: AED 245,680', 70, 150)
       .text('YTD Revenue: AED 2,456,800', 70, 170)
       .text('Growth Rate: +15.2%', 70, 190);
    
    // Revenue Sources
    doc.fontSize(16).text('Revenue Sources', 50, 230);
    doc.fontSize(12)
       .text('• Memberships: 65% (AED 159,692)', 70, 260)
       .text('• Personal Training: 25% (AED 61,420)', 70, 280)
       .text('• Products: 10% (AED 24,568)', 70, 300);
    
    doc.end();
    return { filename, filepath };
  }

  generateExpenseBreakdown() {
    const doc = new PDFDocument();
    const filename = `Expense_Breakdown_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../downloads', filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    doc.fontSize(20).text('Expense Breakdown Report', 50, 50);
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    
    doc.fontSize(16).text('Monthly Expenses: AED 156,420', 50, 120);
    doc.fontSize(12)
       .text('• Staff Salaries: AED 70,389 (45%)', 70, 150)
       .text('• Rent & Utilities: AED 46,926 (30%)', 70, 170)
       .text('• Equipment: AED 23,463 (15%)', 70, 190)
       .text('• Marketing: AED 15,642 (10%)', 70, 210);
    
    doc.end();
    return { filename, filepath };
  }

  generatePLStatement() {
    const doc = new PDFDocument();
    const filename = `PL_Statement_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../downloads', filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    doc.fontSize(20).text('Profit & Loss Statement', 50, 50);
    doc.fontSize(12).text(`Period: December 2024`, 50, 80);
    
    doc.fontSize(16).text('REVENUE', 50, 120);
    doc.fontSize(12)
       .text('Total Revenue: AED 245,680', 70, 150);
    
    doc.fontSize(16).text('EXPENSES', 50, 190);
    doc.fontSize(12)
       .text('Total Expenses: AED 156,420', 70, 220);
    
    doc.fontSize(16).text('NET PROFIT: AED 89,260', 50, 260);
    doc.fontSize(12).text('Profit Margin: 36.3%', 70, 290);
    
    doc.end();
    return { filename, filepath };
  }

  generateVATReport() {
    const doc = new PDFDocument();
    const filename = `VAT_Report_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../downloads', filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    doc.fontSize(20).text('UAE VAT Report - Q4 2024', 50, 50);
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    
    doc.fontSize(16).text('VAT Summary', 50, 120);
    doc.fontSize(12)
       .text('VAT Rate: 5%', 70, 150)
       .text('VAT Collected: AED 12,284', 70, 170)
       .text('VAT Paid: AED 7,821', 70, 190)
       .text('Net VAT Due: AED 4,463', 70, 210);
    
    doc.end();
    return { filename, filepath };
  }

  generateBudgetForecast() {
    const doc = new PDFDocument();
    const filename = `Budget_Forecast_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../downloads', filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    doc.fontSize(20).text('Budget Forecast 2025', 50, 50);
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    
    doc.fontSize(16).text('Annual Targets', 50, 120);
    doc.fontSize(12)
       .text('Target Revenue: AED 3.2M', 70, 150)
       .text('Growth Target: +18%', 70, 170)
       .text('Q1 Forecast: AED 280K', 70, 190);
    
    doc.end();
    return { filename, filepath };
  }

  async generateAllReports() {
    const reports = [
      this.generateRevenueAnalysis(),
      this.generateExpenseBreakdown(),
      this.generatePLStatement(),
      this.generateVATReport(),
      this.generateBudgetForecast()
    ];
    
    return {
      success: true,
      message: 'All financial reports generated successfully',
      files: reports.map(r => r.filename),
      downloadPath: path.join(__dirname, '../downloads')
    };
  }
}

module.exports = FinancialPDFGenerator;