import CompanyLayout from '../../components/CompanyLayout/CompanyLayout';
import JobCard from '../../components/JobCard/JobCard';
import { companyJobs } from '../../data/companyJobs';
import styles from './CompanyJobs.module.css';

export default function CompanyJobs() {
  const activeJobs = companyJobs.filter(
    (job) => job.status !== 'unavailable'
  );

  const unavailableJobs = companyJobs.filter(
    (job) => job.status === 'unavailable'
  );

  return (
    <CompanyLayout activeSidebarLink="my-jobs">
      <div className={styles.headerRow}>
        <div>
          <span className={styles.eyebrow}>
            Company Dashboard
          </span>

          <h1 className={styles.title}>
            My Jobs
          </h1>

          <p className={styles.subtitle}>
            Oversee your construction projects, job status,
            quotes, and payment progress.
          </p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>
              Active Jobs
            </span>

            <span className={styles.summaryValue}>
              {activeJobs.length}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>
              Closed Jobs
            </span>

            <span className={styles.summaryValue}>
              {unavailableJobs.length}
            </span>
          </div>
        </div>
      </div>

      {activeJobs.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                Current Projects
              </span>

              <h2 className={styles.sectionTitle}>
                Active Jobs
              </h2>
            </div>
          </div>

          <div className={styles.grid}>
            {activeJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
              />
            ))}
          </div>
        </>
      )}

      {unavailableJobs.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                Completed / Closed
              </span>

              <h2 className={styles.sectionTitle}>
                Unavailable Jobs
              </h2>
            </div>
          </div>

          <div className={styles.grid}>
            {unavailableJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
              />
            ))}
          </div>
        </>
      )}

      {companyJobs.length === 0 && (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyStateTitle}>
            No Jobs Yet
          </h2>

          <p className={styles.emptyStateText}>
            Jobs created by your company will appear here.
          </p>
        </div>
      )}
    </CompanyLayout>
  );
}