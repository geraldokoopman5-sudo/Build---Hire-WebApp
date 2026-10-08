import { useEffect, useState, type ChangeEvent } from 'react';
import AppHeader from '../../components/AppHeader/AppHeader';
import CompanyCard from '../../components/CompanyCard/CompanyCard';
import type { CompanyListing } from '../../types/company';
import { apiRequest } from '../../utils/api';
import styles from './Marketplace.module.css';

export default function Marketplace() {
  const [query, setQuery] = useState<string>('');
  const [companies, setCompanies] = useState<CompanyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    apiRequest<CompanyListing[]>('/api/Companies', { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setCompanies(data); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load companies.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.main}>
        {loading && <p role="status">Loading companies…</p>}
        {error && <p role="alert">{error}</p>}
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search construction companies..."
            value={query}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.grid}>
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.companyId} company={company} />
          ))}
        </div>

        {!loading && !error && filteredCompanies.length === 0 && (
          <p className={styles.noResults}>No approved companies match your search.</p>
        )}
      </main>
    </div>
  );
}
