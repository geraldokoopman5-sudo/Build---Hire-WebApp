import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import type { CompanyListing } from '../../types/company';
import { apiRequest } from '../../utils/api';
import styles from './CompanyProfile.module.css';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    apiRequest<CompanyListing[]>('/api/Companies', { signal: controller.signal })
      .then(companies => { if (!controller.signal.aborted) setCompany(companies.find(item => item.companyId === id) ?? null); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load company.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  return <div className={styles.page}>
    <DashboardHeader activeLink="marketplace" />
    {loading ? <main className={styles.notFound}><p role="status">Loading company…</p></main> :
      error || !company ? <main className={styles.notFound}>
        <p role={error ? 'alert' : undefined}>{error || 'Company not found.'}</p>
        <Link to="/marketplace" className={styles.backLink}>Back to Marketplace</Link>
      </main> : <>
        <section className={styles.hero} style={{ backgroundImage: 'linear-gradient(135deg, #543a32, #8d695e)' }}>
          <h1 className={styles.heroTitle}>{company.companyName}</h1>
          <p className={styles.heroSubtitle}>Approved construction company</p>
          <div className={styles.heroButtons}>
            <Link to={`/my-jobs/new?companyId=${encodeURIComponent(company.companyId)}`} className={styles.primaryButton}>
              Create a job with this company
            </Link>
          </div>
        </section>
      </>}
  </div>;
}
