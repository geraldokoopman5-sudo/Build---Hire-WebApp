export type WorkerStatus = 'active' | 'available' | 'unavailable';

export interface Worker {
  id: string;
  name: string;
  role: string;
  status: WorkerStatus;
  currentProject?: string;
  photoUrl: string;
}