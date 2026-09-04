import type { Worker } from '../../types/worker';
import { getWorkerStatusLabel } from '../../utils/workerLables';
import styles from './WorkerCard.module.css';

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <div className={styles.card}>
      <img src={worker.photoUrl} alt={worker.name} className={styles.photo} />

      <div className={styles.info}>
        <h3 className={styles.name}>{worker.name}</h3>
        <p className={styles.role}>{worker.role}</p>
      </div>

      <div className={styles.statusColumn}>
        <span className={`${styles.statusBadge} ${styles[`status-${worker.status}`]}`}>
          {getWorkerStatusLabel(worker.status)}
        </span>
        {worker.currentProject ? (
          <span className={styles.projectLine}>{worker.currentProject}</span>
        ) : (
          <span className={styles.projectLineEmpty}>—</span>
        )}
      </div>
    </div>
  );
}