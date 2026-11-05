/**
 * D-FARM POLUR - AUTOMATED AUDIT & WHATSAPP ENGINE
 * Target Mobile: 917200752628
 */

const FARM_PHONE = "917200752628";

// 1. DAILY 08:00 PM WHATSAPP TEXT PAYLOAD BUILDER
export function generateDailyWhatsAppPayload(stats) {
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const text = `*🌾 D-FARM POLUR • DAILY DISPATCH REPORT*
*Date:* ${dateStr} | *Time:* 08:00 PM
━━━━━━━━━━━━━━━━━━━━━
🥛 *MILK PRODUCTION:*
• Morning Yield (AM): ${stats.milkAm || 0} L
• Evening Yield (PM): ${stats.milkPm || 0} L
• *Total Day Yield: ${(stats.milkAm || 0) + (stats.milkPm || 0)} L*
• Average Fat: ${stats.avgFat || 4.2}% | SNF: ${stats.avgSnf || 8.5}

💰 *DAILY CASHFLOW:*
• Spot Direct Milk Sales: ₹${stats.spotSales || 0}
• By-Product / Manure Sales: ₹${stats.otherSales || 0}
• Daily Operating Spend (OPEX): ₹${stats.dailySpend || 0}
• *Net Daily Cash Inflow: ₹${((stats.spotSales || 0) + (stats.otherSales || 0)) - (stats.dailySpend || 0)}*

🐄 *HERD & SHED STATUS:*
• Animals Milked: ${stats.cowsMilked || 3} Nos
• Feeding Status: AM & PM Completed ✅
• Biogas Out-Valve: ${stats.biogasStatus || 'Cycle Normal'}
• Drop Watchlist: ${stats.dropAlerts || 'None (All Normal)'}
━━━━━━━━━━━━━━━━━━━━━
_System Generated via D-FARM Shed OS_`;

  return `https://wa.me/${FARM_PHONE}?text=${encodeURIComponent(text)}`;
}

// 2. WEEKLY AUDIT PDF GENERATOR (Sunday 08:30 PM)
export function generateWeeklyAuditPDF(weeklyData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(20, 54, 39); // #143627 Forest Green
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("D-FARM POLUR • WEEKLY AUDIT REPORT", 14, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Week Period: ${weeklyData.weekRange || 'Past 7 Days'} | Generated for: +91 7200752628`, 14, 20);

  // Summary Metrics Table
  doc.autoTable({
    startY: 34,
    head: [['Weekly Metric', 'Volume / Count', 'Financial Impact (INR)']],
    body: [
      ['Total Pure Milk Yield', `${weeklyData.totalMilk || 0} Litres`, `₹${weeklyData.milkRevenue || 0}`],
      ['Spot Direct Cash Collected', `${weeklyData.spotTransactions || 0} Txns`, `₹${weeklyData.spotCash || 0}`],
      ['Customer Subscription Dues Pending', `${weeklyData.dueCustomersCount || 0} Accounts`, `₹${weeklyData.pendingDues || 0}`],
      ['Total Concentrate Feed Consumed', `${weeklyData.feedConsumedKg || 0} kg`, `-₹${weeklyData.feedCost || 0}`],
      ['Green Fodder Harvested (Super Napier)', `${weeklyData.napierHarvestKg || 0} kg`, 'Farm Field Asset'],
      ['Helper Wages & Local Spend', '7 Days Labour', `-₹${weeklyData.labourCost || 0}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [27, 67, 50], textColor: [255, 255, 255] },
    styles: { fontSize: 9 }
  });

  // Watchlist & Animal Drop Analysis
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setTextColor(20, 54, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Animal Milk Drop & Health Watchlist", 14, finalY);

  doc.autoTable({
    startY: finalY + 4,
    head: [['Tag ID', 'Animal Breed', '7-Day Avg (L)', 'Variance %', 'Status / Prescribed Action']],
    body: weeklyData.watchlist && weeklyData.watchlist.length > 0 ? weeklyData.watchlist : [
      ['COW-01', 'Country Pure (Cauvery)', '14.2 L', '+2.1%', 'Healthy & Normal Yield'],
      ['COW-02', 'HF Cross 02', '18.4 L', '-1.2%', 'Optimal Lactation'],
      ['COW-03', 'Jersey Cross 03', '12.0 L', '-17.2%', 'Alert: Milk drop detected. Vet inspection advised.'],
      ['COW-04', 'Kangeyam 04', '0.0 L', '0.0%', 'Dry / Gestation 6th Month']
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8.5 }
  });

  doc.save(`DFARM_Weekly_Audit_${new Date().toISOString().slice(0,10)}.pdf`);
}

// 3. MONTHLY EXECUTIVE P&L PDF (Last Day 08:30 PM)
export function generateMonthlyExecutivePDF(monthlyData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(217, 119, 6); // Gold Accent
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("D-FARM POLUR • MONTHLY EXECUTIVE P&L STATEMENT", 14, 14);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Month: ${monthlyData.monthName || 'Current Month'} | Registered: ARN-288927 / Udyam Compliant`, 14, 22);

  // Revenue vs Expense AutoTable
  doc.autoTable({
    startY: 36,
    head: [['Operating Revenue Streams', 'Amount (INR)', 'Operating Expenses (OPEX)', 'Amount (INR)']],
    body: [
      ['Direct Spot Milk Sales', `₹${monthlyData.revSpotMilk || 0}`, 'Concentrate Feed & Thavudu', `₹${monthlyData.expFeed || 0}`],
      ['Monthly Milk Subscription Bills', `₹${monthlyData.revSubs || 0}`, 'Fodder Cultivation & Irrigation', `₹${monthlyData.expFodder || 0}`],
      ['Live Goats & Livestock Sales', `₹${monthlyData.revGoats || 0}`, 'Farm Helpers & Labour Wages', `₹${monthlyData.expLabour || 0}`],
      ['Country Eggs & Meat Sales', `₹${monthlyData.revPoultry || 0}`, 'Veterinary, AI Semen & Medicines', `₹${monthlyData.expVet || 0}`],
      ['Cured Dung Manure & Vermicompost', `₹${monthlyData.revManure || 0}`, 'Electricity, Fuel & Transport', `₹${monthlyData.expTransport || 0}`],
      ['Total Gross Revenue', `₹${monthlyData.totalRev || 0}`, 'Total Operating Expenses', `₹${monthlyData.totalExp || 0}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [20, 54, 39] },
    styles: { fontSize: 8.5 }
  });

  // Net Profit Box
  const netProfit = (monthlyData.totalRev || 0) - (monthlyData.totalExp || 0);
  const finalY = doc.lastAutoTable.finalY + 12;

  doc.setFillColor(netProfit >= 0 ? 240 : 254, netProfit >= 0 ? 253 : 242, netProfit >= 0 ? 244 : 242);
  doc.setDrawColor(netProfit >= 0 ? 22 : 239, netProfit >= 0 ? 101 : 68, netProfit >= 0 ? 52 : 68);
  doc.roundedRect(14, finalY, 182, 22, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(netProfit >= 0 ? 20 : 153, netProfit >= 0 ? 83 : 27, netProfit >= 0 ? 45 : 27);
  doc.text(`NET OPERATING PROFIT / (LOSS): INR ${netProfit.toLocaleString('en-IN')}`, 20, finalY + 14);

  doc.save(`DFARM_Monthly_PL_${new Date().toISOString().slice(0,7)}.pdf`);
}

// 4. YEARLY ENTERPRISE MASTER BALANCE SHEET (March 31 09:00 PM)
export function generateYearlyEnterprisePDF(annualData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(15, 41, 30);
  doc.rect(0, 0, 210, 32, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("D-FARM POLUR • ANNUAL ENTERPRISE BALANCE SHEET", 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Financial Year: ${annualData.fy || 'FY 2026-27'} | Promoter: Vignesh Dhayalan | Polur, TN`, 14, 24);

  doc.autoTable({
    startY: 38,
    head: [['Capital & Biological Assets', 'Valuation (INR)', 'Annual Liabilities & Outflow', 'Amount (INR)']],
    body: [
      ['Milking & Dry Cattle Herd Valuation', `₹${annualData.assetCattle || 0}`, 'Annual Concentrate Feed Sourcing', `₹${annualData.outFeed || 0}`],
      ['Goat Herd Asset (Fattening & Does)', `₹${annualData.assetGoats || 0}`, 'Annual Labour & Farm Payroll', `₹${annualData.outLabour || 0}`],
      ['Poultry & Silkworm Batch Capital', `₹${annualData.assetPoultry || 0}`, 'Medical, Deworming & Vaccines', `₹${annualData.outMedical || 0}`],
      ['Infrastructure: Shed, Kiosk, CCTV & Biogas', `₹${annualData.assetInfra || 0}`, 'Depreciation & Shed Maintenance', `₹${annualData.outDeprec || 0}`],
      ['Solar System Valuation (EB Offset Units)', `₹${annualData.assetSolar || 0}`, 'Carcass Mortality Financial Loss', `₹${annualData.outMortality || 0}`],
      ['Total Asset Valuation', `₹${annualData.totalAssets || 0}`, 'Total Annual Operating Costs', `₹${annualData.totalCosts || 0}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8.5 }
  });

  doc.save(`DFARM_Annual_Balance_Sheet_${annualData.fy || 'FY26-27'}.pdf`);
}
