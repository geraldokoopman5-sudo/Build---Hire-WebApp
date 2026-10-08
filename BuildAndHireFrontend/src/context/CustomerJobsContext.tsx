/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CustomerJob } from '../types/job';
import { AccountType, JobEnum, PaymentEnum, type PaymentMethod } from '../types/enums';
import { apiRequest } from '../utils/api';
import { getStoredAccessToken, getStoredAccountType } from '../utils/auth';
import { dateInputToUtc } from '../utils/dates';
import { jobStatusFromApi } from '../utils/jobStatus';

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
  return { ...job, status: jobStatusFromApi(job.status) };
}
interface CustomerJobsContextValue {
  jobs: CustomerJob[];
  loading: boolean;
  error: string;
  createJob: (input: CreateCustomerJobInput) => Promise<CustomerJob>;
  requestEftPayment: (jobId: string, transactionReference: string) => Promise<void>;
  getJobById: (jobId: string) => CustomerJob | undefined;
}
const CustomerJobsContext = createContext<CustomerJobsContextValue | undefined>(undefined);

export function CustomerJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  }, []);
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
        status: JobEnum.Working,
        address: input.address,
      }),
    });
    const job = fromApi(saved);
    if (getStoredAccessToken() === token) setJobs(current => [job, ...current.filter(x => x.jobId !== job.jobId)]);
    return job;
  }, []);
  const getJobById = useCallback((id: string) => jobs.find(job => job.jobId === id), [jobs]);
  const requestEftPayment = useCallback(async (jobId: string, transactionReference: string): Promise<void> => {
    await apiRequest('/api/Payment/eft', {
      method: 'POST',
      body: JSON.stringify({ jobId, transactionReference: transactionReference.trim() || null }),
    });
    setJobs(current => current.map(job => job.jobId === jobId
      ? { ...job, paymentStatus: PaymentEnum.Pending, paymentReference: transactionReference.trim() || null, payingMethod: 0 }
      : job));
  }, []);
  const value = useMemo(() => ({ jobs, loading, error, createJob, requestEftPayment, getJobById }), [jobs, loading, error, createJob, requestEftPayment, getJobById]);
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
