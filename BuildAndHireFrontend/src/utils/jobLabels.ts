import type { JobStatus, PaymentState } from '../types/job';

export function getJobStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'requested': return 'Requested';
    case 'accepted': return 'Accepted';
    case 'in-progress': return 'In progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'rejected': return 'Rejected';
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
