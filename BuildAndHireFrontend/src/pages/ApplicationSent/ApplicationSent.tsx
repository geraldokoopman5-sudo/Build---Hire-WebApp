import { useParams, Link } from 'react-router-dom';
import styles from './ApplicationSent.module.css';

export default function ApplicationSent() {
  const { reference } = useParams<{ reference: string }>();
  const referenceNumber = reference ?? 'REF-0000-XX';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className={styles.title}>Application Sent</h1>
        <p className={styles.subtitle}>
          Your job application has been successfully submitted. We&apos;ll notify you once the
          company has reviewed your request.
        </p>

        <div className={styles.referenceBox}>
          <span className={styles.referenceLabel}>Reference Number</span>
          <span className={styles.referenceValue}>{referenceNumber}</span>
        </div>

        <span className={styles.nextStepsLabel}>Next Steps</span>

        <ol className={styles.stepList}>
          <li className={styles.step}>
            <span className={`${styles.stepIcon} ${styles.stepIconActive}`} aria-hidden="true">
              
            </span>
            <div className={styles.stepText}>
              <span className={styles.stepTitle}>Company Reviewing</span>
              <span className={styles.stepDescription}>Usually takes 1-2 business days.</span>
            </div>
          </li>

          <li className={styles.step}>
            <span className={styles.stepIcon} aria-hidden="true">
              
            </span>
            <div className={styles.stepText}>
              <span className={styles.stepTitlePending}>Quote Issued</span>
            </div>
          </li>

          <li className={styles.step}>
            <span className={styles.stepIcon} aria-hidden="true">
              
            </span>
            <div className={styles.stepText}>
              <span className={styles.stepTitlePending}>Payment</span>
            </div>
          </li>

          <li className={`${styles.step} ${styles.stepLast}`}>
            <span className={styles.stepIcon} aria-hidden="true">
              
            </span>
            <div className={styles.stepText}>
              <span className={styles.stepTitlePending}>Workers Deployed</span>
            </div>
          </li>
        </ol>

        <Link to="/home" className={styles.viewJobsButton}>
        Back to Home
      </Link>
      </div>
    </div>
  );
}