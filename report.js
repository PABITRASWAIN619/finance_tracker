import jsPDF from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";

export function generatePDF(expenses, budget) {
  const doc = new jsPDF();

  let total = expenses.reduce((a,b)=>a+b.amount,0);

  doc.text("Finance Report", 10, 10);
  doc.text("Budget: " + budget, 10, 20);
  doc.text("Total Spent: " + total, 10, 30);
  doc.text("Remaining: " + (budget - total), 10, 40);

  let y = 60;

  expenses.forEach(e => {
    doc.text(`${e.title} - ₹${e.amount} (${e.category})`, 10, y);
    y += 10;
  });

  doc.save("monthly-report.pdf");
}