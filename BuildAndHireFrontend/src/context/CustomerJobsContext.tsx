/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CustomerJob } from '../types/job';
import { AccountType, JobEnum, type PaymentMethod } from '../types/enums';
import { apiRequest } from '../utils/api';
import { getStoredAccessToken, getStoredAccountType } from '../utils/auth';
import { dateInputToUtc } from '../utils/dates';
import { customerJobStatusFromApi } from '../utils/jobStatus';

interface CreateCustomerJobInput {
  companyId: string;
  companyName: string;
  jobDescription: string;
  daysWorking: number;
  startDate: string;
  endDate: string;
  payingMethod: PaymentMethod | null;
  address: CustomerJob['address'];
}
type ApiJob = Omit<CustomerJob, 'status' | 'createdAt'> & { status: number };
function fromApi(job: ApiJob): CustomerJob {
  return { ...job, status: customerJobStatusFromApi(job.status) };
}
interface CustomerJobsContextValue {
  jobs: CustomerJob[];
  loading: boolean;
  error: string;
  refreshJobs: () => void;
  acceptQuote: (jobId: string, quote: number) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  createJob: (input: CreateCustomerJobInput) => Promise<CustomerJob>;
  requestEftPayment: (jobId: string, transactionReference: string) => Promise<void>;
  getJobById: (jobId: string) => CustomerJob | undefined;
}
const CustomerJobsContext = createContext<CustomerJobsContextValue | undefined>(undefined);

export function CustomerJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refreshJobs = useCallback(() => setRefreshVersion(version => version + 1), []);
  useEffect(() => {
    let controller: AbortController | undefined;
    const reload = () => {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      setJobs([]);
      setError('');
      const token = getStoredAccessToken();
      if (!token || getStoredAccountType() !== AccountType.Customer) {
        setLoading(false);
        return;
      }
      setLoading(true);
      apiRequest<ApiJob[]>('/api/Jobs', {
        headers: { Authorization: `Bearer ${token}` }, signal,
      }).then(data => {
        if (!signal.aborted) setJobs(data.map(fromApi));
      }).catch((reason: unknown) => {
        if (!signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load jobs.');
      }).finally(() => { if (!signal.aborted) setLoading(false); });
    };
    reload();
    window.addEventListener('buildandhire:auth', reload);
    window.addEventListener('storage', reload);
    window.addEventListener('focus', reload);
    return () => {
      controller?.abort();
      window.removeEventListener('buildandhire:auth', reload);
      window.removeEventListener('storage', reload);
      window.removeEventListener('focus', reload);
    };
  }, [refreshVersion]);
  const createJob = useCallback(async (input: CreateCustomerJobInput): Promise<CustomerJob> => {
    const token = getStoredAccessToken();
    if (!token) throw new Error('Please sign in again.');
    const saved = await apiRequest<ApiJob>('/api/Jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        companyId: input.companyId,
        jobDescription: input.jobDescription.trim(),
        daysWorking: input.daysWorking,
        startDate: dateInputToUtc(input.startDate),
        endDate: dateInputToUtc(input.endDate),
        payingMethod: input.payingMethod,
        status: JobEnum.Requested,
        address: input.address,
      }),
    });
    const job = fromApi(saved);
    if (getStoredAccessToken() === token) setJobs(current => [job, ...current.filter(x => x.jobId !== job.jobId)]);
    return job;
  }, []);
  const getJobById = useCallback((id: string) => jobs.find(job => job.jobId === id), [jobs]);
  const saveJob = useCallback(async (id: string, path: string, body?: object) => {
    const token = getStoredAccessToken();
    if (!token) throw new Error('Please sign in again.');
    await apiRequest(path, { method: 'POST', headers: { Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined });
    const saved = await apiRequest<ApiJob>(`/api/Jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (getStoredAccessToken() === token) setJobs(current => current.map(job => job.jobId === id ? fromApi(saved) : job));
  }, []);
  const acceptQuote = useCallback((id: string, quote: number) => saveJob(id, `/api/Jobs/${id}/quote/accept`, { quote }), [saveJob]);
  const cancelJob = useCallback((id: string) => saveJob(id, `/api/Jobs/${id}/cancel`), [saveJob]);
  const requestEftPayment = useCallback(async (jobId: string, transactionReference: string): Promise<void> => {
    await saveJob(jobId, '/api/Payment/eft', { jobId, transactionReference: transactionReference.trim() || null });
  }, [saveJob]);
  const value = useMemo(() => ({ jobs, loading, error, refreshJobs, acceptQuote, cancelJob, createJob, requestEftPayment, getJobById }), [jobs, loading, error, refreshJobs, acceptQuote, cancelJob, createJob, requestEftPayment, getJobById]);
  return <CustomerJobsContext.Provider value={value}>{children}</CustomerJobsContext.Provider>;
}
export function useCustomerJobs(): CustomerJobsContextValue {
  const context = useContext(CustomerJobsContext);
  if (!context) throw new Error('useCustomerJobs must be used inside CustomerJobsProvider');
  return context;
}
export function getCurrentCustomerId(): string {
  return localStorage.getItem('buildandhire.customerId') ?? '';
}
