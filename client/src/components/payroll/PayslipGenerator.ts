import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PayrollRecord } from '../../types/payroll.types';

export const generatePayslipPDF = (payroll: PayrollRecord) => {
  const doc = new jsPDF();
  const employeeName = typeof payroll.employeeId === 'object' ? payroll.employeeId.name : 'Employee';
  const departmentName = typeof payroll.employeeId === 'object' ? payroll.employeeId.department.departmentName : 'N/A';

  // Title
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text('PAYSLIP', 105, 20, { align: 'center' });

  // Company Info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Employee Management System', 105, 28, { align: 'center' });

  // Employee Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Employee Name: ${employeeName}`, 20, 50);
  doc.text(`Department: ${departmentName}`, 20, 60);
  doc.text(`Salary Month: ${payroll.month} ${payroll.year}`, 20, 70);
  doc.text(`Payment Status: ${payroll.status}`, 20, 80);

  // Salary Breakdown Table
  (doc as any).autoTable({
    startY: 90,
    head: [['Description', 'Amount']],
    body: [
      ['Basic Salary', `$${payroll.basicSalary.toLocaleString()}`],
      ['Bonus', `$${payroll.bonus.toLocaleString()}`],
      ['Deductions', `-$${payroll.deduction.toLocaleString()}`],
    ],
    foot: [['Net Salary', `$${payroll.netSalary.toLocaleString()}`]],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    margin: { top: 10, left: 20, right: 20 }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('This is a computer generated payslip and requires no signature.', 105, finalY + 20, { align: 'center' });

  doc.save(`${employeeName}_Payslip_${payroll.month}_${payroll.year}.pdf`);
};
