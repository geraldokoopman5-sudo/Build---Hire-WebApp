/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { AccountType } from '../types/enums';
import type { Worker, WorkerStatus } from '../types/worker';
import { apiRequest } from '../utils/api';
import { getStoredAccountType } from '../utils/auth';
import { useApiResource, dataChanged } from '../hooks/useApiResource';
import { useSession } from '../hooks/useSession';
interface AddWorkerInput { workerFirstName: string; workerLastName: string; workerStatus: WorkerStatus; companyId?: string; jobId?: string | null; }
interface WorkforceContextValue {
  workers: Worker[]; loading: boolean; error: string; refreshWorkers: () => void;
  addWorker: (input: AddWorkerInput) => Promise<Worker>;
  updateWorkerStatus: (id: string, status: WorkerStatus) => Promise<void>;
  assignWorker: (id: string, jobId: string | null) => Promise<void>;
  removeWorkerFromJob: (id: string) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
}
const WorkforceContext = createContext<WorkforceContextValue | undefined>(undefined);
export function WorkforceProvider({ children }: { children: ReactNode }) {
  useSession();
  const resource = useApiResource<Worker[]>('/api/Workers', getStoredAccountType() === AccountType.Company);
  const addWorker = async (input: AddWorkerInput) => { const worker = await apiRequest<Worker>('/api/Workers', { method: 'POST', body: JSON.stringify({ workerFirstName: input.workerFirstName.trim(), workerLastName: input.workerLastName.trim(), workerStatus: input.workerStatus, jobId: input.jobId ?? null }) }); dataChanged(); return worker; };
  const updateWorkerStatus = async (id: string, workerStatus: WorkerStatus) => { await apiRequest(`/api/Workers/${id}`, { method: 'PUT', body: JSON.stringify({ workerStatus }) }); dataChanged(); };
  const assignWorker = async (id: string, jobId: string | null) => { await apiRequest(`/api/Workers/${id}/job`, { method: 'PATCH', body: JSON.stringify({ jobId }) }); dataChanged(); };
  const removeWorkerFromJob = (id: string) => assignWorker(id, null);
  const deleteWorker = async (id: string) => { await apiRequest(`/api/Workers/${id}`, { method: 'DELETE' }); dataChanged(); };
  return <WorkforceContext.Provider value={{ workers: resource.data ?? [], loading: resource.loading, error: resource.error, refreshWorkers: resource.refresh, addWorker, updateWorkerStatus, assignWorker, removeWorkerFromJob, deleteWorker }}>{children}</WorkforceContext.Provider>;
}
export function useWorkforce() { const value = useContext(WorkforceContext); if (!value) throw new Error('WorkforceProvider is required.'); return value; }
