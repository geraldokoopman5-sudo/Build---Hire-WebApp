import type { WorkerStatus } from '../types/worker';

export function getWorkerStatusLabel(status: WorkerStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'available':
      return 'Available';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
}