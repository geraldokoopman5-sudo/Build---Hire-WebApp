import { Link } from 'react-router-dom';
import type { CompanyProfile } from '../../types/company';
import styles from './CompanyCard.module.css';

interface CompanyCardProps {
  company: CompanyProfile;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={company.imageUrl} alt={company.companyName} className={styles.image} />
      </div>

      <div className={styles.metaRow}>
        <span className={styles.category}>{company.category}</span>
        <span className={styles.rating}>★ {company.rating.toFixed(1)}</span>
      </div>

      <h3 className={styles.name}>{company.companyName}</h3>
      <p className={styles.description}>{company.about}</p>

      <Link to={`/companies/${company.id}`} className={styles.button}>
        View Portfolio
      </Link>
    </div>
  );
}