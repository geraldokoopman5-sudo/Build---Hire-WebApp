import type { QuoteSummary } from '../types/quote';

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  });
}


export function getTaxAmount(summary: QuoteSummary): number {
  const subtotal = summary.labor + summary.materials + summary.permitsAndFees;
  return subtotal * summary.taxRate;
}

export function getQuoteTotal(summary: QuoteSummary): number {
  const subtotal = summary.labor + summary.materials + summary.permitsAndFees;
  return subtotal + getTaxAmount(summary);
}