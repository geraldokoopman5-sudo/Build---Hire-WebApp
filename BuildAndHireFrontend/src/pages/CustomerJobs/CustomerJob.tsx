import {
  Link,
  useNavigate,
} from 'react-router-dom';

import JobsHeader from '../../components/JobsHeader/JobsHeader';

import {
  getCurrentCustomerId,
  useCustomerJobs,
} from '../../context/CustomerJobsContext';

import styles from './CustomerJobs.module.css';

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
      month: 'short',
      year: 'numeric',
    }
  ).format(date);
}

function getStatusLabel(
  status: string
): string {
  switch (status) {
    case 'working':
      return 'Working';

    case 'available':
      return 'Available';

    case 'unavailable':
      return 'Unavailable';

    default:
      return 'Unknown';
  }
}

export default function CustomerJobs() {
  const navigate = useNavigate();

  const {
    jobs,
  } = useCustomerJobs();

  const customerId =
    getCurrentCustomerId();

  const customerJobs =
    jobs.filter(
      (job) =>
        job.customerId === customerId
    );

  return (
    <div className={styles.page}>
      <JobsHeader activeLink="my-jobs" />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Customer Dashboard
            </span>

            <h1 className={styles.title}>
              My Jobs
            </h1>

            <p className={styles.subtitle}>
              Track your project requests, schedules,
              quotes, and payment details.
            </p>
          </div>

          <Link
            to="/my-jobs/new"
            className={styles.createButton}
          >
            + Post a Project
          </Link>
        </div>

        {customerJobs.length === 0 ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              +
            </div>

            <h2 className={styles.emptyTitle}>
              No Jobs Yet
            </h2>

            <p className={styles.emptyText}>
              Create your first project request and
              it will appear here.
            </p>

            <Link
              to="/my-jobs/new"
              className={styles.emptyButton}
            >
              Post a Project
            </Link>
          </section>
        ) : (
          <div className={styles.list}>
            {customerJobs.map(
              (job) => (
                <article
                  key={job.jobId}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <div>
                      <span
                        className={
                          styles.reference
                        }
                      >
                        Job Reference
                      </span>

                      <h2
                        className={
                          styles.cardTitle
                        }
                      >
                        {job.jobId}
                      </h2>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        styles[
                          `status-${job.status}`
                        ]
                      }`}
                    >
                      {getStatusLabel(
                        job.status
                      )}
                    </span>
                  </div>

                  <p
                    className={
                      styles.companyName
                    }
                  >
                    {job.companyName}
                  </p>

                  <p
                    className={
                      styles.description
                    }
                  >
                    {job.jobDescription}
                  </p>

                  <div
                    className={
                      styles.detailsGrid
                    }
                  >
                    <div>
                      <span
                        className={
                          styles.detailLabel
                        }
                      >
                        Start
                      </span>

                      <span
                        className={
                          styles.detailValue
                        }
                      >
                        {formatDate(
                          job.startDate
                        )}
                      </span>
                    </div>

                    <div>
                      <span
                        className={
                          styles.detailLabel
                        }
                      >
                        End
                      </span>

                      <span
                        className={
                          styles.detailValue
                        }
                      >
                        {formatDate(
                          job.endDate
                        )}
                      </span>
                    </div>

                    <div>
                      <span
                        className={
                          styles.detailLabel
                        }
                      >
                        Duration
                      </span>

                      <span
                        className={
                          styles.detailValue
                        }
                      >
                        {job.daysWorking} days
                      </span>
                    </div>

                    <div>
                      <span
                        className={
                          styles.detailLabel
                        }
                      >
                        Quote
                      </span>

                      <span
                        className={
                          styles.detailValue
                        }
                      >
                        {job.qoute > 0
                          ? `$${job.qoute.toLocaleString()}`
                          : 'Awaiting quote'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      styles.address
                    }
                  >
                    {job.address.streetAddress}
                    , {job.address.suburb},{' '}
                    {job.address.city},{' '}
                    {job.address.province}{' '}
                    {job.address.postalCode}
                  </div>

                  <button
                    type="button"
                    className={
                      styles.viewButton
                    }
                    onClick={() =>
                      navigate(
                        `/my-jobs/${job.jobId}`
                      )
                    }
                  >
                    View Job
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}