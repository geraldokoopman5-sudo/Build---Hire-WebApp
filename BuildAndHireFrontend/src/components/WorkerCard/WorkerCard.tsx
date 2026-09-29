import {
  WorkerStatus,
  type Worker,
} from '../../types/worker';

import {
  getWorkerStatusLabel,
} from '../../utils/workerLables';

import styles from './WorkerCard.module.css';

interface WorkerCardProps {
  worker: Worker;
  jobTitle?: string;
  onStatusChange: (
    workerId: string,
    status: WorkerStatus
  ) => void;
}

export default function WorkerCard({
  worker,
  jobTitle,
  onStatusChange,
}: WorkerCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.identity}>
        <div className={styles.avatar}>
          {worker.workerFirstName
            .charAt(0)
            .toUpperCase()}

          {worker.workerLastName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className={styles.info}>
          <h3 className={styles.name}>
            {worker.workerFirstName}{' '}
            {worker.workerLastName}
          </h3>

          <p className={styles.id}>
            {worker.workerId}
          </p>
        </div>
      </div>

      <div className={styles.assignment}>
        <span className={styles.label}>
          Assigned Job
        </span>

        <span className={styles.value}>
          {jobTitle ?? worker.jobId}
        </span>
      </div>

      <div className={styles.statusColumn}>
        <span className={styles.label}>
          Status
        </span>

        <select
          value={worker.workerStatus}
          onChange={(event) =>
            onStatusChange(
              worker.workerId,
              Number(
                event.target.value
              ) as WorkerStatus
            )
          }
          className={styles.statusSelect}
        >
          <option value={WorkerStatus.Active}>
            {getWorkerStatusLabel(
              WorkerStatus.Active
            )}
          </option>

          <option value={WorkerStatus.InActive}>
            {getWorkerStatusLabel(
              WorkerStatus.InActive
            )}
          </option>

          <option value={WorkerStatus.Pending}>
            {getWorkerStatusLabel(
              WorkerStatus.Pending
            )}
          </option>

          <option value={WorkerStatus.Available}>
            {getWorkerStatusLabel(
              WorkerStatus.Available
            )}
          </option>

          <option value={WorkerStatus.Unavailable}>
            {getWorkerStatusLabel(
              WorkerStatus.Unavailable
            )}
          </option>
        </select>
      </div>
    </article>
  );
}