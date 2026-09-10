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
    addWorker,
    updateWorkerStatus,
  } = useWorkforce();

  const [query, setQuery] =
    useState<string>('');

  const [filter, setFilter] =
    useState<FilterOption>('all');

  const [isAddWorkerOpen, setIsAddWorkerOpen] =
    useState<boolean>(false);

  /*
   * Temporary frontend-only company ID.
   * This will come from authenticated user/company
   * data once the API is connected.
   */
  const companyId =
    '00000000-0000-0000-0000-000000000001';

  /*
   * Temporary local job source.
   *
   * This should eventually come from:
   * GET /api/jobs/company/{companyId}
   *
   * For now, use your existing companyJobs mapping
   * if that data already exists in the frontend.
   */
  const jobs: JobOption[] = [];

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
                    onStatusChange={
                      updateWorkerStatus
                    }
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
            addWorker(input);
            setIsAddWorkerOpen(false);
          }}
        />
      )}
    </div>
  );
}