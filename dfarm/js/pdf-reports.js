import { farmState } from "./firebase-config.js";

// 1. Single Customer Due & Purchase Statement PDF
export function downloadCustomerBillPDF(phone) {
  if (!window.jspdf) return alert('PDF engine loading. Try again in 2 seconds.');
  const { jsPDF } = window.jspdf;
  const docPdf = new jsPDF();
  const c = farmState.customersCache.find(item => item.phone === phone);

  if (!c) return alert('Customer record not found!');

  docPdf.setFillColor(20, 54, 39);
  docPdf.rect(0, 0, 210, 32, 'F');
  docPdf.setFontSize(18);
  docPdf.setTextColor(255, 255, 255);
  docPdf.text("D-FARM POLUR", 14, 18);
  docPdf.setFontSize(10);
  docPdf.text("Multi-Product Customer Ledger & Statement", 14, 26);

  docPdf.setTextColor(30, 41, 59);
  docPdf.text(`Customer Name: ${c.name}`, 14, 44);
  docPdf.text(`Mobile Number: ${c.phone}`, 14, 51);
  docPdf.text(`Total Milk Supplied: ${(c.totalLiters || 0).toFixed(1)} Litres`, 14, 58);

  docPdf.setFontSize(14);
  docPdf.setTextColor(220, 38, 38);
  docPdf.text(`TOTAL PENDING BALANCE: Rs. ${(c.balanceDue || 0).toLocaleString('en-IN')}`, 14, 72);

  docPdf.setFontSize(9);
  docPdf.setTextColor(71, 85, 105);
  docPdf.text("Pay directly via UPI: 7200752628@upi (GPay / PhonePe)", 14, 82);
  docPdf.text("Bakmar Pettai, Murugapadi, Polur • 7200752628", 14, 88);

  docPdf.save(`D-FARM_${c.name}_Statement.pdf`);
}

// 2. Master Enterprise Farm Summary Audit PDF
export function downloadMasterFarmReportPDF() {
  if (!window.jspdf) return alert('PDF engine loading. Try again in 2 seconds.');
  const { jsPDF } = window.jspdf;
  const docPdf = new jsPDF();

  docPdf.setFillColor(20, 54, 39);
  docPdf.rect(0, 0, 210, 32, 'F');
  docPdf.setFontSize(18);
  docPdf.setTextColor(255, 255, 255);
  docPdf.text("D-FARM POLUR - MASTER ENTERPRISE REPORT", 14, 18);
  docPdf.setFontSize(10);
  docPdf.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 26);

  const totalCapex = farmState.capexCache.reduce((s, i) => s + (i.amount || 0), 0);
  const totalDue = farmState.customersCache.reduce((s, i) => s + (i.balanceDue || 0), 0);
  const totalRev = farmState.revenueCache.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExp = farmState.expensesCache.reduce((s, i) => s + (i.amount || 0), 0);

  docPdf.setTextColor(30, 41, 59);
  docPdf.setFontSize(11);
  docPdf.text(`• Total Cattle / Livestock Headcount: ${farmState.animalsCache.length}`, 14, 44);
  docPdf.text(`• Total Farm CAPEX Investment: Rs. ${totalCapex.toLocaleString('en-IN')}`, 14, 51);
  docPdf.text(`• All-Time Revenue: Rs. ${totalRev.toLocaleString('en-IN')}`, 14, 58);
  docPdf.text(`• All-Time Operating Expenses: Rs. ${totalExp.toLocaleString('en-IN')}`, 14, 65);
  docPdf.text(`• Outstanding Customer Dues: Rs. ${totalDue.toLocaleString('en-IN')}`, 14, 72);

  const tableData = farmState.customersCache.map(c => [
    c.name, 
    c.phone, 
    `${(c.totalLiters || 0).toFixed(1)} L`, 
    `Rs. ${(c.balanceDue || 0).toLocaleString('en-IN')}`
  ]);

  if (docPdf.autoTable) {
    docPdf.autoTable({
      startY: 82,
      head: [['Customer', 'Phone', 'Total Litres', 'Pending Due']],
      body: tableData,
      headStyles: { fillColor: [20, 54, 39] }
    });
  }

  docPdf.save(`D-FARM_Master_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
}

// 3. Single Animal Lifecycle & Milk Yield Audit PDF
export function downloadAnimalAuditPDF() {
  const tagInput = document.getElementById('animalSearchTagInput');
  const tag = tagInput?.value.trim().toUpperCase();
  if (!tag) return alert("Enter Tag ID (e.g. COW-01)");

  const a = farmState.animalsCache.find(i => i.tag === tag);
  if (!a) return alert(`Animal with Tag ${tag} not found!`);

  if (!window.jspdf) return alert('PDF engine loading. Try again in 2 seconds.');
  const { jsPDF } = window.jspdf;
  const docPdf = new jsPDF();

  docPdf.setFillColor(20, 54, 39);
  docPdf.rect(0, 0, 210, 32, 'F');
  docPdf.setFontSize(18);
  docPdf.setTextColor(255, 255, 255);
  docPdf.text(`ANIMAL LIFECYCLE AUDIT: ${a.tag}`, 14, 18);
  docPdf.setFontSize(10);
  docPdf.text(`D-FARM Polur • Breed: ${a.breed} • Type: ${a.type}`, 14, 26);

  docPdf.setTextColor(30, 41, 59);
  docPdf.text(`Status: ${a.status || 'Active'}`, 14, 45);
  docPdf.text(`Source: ${a.source || 'Purchased'} (Buy Price: Rs. ${a.buyPrice || 0})`, 14, 52);
  docPdf.text(`Current Weight: ${a.currentWeight || '-'} kg`, 14, 59);
  if (a.expectedCalving) docPdf.text(`Calving ETA: ${a.expectedCalving}`, 14, 66);

  const milkLogs = farmState.milkRecordsCache
    .filter(m => m.cowTag === tag)
    .map(m => [m.date, m.session, `${m.quantity} L`]);

  if (docPdf.autoTable) {
    docPdf.autoTable({
      startY: 75,
      head: [['Date', 'Session', 'Milk Produced']],
      body: milkLogs.length ? milkLogs : [['No milk records logged yet', '-', '-']],
      headStyles: { fillColor: [20, 54, 39] }
    });
  }

  docPdf.save(`D-FARM_Animal_${tag}_Audit.pdf`);
}
