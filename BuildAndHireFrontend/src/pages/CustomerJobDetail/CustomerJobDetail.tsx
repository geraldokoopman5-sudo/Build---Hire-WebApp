import {
  Link,
  useParams,
} from 'react-router-dom';

import JobsHeader from '../../components/JobsHeader/JobsHeader';

import {
  getCurrentCustomerId,
  useCustomerJobs,
} from '../../context/CustomerJobsContext';

import styles from './CustomerJobDetails.module.css';

function formatDate(
  value: string
): string {
  const date =
    new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  ).format(date);
}

export default function CustomerJobDetails() {
  const {
    jobId,
  } = useParams<{
    jobId: string;
  }>();

  const {
    getJobById,
  } = useCustomerJobs();

  const job =
    jobId
      ? getJobById(jobId)
      : undefined;

  const currentCustomerId =
    getCurrentCustomerId();

  if (
    !job ||
    job.customerId !==
      currentCustomerId
  ) {
    return (
      <div className={styles.page}>
        <JobsHeader activeLink="my-jobs" />

        <main className={styles.notFound}>
          <h1>
            Job Not Found
          </h1>

          <p>
            The job you are looking for does
            not exist or does not belong to
            this account.
          </p>

          <Link
            to="/my-jobs"
            className={styles.backButton}
          >
            Back to My Jobs
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <JobsHeader activeLink="my-jobs" />

      <main className={styles.main}>
        <Link
          to="/my-jobs"
          className={styles.backLink}
        >
          ← Back to My Jobs
        </Link>

        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Job Details
            </span>

            <h1 className={styles.title}>
              Project Request
            </h1>

            <p className={styles.reference}>
              {job.jobId}
            </p>
          </div>

          <span
            className={`${styles.statusBadge} ${
              styles[`status-${job.status}`]
            }`}
          >
            {job.status}
          </span>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <span className={styles.sectionEyebrow}>
              Company
            </span>

            <h2 className={styles.cardTitle}>
              {job.companyName}
            </h2>

            <span className={styles.detailLabel}>
              Company ID
            </span>

            <p className={styles.detailValue}>
              {job.companyId}
            </p>
          </section>

          <section className={styles.card}>
            <span className={styles.sectionEyebrow}>
              Schedule
            </span>

            <div className={styles.row}>
              <span>Start Date</span>
              <strong>
                {formatDate(
                  job.startDate
                )}
              </strong>
            </div>

            <div className={styles.row}>
              <span>End Date</span>
              <strong>
                {formatDate(
                  job.endDate
                )}
              </strong>
            </div>

            <div className={styles.row}>
              <span>Days Working</span>
              <strong>
                {job.daysWorking}
              </strong>
            </div>
          </section>

          <section className={styles.card}>
            <span className={styles.sectionEyebrow}>
              Project
            </span>

            <h2 className={styles.cardTitle}>
              Job Description
            </h2>

            <p className={styles.description}>
              {job.jobDescription}
            </p>
          </section>

          <section className={styles.card}>
            <span className={styles.sectionEyebrow}>
              Financial
            </span>

            <div className={styles.row}>
              <span>Quote</span>
              <strong>
                {job.qoute > 0
                  ? `$${job.qoute.toLocaleString()}`
                  : 'Awaiting quote'}
              </strong>
            </div>

            <div className={styles.row}>
              <span>Payment Method</span>
              <strong>
                {job.payingMethod === null
                  ? 'Not selected'
                  : String(
                      job.payingMethod
                    )}
              </strong>
            </div>
          </section>

          <section
            className={`${styles.card} ${styles.fullWidth}`}
          >
            <span className={styles.sectionEyebrow}>
              Location
            </span>

            <p className={styles.address}>
              {job.address.streetAddress},{' '}
              {job.address.suburb},{' '}
              {job.address.city},{' '}
              {job.address.province},{' '}
              {job.address.postalCode}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}