import { JobEnum } from '../types/enums';
import type { JobStatus, CustomerJobStatus } from '../types/job';
export function customerJobStatusFromApi(value: number): CustomerJobStatus {
  switch (value) {
    case JobEnum.Requested: return 'requested';
    case JobEnum.Accepted: return 'accepted';
    case JobEnum.InProgress: return 'in-progress';
    case JobEnum.Completed: return 'completed';
    case JobEnum.Cancelled: return 'cancelled';
    case JobEnum.Rejected: return 'rejected';
    default: return jobStatusFromApi(value);
  }
}
export const jobStatusToApi: Record<JobStatus, JobEnum> = {
  working: JobEnum.Working, unavailable: JobEnum.Unavailable, available: JobEnum.Available,
  requested: JobEnum.Requested, accepted: JobEnum.Accepted, 'in-progress': JobEnum.InProgress,
  completed: JobEnum.Completed, cancelled: JobEnum.Cancelled, rejected: JobEnum.Rejected,
};
export function jobStatusFromApi(value: number): JobStatus {
  switch (value) {
    case JobEnum.Requested: return 'requested';
    case JobEnum.Accepted: return 'accepted';
    case JobEnum.InProgress: return 'in-progress';
    case JobEnum.Completed: return 'completed';
    case JobEnum.Cancelled: return 'cancelled';
    case JobEnum.Rejected: return 'rejected';
    case JobEnum.Working: return 'working';
    case JobEnum.Unavailable: return 'unavailable';
    case JobEnum.Available: return 'available';
    default: throw new Error(`Unknown job status: ${value}`);
  }
}
