import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  WorkerStatus,
  type Worker,
} from '../types/worker';

interface AddWorkerInput {
  workerFirstName: string;
  workerLastName: string;
  workerStatus: WorkerStatus;
  companyId: string;
  jobId: string;
}

interface WorkforceContextValue {
  workers: Worker[];

  addWorker: (
    input: AddWorkerInput
  ) => Worker;

  updateWorkerStatus: (
    workerId: string,
    status: WorkerStatus
  ) => void;

  assignWorkerToJob: (
    workerId: string,
    jobId: string
  ) => void;

  removeWorkerFromJob: (
    workerId: string
  ) => void;

  deleteWorker: (
    workerId: string
  ) => void;
}

const WorkforceContext =
  createContext<WorkforceContextValue | undefined>(
    undefined
  );

const STORAGE_KEY =
  'build-hire-workforce';

const INITIAL_WORKERS: Worker[] = [];

function loadWorkers(): Worker[] {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return INITIAL_WORKERS;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return INITIAL_WORKERS;
    }

    return parsed as Worker[];
  } catch {
    return INITIAL_WORKERS;
  }
}

export function WorkforceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [workers, setWorkers] =
    useState<Worker[]>(loadWorkers);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(workers)
    );
  }, [workers]);

  const addWorker = (
    input: AddWorkerInput
  ): Worker => {
    const worker: Worker = {
      workerId: crypto.randomUUID(),
      workerFirstName:
        input.workerFirstName.trim(),
      workerLastName:
        input.workerLastName.trim(),
      workerStatus:
        input.workerStatus,
      companyId: input.companyId,
      jobId: input.jobId,
    };

    setWorkers((current) => [
      ...current,
      worker,
    ]);

    return worker;
  };

  const updateWorkerStatus = (
    workerId: string,
    status: WorkerStatus
  ): void => {
    setWorkers((current) =>
      current.map((worker) =>
        worker.workerId === workerId
          ? {
              ...worker,
              workerStatus: status,
            }
          : worker
      )
    );
  };

  const assignWorkerToJob = (
    workerId: string,
    jobId: string
  ): void => {
    setWorkers((current) =>
      current.map((worker) =>
        worker.workerId === workerId
          ? {
              ...worker,
              jobId,
            }
          : worker
      )
    );
  };

  const removeWorkerFromJob = (
    workerId: string
  ): void => {
    setWorkers((current) =>
      current.map((worker) =>
        worker.workerId === workerId
          ? {
              ...worker,
              jobId: '',
            }
          : worker
      )
    );
  };

  const deleteWorker = (
    workerId: string
  ): void => {
    setWorkers((current) =>
      current.map((worker) =>
        worker.workerId === workerId
          ? {
              ...worker,
              workerStatus:
                WorkerStatus.Deleted,
            }
          : worker
      )
    );
  };

  const value = useMemo(
    () => ({
      workers,
      addWorker,
      updateWorkerStatus,
      assignWorkerToJob,
      removeWorkerFromJob,
      deleteWorker,
    }),
    [workers]
  );

  return (
    <WorkforceContext.Provider value={value}>
      {children}
    </WorkforceContext.Provider>
  );
}

export function useWorkforce(): WorkforceContextValue {
  const context =
    useContext(WorkforceContext);

  if (!context) {
    throw new Error(
      'useWorkforce must be used inside WorkforceProvider'
    );
  }

  return context;
}