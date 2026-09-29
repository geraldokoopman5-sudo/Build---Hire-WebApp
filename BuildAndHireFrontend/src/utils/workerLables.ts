import {
  WorkerStatus,
  type WorkerStatus as WorkerStatusType,
} from '../types/worker';

export const WORKER_STATUS_LABELS: Record<
  WorkerStatusType,
  string
> = {
  [WorkerStatus.Active]: 'Active',
  [WorkerStatus.InActive]: 'Inactive',
  [WorkerStatus.Deleted]: 'Deleted',
  [WorkerStatus.Pending]: 'Pending',
  [WorkerStatus.Available]: 'Available',
  [WorkerStatus.Unavailable]: 'Unavailable',
};

export function getWorkerStatusLabel(
  status: WorkerStatusType
): string {
  return WORKER_STATUS_LABELS[status] ?? 'Unknown';
}