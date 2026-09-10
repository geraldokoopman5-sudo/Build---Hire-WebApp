import type { PaymentMethod } from './enums';
import type { Address } from './company';

export type JobStatus =
  | 'working'
  | 'available'
  | 'unavailable';

export type PaymentState =
  | 'successful'
  | 'pending'
  | 'on-hold';

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

export interface CustomerJob {
  jobId: string;
  companyId: string;
  companyName: string;
  customerId: string;

  jobDescription: string;
  daysWorking: number;

  /*
   * Mirrors backend Qoute.
   * A newly created job has no company quote yet,
   * so this starts at 0.
   */
  qoute: number;

  startDate: string;
  endDate: string;

  payingMethod: PaymentMethod | null;

  status: JobStatus;

  address: Address;

  createdAt: string;
}