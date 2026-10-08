import type { PaymentEnum, PaymentMethod } from './enums';
import type { Address } from './company';

export type JobStatus =
  | 'working'
  | 'available'
  | 'unavailable' | 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';

export type CustomerJobStatus = JobStatus | 'requested' | 'accepted' | 'in-progress'
  | 'completed' | 'cancelled' | 'rejected';

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
  paymentRequested?: boolean;
  startDate?: string;
  endDate?: string;
  daysWorking?: number;
  address?: Address | null;
  acceptedAt?: string | null;
  quoteSentAt?: string | null;
  quoteAcceptedAt?: string | null;
  paymentStatus?: PaymentEnum | null;
  payingMethod?: PaymentMethod | null;
}

export interface CustomerJob {
  jobId: string;
  companyId: string;
  companyName: string;
  customerId: string;

  jobDescription: string;
  daysWorking: number;

  /*
   * Mirrors backend Quote.
   * A newly created job has no company quote yet,
   * so this starts at 0.
   */
  quote: number;

  startDate: string;
  endDate: string;

  payingMethod: PaymentMethod | null;
  paymentStatus?: PaymentEnum | null;
  amountPaid?: number;
  paymentReference?: string | null;

  status: CustomerJobStatus;
  acceptedAt?: string | null;
  quoteSentAt?: string | null;
  quoteAcceptedAt?: string | null;

  address: Address;

}
