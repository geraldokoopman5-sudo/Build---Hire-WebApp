import { useWorkforce } from '../../context/WorkforceContext';
import {
  WorkerStatus,
  type Worker,
} from '../../types/worker';

import {
  getWorkerStatusLabel,
} from '../../utils/workerLables';

import styles from './JobWorkers.module.css';

interface JobWorkersProps {
  jobId: string;
}

export default function JobWorkers({
  jobId,
}: JobWorkersProps) {
  const {
    workers,
    removeWorkerFromJob,
  } = useWorkforce();

  const assignedWorkers: Worker[] =
    workers.filter(
      (worker) =>
        worker.jobId === jobId &&
        worker.workerStatus !==
          WorkerStatus.Deleted
    );

  if (assignedWorkers.length === 0) {
    return (
      <div className={styles.empty}>
        <h3 className={styles.emptyTitle}>
          No Workers Assigned
        </h3>

        <p className={styles.emptyText}>
          Workers assigned to this job will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {assignedWorkers.map((worker) => {
        const initials =
          `${worker.workerFirstName.charAt(0)}${worker.workerLastName.charAt(0)}`
            .toUpperCase();

        return (
          <article
            key={worker.workerId}
            className={styles.worker}
          >
            <div className={styles.identity}>
              <div className={styles.avatar}>
                {initials}
              </div>

              <div className={styles.workerInfo}>
                <h3 className={styles.workerName}>
                  {worker.workerFirstName}{' '}
                  {worker.workerLastName}
                </h3>

                <span className={styles.workerId}>
                  {worker.workerId}
                </span>
              </div>
            </div>

            <div className={styles.workerStatus}>
              <span className={styles.statusLabel}>
                Status
              </span>

              <span className={styles.status}>
                {getWorkerStatusLabel(
                  worker.workerStatus
                )}
              </span>
            </div>

            <button
              type="button"
              className={styles.removeButton}
              onClick={() =>
                removeWorkerFromJob(
                  worker.workerId
                )
              }
            >
              Remove
            </button>
          </article>
        );
      })}
    </div>
  );
}