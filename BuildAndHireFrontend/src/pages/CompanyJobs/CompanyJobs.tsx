import CompanyLayout from '../../components/CompanyLayout/CompanyLayout';
import JobCard from '../../components/JobCard/JobCard';
import { companyJobs } from '../../data/companyJobs';
import styles from './CompanyJobs.module.css';

export default function CompanyJobs() {
  return (
    <CompanyLayout activeSidebarLink="my-jobs">
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>My Active Jobs</h1>
          <p className={styles.subtitle}>
            Oversee your current construction projects and workforce distribution.
          </p>
        </div>
        <button type="button" className={styles.applicationsButton}>
          See Applications
        </button>
      </div>

      <div className={styles.grid}>
        {companyJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </CompanyLayout>
  );
}