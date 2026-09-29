import type { JobStatus, PaymentState } from '../types/job';

export function getJobStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'working':
      return 'Working';
    case 'available':
      return 'Available';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
}

export function getPaymentStateLabel(paymentState: PaymentState): string {
  switch (paymentState) {
    case 'successful':
      return 'Successful';
    case 'pending':
      return 'Pending';
    case 'on-hold':
      return 'Pending';
    default:
      return 'Unknown';
  }
}