/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccountType } from '../types/enums';
import { WorkerStatus, type Worker } from '../types/worker';
import { apiRequest } from '../utils/api';
import { getStoredAccessToken, getStoredAccountType } from '../utils/auth';

interface AddWorkerInput {
  workerFirstName: string;
  workerLastName: string;
  workerStatus: WorkerStatus;
  companyId: string;
  jobId: string;
}
interface WorkforceContextValue {
  workers: Worker[];
  loading: boolean;
  error: string;
  addWorker: (input: AddWorkerInput) => Promise<Worker>;
  updateWorkerStatus: (workerId: string, status: WorkerStatus) => Promise<void>;
  removeWorkerFromJob: (workerId: string) => Promise<void>;
}
const WorkforceContext = createContext<WorkforceContextValue | undefined>(undefined);

export function WorkforceProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let controller: AbortController | undefined;
    const reload = () => {
      controller?.abort();
      controller = new AbortController();
      setWorkers([]);
      if (!getStoredAccessToken() || getStoredAccountType() !== AccountType.Company) {
        setLoading(false); return;
      }
      setLoading(true);
      const signal = controller.signal;
      apiRequest<Worker[]>('/api/Workers', { signal })
        .then(data => { if (!signal.aborted) { setWorkers(data); setError(''); } })
        .catch((reason: unknown) => { if (!signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load workers.'); })
        .finally(() => { if (!signal.aborted) setLoading(false); });
    };
    reload();
    window.addEventListener('buildandhire:auth', reload);
    window.addEventListener('storage', reload);
    return () => {
      controller?.abort();
      window.removeEventListener('buildandhire:auth', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);
  const addWorker = async (input: AddWorkerInput): Promise<Worker> => {
    const worker = await apiRequest<Worker>('/api/Workers', {
      method: 'POST',
      body: JSON.stringify({ workerFirstName: input.workerFirstName.trim(),
        workerLastName: input.workerLastName.trim(), workerStatus: input.workerStatus, jobId: input.jobId }),
    });
    setWorkers(current => [worker, ...current]);
    return worker;
  };
  const updateWorkerStatus = async (id: string, status: WorkerStatus): Promise<void> => {
    await apiRequest(`/api/Workers/${id}`, { method: 'PUT', body: JSON.stringify({ workerStatus: status }) });
    setWorkers(current => current.map(worker => worker.workerId === id ? { ...worker, workerStatus: status } : worker));
  };
  const removeWorkerFromJob = async (id: string): Promise<void> => {
    await apiRequest(`/api/Workers/${id}`, { method: 'DELETE' });
    setWorkers(current => current.filter(worker => worker.workerId !== id));
  };
  const value = useMemo(() => ({ workers, loading, error, addWorker, updateWorkerStatus, removeWorkerFromJob }),
    [workers, loading, error]);
  return <WorkforceContext.Provider value={value}>{children}</WorkforceContext.Provider>;
}
export function useWorkforce(): WorkforceContextValue {
  const value = useContext(WorkforceContext);
  if (!value) throw new Error('useWorkforce must be used inside WorkforceProvider');
  return value;
}
