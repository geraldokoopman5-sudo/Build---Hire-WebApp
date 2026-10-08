import { Link } from 'react-router-dom';
import type { CompanyListing } from '../../types/company';
import styles from './CompanyCard.module.css';

interface CompanyCardProps {
  company: CompanyListing;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper} aria-hidden="true" />

      <div className={styles.metaRow}>
        <span className={styles.category}>Approved company</span>
      </div>

      <h3 className={styles.name}>{company.companyName}</h3>
      <p className={styles.description}>View this company and create a job request.</p>

      <Link to={`/companies/${company.companyId}`} className={styles.button}>
        View Company
      </Link>
    </div>
  );
}
