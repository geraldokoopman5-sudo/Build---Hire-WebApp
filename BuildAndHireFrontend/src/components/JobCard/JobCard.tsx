import type { CompanyJob } from '../../types/job';
import { getJobStatusLabel, getPaymentStateLabel } from '../../utils/jobLabels';
import styles from './JobCard.module.css';

interface JobCardProps {
  job: CompanyJob;
}

export default function JobCard({ job }: JobCardProps) {
  const isUnavailable = job.status === 'unavailable';

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <span className={`${styles.statusBadge} ${styles[`status-${job.status}`]}`}>
          {getJobStatusLabel(job.status)}
        </span>
        <button type="button" className={styles.menuButton} aria-label="More options">
          ⋮
        </button>
      </div>

      <h3 className={styles.title}>{job.title}</h3>
      <p className={styles.description}> {job.description}</p>

      <p className={styles.meta}>
         {job.dateRange} &nbsp;&nbsp;  ${job.quoteAmount.toLocaleString()} Quote
      </p>

      <div className={styles.paymentBox}>
        <div className={styles.paymentTopRow}>
          <span className={styles.paymentLabel}>Payment Status</span>
          <span className={`${styles.paymentBadge} ${styles[`payment-${job.paymentState}`]}`}>
            {getPaymentStateLabel(job.paymentState)}
          </span>
        </div>
        <div className={styles.paymentBottomRow}>
          <span className={styles.amountPaid}>${job.amountPaid.toLocaleString()} Paid</span>
          <span className={styles.paymentNote}>{job.paymentNote}</span>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button
          type="button"
          className={`${styles.manageButton} ${isUnavailable ? styles.manageButtonDisabled : ''}`}
          disabled={isUnavailable}
        >
          Manage Job
        </button>
        <button type="button" className={styles.viewButton} aria-label="View job">
        
        </button>
      </div>
    </div>
  );
}