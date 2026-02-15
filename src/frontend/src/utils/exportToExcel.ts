import type { StockSheet } from '../types/stockSheet';
import { formatNumber } from './numberFormat';

interface ExportTotals {
  opening: number;
  purchase: number;
  sales: number;
  suspense: number;
  closing: number;
}

export function exportToExcel(sheet: StockSheet, totals: ExportTotals, date: string) {
  // Create CSV content
  const lines: string[] = [];
  
  // Title and Date
  lines.push('Stock Calculation Sheet');
  lines.push(`Date: ${date}`);
  lines.push('');
  
  // Opening Stock Section
  lines.push('Opening Stock');
  lines.push('Item Name,Weight / Quantity');
  sheet.openingStock.forEach(row => {
    lines.push(`"${row.name}",${formatNumber(row.quantity)}`);
  });
  lines.push(`Total Opening Stock,${formatNumber(totals.opening)}`);
  lines.push('');
  
  // Purchase Section
  lines.push('Purchase');
  lines.push('Party Name,Quantity');
  sheet.purchase.forEach(row => {
    lines.push(`"${row.name}",${formatNumber(row.quantity)}`);
  });
  lines.push(`Total Purchase,${formatNumber(totals.purchase)}`);
  lines.push('');
  
  // Sales Section
  lines.push('Sales');
  lines.push('Party Name,Quantity');
  sheet.sales.forEach(row => {
    lines.push(`"${row.name}",${formatNumber(row.quantity)}`);
  });
  lines.push(`Total Sales,${formatNumber(totals.sales)}`);
  lines.push('');
  
  // Suspense Section
  lines.push('Suspense');
  lines.push('Party Name,Quantity');
  sheet.suspense.forEach(row => {
    lines.push(`"${row.name}",${formatNumber(row.quantity)}`);
  });
  lines.push(`Total Suspense,${formatNumber(totals.suspense)}`);
  lines.push('');
  
  // Final Calculation
  lines.push('Final Calculation');
  lines.push('Description,Value');
  lines.push(`Opening Stock,${formatNumber(totals.opening)}`);
  lines.push(`Purchase,${formatNumber(totals.purchase)}`);
  lines.push(`Sales,${formatNumber(totals.sales)}`);
  lines.push(`Suspense,${formatNumber(totals.suspense)}`);
  lines.push(`Closing Stock,${formatNumber(totals.closing)}`);
  
  // Create CSV content
  const csvContent = lines.join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `stock-calculation-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
