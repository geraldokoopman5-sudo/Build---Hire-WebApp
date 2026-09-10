

// your actual worker.ts
export type WorkerStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'available'
  | 'unavailable'
  | 'deleted';

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  available: 'Available',
  unavailable: 'Unavailable',
  deleted: 'Deleted',
};

export function getWorkerStatusLabel(
  status: WorkerStatus
): string {
  return WORKER_STATUS_LABELS[status];
}