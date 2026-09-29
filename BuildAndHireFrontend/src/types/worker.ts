export const WorkerStatus = {
  Active: 0,
  InActive: 1,
  Deleted: 2,
  Pending: 3,
  Available: 4,
  Unavailable: 5,
} as const;

export type WorkerStatus =
  (typeof WorkerStatus)[keyof typeof WorkerStatus];

export interface Worker {
  workerId: string;
  workerFirstName: string;
  workerLastName: string;
  workerStatus: WorkerStatus;
  companyId: string;
  jobId: string;
}