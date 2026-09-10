import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  CustomerJob,
} from '../types/job';

import type {
  PaymentMethod,
} from '../types/enums';

const STORAGE_KEY =
  'buildandhire.customerJobs';

const CUSTOMER_ID_KEY =
  'buildandhire.devCustomerId';

interface CreateCustomerJobInput {
  companyId: string;
  companyName: string;
  customerId: string;

  jobDescription: string;
  daysWorking: number;

  startDate: string;
  endDate: string;

  payingMethod: PaymentMethod | null;

  address: {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: number;
  };
}

interface CustomerJobsContextValue {
  jobs: CustomerJob[];

  createJob: (
    input: CreateCustomerJobInput
  ) => CustomerJob;

  getJobById: (
    jobId: string
  ) => CustomerJob | undefined;
}

const CustomerJobsContext =
  createContext<
    CustomerJobsContextValue | undefined
  >(undefined);

function getCustomerId(): string {
  const existing =
    localStorage.getItem(
      CUSTOMER_ID_KEY
    );

  if (existing) {
    return existing;
  }

  const generated =
    crypto.randomUUID();

  localStorage.setItem(
    CUSTOMER_ID_KEY,
    generated
  );

  return generated;
}

function loadJobs(): CustomerJob[] {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? (parsed as CustomerJob[])
      : [];
  } catch {
    return [];
  }
}

export function CustomerJobsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [jobs, setJobs] =
    useState<CustomerJob[]>(loadJobs);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(jobs)
    );
  }, [jobs]);

  const createJob = (
    input: CreateCustomerJobInput
  ): CustomerJob => {
    const job: CustomerJob = {
      jobId: crypto.randomUUID(),

      companyId: input.companyId,
      companyName:
        input.companyName,

      customerId:
        input.customerId,

      jobDescription:
        input.jobDescription.trim(),

      daysWorking:
        input.daysWorking,

      /*
       * No quote exists at creation time.
       */
      qoute: 0,

      startDate:
        input.startDate,

      endDate:
        input.endDate,

      payingMethod:
        input.payingMethod,

      /*
       * This mirrors the current frontend
       * job state model.
       */
      status: 'working',

      address: input.address,

      createdAt:
        new Date().toISOString(),
    };

    setJobs((current) => [
      job,
      ...current,
    ]);

    return job;
  };

  const getJobById = (
    jobId: string
  ): CustomerJob | undefined => {
    return jobs.find(
      (job) => job.jobId === jobId
    );
  };

  const value = useMemo(
    () => ({
      jobs,
      createJob,
      getJobById,
    }),
    [jobs]
  );

  return (
    <CustomerJobsContext.Provider
      value={value}
    >
      {children}
    </CustomerJobsContext.Provider>
  );
}

export function useCustomerJobs(): CustomerJobsContextValue {
  const context =
    useContext(CustomerJobsContext);

  if (!context) {
    throw new Error(
      'useCustomerJobs must be used inside CustomerJobsProvider'
    );
  }

  return context;
}

export function getCurrentCustomerId(): string {
  return getCustomerId();
}