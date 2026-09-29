import { useNavigate } from 'react-router-dom';

import type { CompanyJob } from '../../types/job';
import {
  getJobStatusLabel,
  getPaymentStateLabel,
} from '../../utils/jobLabels';

import styles from './JobCard.module.css';

interface JobCardProps {
  job: CompanyJob;
}

export default function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();

  const isUnavailable =
    job.status === 'unavailable';

  const handleManageJob = (): void => {
    navigate(`/company/jobs/${job.id}`);
  };

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <span
          className={`${styles.statusBadge} ${
            styles[`status-${job.status}`]
          }`}
        >
          {getJobStatusLabel(job.status)}
        </span>
      </div>

      <h3 className={styles.title}>
        {job.title}
      </h3>

      <p className={styles.description}>
        {job.description}
      </p>

      <div className={styles.meta}>
        <span>{job.dateRange}</span>

        <span>
          ${job.quoteAmount.toLocaleString()} Quote
        </span>
      </div>

      <div className={styles.paymentBox}>
        <div className={styles.paymentTopRow}>
          <span className={styles.paymentLabel}>
            Payment Status
          </span>

          <span
            className={`${styles.paymentBadge} ${
              styles[`payment-${job.paymentState}`]
            }`}
          >
            {getPaymentStateLabel(job.paymentState)}
          </span>
        </div>

        <div className={styles.paymentBottomRow}>
          <span className={styles.amountPaid}>
            ${job.amountPaid.toLocaleString()} Paid
          </span>

          <span className={styles.paymentNote}>
            {job.paymentNote}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.manageButton} ${
          isUnavailable
            ? styles.manageButtonClosed
            : ''
        }`}
        onClick={handleManageJob}
      >
        {isUnavailable
          ? 'View Job'
          : 'Manage Job'}
      </button>
    </article>
  );
}