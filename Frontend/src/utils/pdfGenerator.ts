import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Payslip, Payrun, Employee } from "@/types/api";
import { formatCurrency, formatDateReadable, formatHours } from "@/utils/format";

const PRIMARY_COLOR: [number, number, number] = [0, 168, 98];
const PRIMARY_FOREGROUND: [number, number, number] = [255, 255, 255];
const MUTED_BG: [number, number, number] = [245, 247, 250];
const BORDER_COLOR: [number, number, number] = [214, 220, 230];
const TEXT_COLOR: [number, number, number] = [34, 34, 34];
const MUTED_TEXT: [number, number, number] = [115, 115, 115];

export function generatePayslipPDF(
  payslip: Payslip,
  employee: Employee,
  payrun: Payrun
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  try {
    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, pageWidth, 32, "F");

    doc.setTextColor(
      PRIMARY_FOREGROUND[0],
      PRIMARY_FOREGROUND[1],
      PRIMARY_FOREGROUND[2]
    );
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PAYROO", pageWidth / 2, 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    yPos = 38;
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PAYSLIP", pageWidth / 2, yPos, { align: "center" });
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
    doc.text(
      `Pay Period: ${formatDateReadable(payrun.periodStart)} - ${formatDateReadable(payrun.periodEnd)}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 10;
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Information", margin, yPos);
    yPos += 5;

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: [
        ["Name", `${employee.firstName} ${employee.lastName}`],
        ["Employee ID", employee.id],
        ["Hourly Rate", formatCurrency(employee.baseHourlyRate)],
        ["Super Rate", `${(employee.superRate * 100).toFixed(1)}%`],
      ],
      startY: yPos,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: TEXT_COLOR,
        fillColor: MUTED_BG,
        lineColor: BORDER_COLOR,
        lineWidth: 0.5,
        halign: "left",
        valign: "middle",
      },
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: PRIMARY_FOREGROUND,
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 2, fontStyle: "bold" },
        1: { cellWidth: contentWidth / 2 },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable?.finalY || yPos + 8;

    yPos += 7;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Hours Breakdown", margin, yPos);
    yPos += 5;

    autoTable(doc, {
      head: [["Type", "Hours"]],
      body: [
        ["Normal Hours", formatHours(payslip.normalHours)],
        ["Overtime Hours", formatHours(payslip.overtimeHours)],
        ["Total Hours", formatHours(payslip.normalHours + payslip.overtimeHours)],
      ],
      startY: yPos,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: TEXT_COLOR,
        fillColor: MUTED_BG,
        lineColor: BORDER_COLOR,
        lineWidth: 0.5,
        halign: "left",
        valign: "middle",
      },
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: PRIMARY_FOREGROUND,
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: MUTED_BG,
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 2, halign: "left", fontStyle: "normal" },
        1: { cellWidth: contentWidth / 2, halign: "right" },
      },
      didParseCell: (data: any) => {
        if (data.row.index === 2) {
          data.cell.styles.fontStyle = "bold";
        }
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable?.finalY || yPos + 8;

    yPos += 7;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Pay Breakdown", margin, yPos);
    yPos += 5;

    autoTable(doc, {
      head: [["Description", "Amount"]],
      body: [
        ["Gross Pay", formatCurrency(payslip.gross)],
        ["Tax", formatCurrency(payslip.tax)],
        ["Superannuation", formatCurrency(payslip.super)],
      ],
      startY: yPos,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: TEXT_COLOR,
        fillColor: MUTED_BG,
        lineColor: BORDER_COLOR,
        lineWidth: 0.5,
        halign: "left",
        valign: "middle",
      },
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: PRIMARY_FOREGROUND,
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: MUTED_BG,
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 2, halign: "left" },
        1: { cellWidth: contentWidth / 2, halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable?.finalY || yPos + 2;

    autoTable(doc, {
      body: [["Net Pay", formatCurrency(payslip.net)]],
      startY: yPos,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 4,
        textColor: PRIMARY_FOREGROUND,
        fillColor: PRIMARY_COLOR,
        lineColor: PRIMARY_COLOR,
        lineWidth: 0.5,
        fontStyle: "bold",
        halign: "left",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 2, halign: "left", fontStyle: "bold" },
        1: { cellWidth: contentWidth / 2, halign: "right", fontStyle: "bold" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable?.finalY || yPos + 8;

    if (employee.bank) {
      yPos += 7;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Bank Details", margin, yPos);
      yPos += 5;

      autoTable(doc, {
        body: [
          ["BSB", employee.bank.bsb],
          ["Account", employee.bank.account],
        ],
        startY: yPos,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 3,
          textColor: TEXT_COLOR,
          fillColor: MUTED_BG,
          lineColor: BORDER_COLOR,
          lineWidth: 0.5,
          halign: "left",
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: contentWidth / 2, fontStyle: "bold" },
          1: { cellWidth: contentWidth / 2 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable?.finalY || yPos + 4;
    }

    const footerY = pageHeight - 10;
    doc.setFontSize(6);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      pageWidth / 2,
      footerY,
      { align: "center" }
    );
    doc.text(
      "Payroo Mini Payrun - This is a system-generated document",
      pageWidth / 2,
      footerY + 3,
      { align: "center" }
    );

    const filename = `Payslip_${employee.id}_${payrun.periodStart}_${payrun.periodEnd}.pdf`;

    doc.save(filename);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}
