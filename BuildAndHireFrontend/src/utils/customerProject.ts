import type { CustomerJob } from '../types/job';
import { PaymentEnum } from '../types/enums';

export function canCancelProject(job: CustomerJob): boolean {
  return ['requested', 'accepted'].includes(job.status) && job.paymentStatus == null;
}
export function canSimulatePayment(job: CustomerJob): boolean {
  return !!job.quoteAcceptedAt && job.quote > 0 && job.paymentStatus == null
    && ['accepted', 'in-progress', 'completed'].includes(job.status);
}
export function paymentLabel(job: CustomerJob): string {
  switch (job.paymentStatus) {
    case PaymentEnum.Pending: return 'Pending review';
    case PaymentEnum.Successful: return 'Successful';
    case PaymentEnum.Failed: return 'Failed';
    case PaymentEnum.Refunded: return 'Refunded';
    default: return 'Not requested';
  }
}
export function paymentMessage(job: CustomerJob): string {
  switch (job.paymentStatus) {
    case PaymentEnum.Pending: return 'Your simulated request is saved. An administrator will set its outcome. Pending payments do not count as paid.';
    case PaymentEnum.Successful: return 'An administrator marked this simulated payment successful.';
    case PaymentEnum.Failed: return 'An administrator marked this simulated payment failed. Another request cannot be created for this job.';
    case PaymentEnum.Refunded: return 'This recorded demo payment is marked refunded. No money has been transferred.';
    default: return canSimulatePayment(job) ? 'Your accepted quote is ready for a simulated payment request.' : 'Accept the quote before submitting a simulated payment request.';
  }
}
export function projectDate(value?: string | null): string {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric',
  }).format(date);
}
