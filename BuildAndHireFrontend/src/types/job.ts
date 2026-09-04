export type JobStatus = 'working' | 'available' | 'unavailable';
export type PaymentState = 'successful' | 'pending' | 'on-hold';

export interface CompanyJob {
  id: string;
  status: JobStatus;
  title: string;
  description: string;
  dateRange: string;
  quoteAmount: number;
  amountPaid: number;
  paymentState: PaymentState;
  paymentNote: string;
}