import {
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';

import WorkforceHeader from '../../components/WorkforceHeader/WorkforceHeader';
import CompanySidebar from '../../components/CompanySidebar/CompanySidebar';
import WorkerCard from '../../components/WorkerCard/WorkerCard';
import AddWorkerModal from '../../components/AddWorkerModal/AddWorkerModal';

import { useWorkforce } from '../../context/WorkforceContext';
import { useCompanyJobs } from '../../context/CompanyJobsContext';

import {
  WorkerStatus,
} from '../../types/worker';

import styles from './CompanyWorkforce.module.css';

type FilterOption =
  | 'all'
  | WorkerStatus;

interface JobOption {
  id: string;
  title: string;
}

export default function CompanyWorkforce() {
  const {
    workers,
    loading,
    error,
    addWorker,
    updateWorkerStatus,
  } = useWorkforce();
  const { jobs: companyJobs, error: jobsError } = useCompanyJobs();
  const [actionError, setActionError] = useState('');

  const [query, setQuery] =
    useState<string>('');

  const [filter, setFilter] =
    useState<FilterOption>('all');

  const [isAddWorkerOpen, setIsAddWorkerOpen] =
    useState<boolean>(false);

  const companyId = localStorage.getItem('buildandhire.companyId') ?? '';
  const jobs: JobOption[] = companyJobs.map(job => ({ id: job.id, title: job.title }));

  const filteredWorkers =
    useMemo(() => {
      const normalizedQuery =
        query.trim().toLowerCase();

      return workers.filter(
        (worker) => {
          if (
            worker.workerStatus ===
            WorkerStatus.Deleted
          ) {
            return false;
          }

          const fullName =
            `${worker.workerFirstName} ${worker.workerLastName}`
              .toLowerCase();

          const matchesFilter =
            filter === 'all' ||
            worker.workerStatus ===
              filter;

          const matchesQuery =
            fullName.includes(
              normalizedQuery
            ) ||
            worker.jobId
              .toLowerCase()
              .includes(
                normalizedQuery
              );

          return (
            matchesFilter &&
            matchesQuery
          );
        }
      );
    }, [workers, query, filter]);

  const totalActive =
    workers.filter(
      (worker) =>
        worker.workerStatus ===
        WorkerStatus.Active
    ).length;

  const totalAvailable =
    workers.filter(
      (worker) =>
        worker.workerStatus ===
        WorkerStatus.Available
    ).length;

  const totalPending =
    workers.filter(
      (worker) =>
        worker.workerStatus ===
        WorkerStatus.Pending
    ).length;

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setQuery(event.target.value);
  };

  return (
    <div className={styles.page}>
      {loading && <p role="status">Loading workers…</p>}
      {(error || jobsError || actionError) && <p role="alert">{error || jobsError || actionError}</p>}
      <WorkforceHeader
        activeLink="find-talent"
      />

      <div className={styles.body}>
        <CompanySidebar
          activeLink="workforce"
        />

        <main className={styles.content}>
          <div className={styles.headerRow}>
            <div>
              <span className={styles.eyebrow}>
                Company Workforce
              </span>

              <h1 className={styles.title}>
                Team Directory
              </h1>

              <p className={styles.subtitle}>
                Manage your construction personnel
                and monitor their current status.
              </p>
            </div>

            <button
              type="button"
              className={styles.addWorkerButton}
              onClick={() =>
                setIsAddWorkerOpen(true)
              }
            >
              + Add New Worker
            </button>
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                Active
              </span>

              <strong className={styles.summaryValue}>
                {totalActive}
              </strong>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                Available
              </span>

              <strong className={styles.summaryValue}>
                {totalAvailable}
              </strong>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                Pending
              </span>

              <strong className={styles.summaryValue}>
                {totalPending}
              </strong>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                Total Personnel
              </span>

              <strong className={styles.summaryValue}>
                {workers.filter(
                  (worker) =>
                    worker.workerStatus !==
                    WorkerStatus.Deleted
                ).length}
              </strong>
            </div>
          </div>

          <div className={styles.toolbar}>
            <input
              type="search"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search by name or job..."
              className={styles.searchInput}
              aria-label="Search workers"
            />

            <div className={styles.filterGroup}>
              <button
                type="button"
                className={`${styles.filterButton} ${
                  filter === 'all'
                    ? styles.filterButtonActive
                    : ''
                }`}
                onClick={() =>
                  setFilter('all')
                }
              >
                All
              </button>

              <button
                type="button"
                className={`${styles.filterButton} ${
                  filter === WorkerStatus.Active
                    ? styles.filterButtonActive
                    : ''
                }`}
                onClick={() =>
                  setFilter(WorkerStatus.Active)
                }
              >
                Active
              </button>

              <button
                type="button"
                className={`${styles.filterButton} ${
                  filter === WorkerStatus.Available
                    ? styles.filterButtonActive
                    : ''
                }`}
                onClick={() =>
                  setFilter(WorkerStatus.Available)
                }
              >
                Available
              </button>

              <button
                type="button"
                className={`${styles.filterButton} ${
                  filter === WorkerStatus.Pending
                    ? styles.filterButtonActive
                    : ''
                }`}
                onClick={() =>
                  setFilter(WorkerStatus.Pending)
                }
              >
                Pending
              </button>

              <button
                type="button"
                className={`${styles.filterButton} ${
                  filter === WorkerStatus.InActive
                    ? styles.filterButtonActive
                    : ''
                }`}
                onClick={() =>
                  setFilter(WorkerStatus.InActive)
                }
              >
                Inactive
              </button>

              <button
                type="button"
                className={`${styles.filterButton} ${
                  filter === WorkerStatus.Unavailable
                    ? styles.filterButtonActive
                    : ''
                }`}
                onClick={() =>
                  setFilter(WorkerStatus.Unavailable)
                }
              >
                Unavailable
              </button>
            </div>
          </div>

          {filteredWorkers.length === 0 ? (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>
                No Workers Found
              </h2>

              <p className={styles.emptyText}>
                Add a worker or change your
                search/filter to see personnel.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredWorkers.map(
                (worker) => (
                  <WorkerCard
                    key={worker.workerId}
                    worker={worker}
                    onStatusChange={(id, status) => {
                      updateWorkerStatus(id, status).then(() => setActionError(''))
                        .catch((reason: unknown) => setActionError(reason instanceof Error ? reason.message : 'Could not update worker.'));
                    }}
                  />
                )
              )}
            </div>
          )}
        </main>
      </div>

      {isAddWorkerOpen && (
        <AddWorkerModal
          companyId={companyId}
          jobs={jobs}
          onClose={() =>
            setIsAddWorkerOpen(false)
          }
          onCreate={(input) => {
            addWorker(input).then(() => { setActionError(''); setIsAddWorkerOpen(false); })
              .catch((reason: unknown) => setActionError(reason instanceof Error ? reason.message : 'Could not add worker.'));
          }}
        />
      )}
    </div>
  );
}
