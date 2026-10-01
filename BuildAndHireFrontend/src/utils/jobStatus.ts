import { JobEnum } from '../types/enums';
import type { JobStatus } from '../types/job';
export const jobStatusToApi: Record<JobStatus, JobEnum> = {
  working: JobEnum.Working, unavailable: JobEnum.Unavailable, available: JobEnum.Available,
};
export function jobStatusFromApi(value: number): JobStatus {
  switch (value) {
    case JobEnum.Working: return 'working';
    case JobEnum.Unavailable: return 'unavailable';
    case JobEnum.Available: return 'available';
    default: throw new Error(`Unknown job status: ${value}`);
  }
}
