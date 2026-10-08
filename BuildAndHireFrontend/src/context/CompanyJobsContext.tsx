/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { AccountType, PaymentEnum } from '../types/enums';
import type { CompanyJob, CustomerJob, JobStatus } from '../types/job';
import { apiRequest } from '../utils/api';
import { getStoredAccountType } from '../utils/auth';
import { customerJobStatusFromApi } from '../utils/jobStatus';
import { useApiResource, dataChanged } from '../hooks/useApiResource';
import { useSession } from '../hooks/useSession';

type ApiJob = Omit<CustomerJob, 'status'> & { status: number };
export type CompanyTransition = 'accept' | 'reject' | 'start' | 'complete';
interface CompanyJobsValue {
  jobs: CompanyJob[]; loading: boolean; error: string; refreshJobs: () => void;
  transitionJob: (id: string, action: CompanyTransition) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  updateJobQuote: (id: string, quote: number) => Promise<void>;
  updateJobEndDate: (id: string, endDate: string) => Promise<void>;
}
const CompanyJobsContext = createContext<CompanyJobsValue | undefined>(undefined);
function fromApi(job: ApiJob): CompanyJob {
  const date = (value: string) => new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return { ...job, id: job.jobId, status: customerJobStatusFromApi(job.status), title: job.jobDescription.length > 60 ? job.jobDescription.slice(0, 57) + '…' : job.jobDescription,
    description: job.jobDescription, dateRange: date(job.startDate) + ' – ' + date(job.endDate), quoteAmount: job.quote, amountPaid: job.amountPaid ?? 0,
    paymentState: job.paymentStatus === PaymentEnum.Successful ? 'successful' : job.paymentStatus === PaymentEnum.Failed || job.paymentStatus === PaymentEnum.Refunded ? 'on-hold' : 'pending',
    paymentNote: job.paymentReference ?? 'No reference', paymentRequested: job.paymentStatus != null };
}
export function CompanyJobsProvider({ children }: { children: ReactNode }) {
  useSession();
  const resource = useApiResource<ApiJob[]>('/api/Jobs', getStoredAccountType() === AccountType.Company);
  const jobs = (resource.data ?? []).map(fromApi);
  const mutate = async (id: string, action: string, body?: object) => {
    await apiRequest(`/api/Jobs/${id}/${action}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
    dataChanged();
  };
  const transitionJob = (id: string, action: CompanyTransition) => mutate(id, action);
  const updateJobStatus = (id: string, status: JobStatus) => {
    const action = ({ accepted: 'accept', rejected: 'reject', 'in-progress': 'start', completed: 'complete' } as Partial<Record<JobStatus, CompanyTransition>>)[status];
    if (!action) return Promise.reject(new Error('Use a supported job lifecycle action.'));
    return transitionJob(id, action);
  };
  const updateJobQuote = (id: string, quote: number) => {
    if (!Number.isFinite(quote) || quote <= 0 || quote > 99999999.99 || Math.abs(quote * 100 - Math.round(quote * 100)) > 0.00001) return Promise.reject(new Error('Enter a positive quote with at most two decimal places, up to 99999999.99.'));
    return mutate(id, 'quote', { quote });
  };
  const updateJobEndDate = async (id: string, endDate: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) throw new Error('Job not found. Refresh your projects.');
    await apiRequest(`/api/Jobs/${id}`, { method: 'PUT', body: JSON.stringify({ quote: job.quoteAmount, endDate, payingMethod: job.payingMethod ?? null }) });
    dataChanged();
  };
  return <CompanyJobsContext.Provider value={{ jobs, loading: resource.loading, error: resource.error, refreshJobs: resource.refresh, transitionJob, updateJobStatus, updateJobQuote, updateJobEndDate }}>{children}</CompanyJobsContext.Provider>;
}
export function useCompanyJobs() { const value = useContext(CompanyJobsContext); if (!value) throw new Error('CompanyJobsProvider is required.'); return value; }
