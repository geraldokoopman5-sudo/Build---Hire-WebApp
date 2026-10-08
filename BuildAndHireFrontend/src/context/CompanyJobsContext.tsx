/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccountType, PaymentEnum, type PaymentMethod } from '../types/enums';
import type { CompanyJob, JobStatus } from '../types/job';
import { apiRequest } from '../utils/api';
import { getStoredAccessToken, getStoredAccountType } from '../utils/auth';
import { jobStatusFromApi, jobStatusToApi } from '../utils/jobStatus';

interface ApiJob {
  jobId: string;
  jobDescription: string;
  quote: number;
  startDate: string;
  endDate: string;
  status: number;
  payingMethod: PaymentMethod | null;
  paymentStatus: number | null;
  amountPaid: number;
  paymentReference: string | null;
}
interface CompanyJobsValue {
  jobs: CompanyJob[];
  loading: boolean;
  error: string;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  updateJobQuote: (id: string, quote: number) => Promise<void>;
}
const CompanyJobsContext = createContext<CompanyJobsValue | undefined>(undefined);
function toCompanyJob(job: ApiJob): CompanyJob {
  const format = (value: string) => new Date(value).toLocaleDateString();
  return {
    id: job.jobId,
    status: jobStatusFromApi(job.status),
    title: job.jobDescription.length > 50 ? `${job.jobDescription.slice(0, 47)}…` : job.jobDescription,
    description: job.jobDescription,
    dateRange: `${format(job.startDate)} – ${format(job.endDate)}`,
    quoteAmount: job.quote,
    amountPaid: job.amountPaid,
    paymentState: job.paymentStatus === PaymentEnum.Successful ? 'successful' :
      job.paymentStatus === PaymentEnum.Failed || job.paymentStatus === PaymentEnum.Refunded ? 'on-hold' : 'pending',
    paymentNote: job.paymentReference ?? (job.paymentStatus == null ? 'No payment recorded' :
      job.paymentStatus === PaymentEnum.Successful ? 'Payment recorded' :
      job.paymentStatus === PaymentEnum.Failed ? 'Payment failed' :
      job.paymentStatus === PaymentEnum.Refunded ? 'Payment refunded' : 'Payment pending'),
    paymentRequested: job.paymentStatus != null,
  };
}
export function CompanyJobsProvider({ children }: { children: ReactNode }) {
  const [rawJobs, setRawJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let controller: AbortController | undefined;
    const reload = () => {
      controller?.abort();
      controller = new AbortController();
      setRawJobs([]);
      if (!getStoredAccessToken() || getStoredAccountType() !== AccountType.Company) {
        setLoading(false); return;
      }
      setLoading(true);
      const signal = controller.signal;
      apiRequest<ApiJob[]>('/api/Jobs', { signal })
        .then(data => { if (!signal.aborted) { setRawJobs(data); setError(''); } })
        .catch((reason: unknown) => { if (!signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load jobs.'); })
        .finally(() => { if (!signal.aborted) setLoading(false); });
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
  const updateJobStatus = useCallback(async (id: string, status: JobStatus) => {
    const job = rawJobs.find(item => item.jobId === id);
    if (!job) throw new Error('Job not found.');
    await apiRequest(`/api/Jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quote: job.quote, endDate: job.endDate,
        payingMethod: job.payingMethod, status: jobStatusToApi[status] }),
    });
    setRawJobs(current => current.map(item => item.jobId === id ? { ...item, status: jobStatusToApi[status] } : item));
  }, [rawJobs]);
  const updateJobQuote = useCallback(async (id: string, quote: number) => {
    if (!Number.isFinite(quote) || quote <= 0) throw new Error('Enter a quote greater than zero.');
    const job = rawJobs.find(item => item.jobId === id);
    if (!job) throw new Error('Job not found.');
    if (job.paymentStatus != null) throw new Error('The quote is locked because a payment request exists.');
    await apiRequest(`/api/Jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quote, endDate: job.endDate,
        payingMethod: job.payingMethod, status: job.status }),
    });
    setRawJobs(current => current.map(item => item.jobId === id ? { ...item, quote } : item));
  }, [rawJobs]);
  const jobs = useMemo(() => rawJobs.map(toCompanyJob), [rawJobs]);
  const value = useMemo(() => ({ jobs, loading, error, updateJobStatus, updateJobQuote }),
    [jobs, loading, error, updateJobStatus, updateJobQuote]);
  return <CompanyJobsContext.Provider value={value}>{children}</CompanyJobsContext.Provider>;
}
export function useCompanyJobs(): CompanyJobsValue {
  const value = useContext(CompanyJobsContext);
  if (!value) throw new Error('useCompanyJobs must be used inside CompanyJobsProvider');
  return value;
}
