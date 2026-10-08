import type { CustomerJob, CustomerJobStatus } from '../types/job';

const labels: Record<CustomerJobStatus, string> = {
  working: 'Working', available: 'Available', unavailable: 'Unavailable',
  requested: 'Requested', accepted: 'Accepted', 'in-progress': 'In progress',
  completed: 'Completed', cancelled: 'Cancelled', rejected: 'Rejected',
};
export function needsQuoteReview(job: CustomerJob): boolean {
  return job.status === 'accepted' && job.quote > 0 && !!job.quoteSentAt && !job.quoteAcceptedAt;
}
export function isOpenProject(job: CustomerJob): boolean {
  return !['completed', 'cancelled', 'rejected', 'unavailable'].includes(job.status);
}
export function projectStatusLabel(job: CustomerJob): string {
  return needsQuoteReview(job) ? 'Quote ready' : labels[job.status];
}
export function projectTitle(job: CustomerJob): string {
  return job.jobDescription.trim() || 'Untitled project';
}
export function projectQuoteNote(job: CustomerJob): string {
  if (job.quoteAcceptedAt) return 'Accepted quote';
  if (needsQuoteReview(job)) return 'Awaiting your acceptance';
  if (job.status === 'requested') return 'Awaiting company';
  if (job.quote > 0) return 'Company quote';
  return 'Quote not sent yet';
}
