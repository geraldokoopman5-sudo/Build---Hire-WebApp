import { useState, type ChangeEvent } from 'react';
import AppHeader from '../../components/AppHeader/AppHeader';
import CompanyCard from '../../components/CompanyCard/CompanyCard';
import { companies } from '../../data/companies';
import styles from './Marketplace.module.css';

export default function Marketplace() {
  const [query, setQuery] = useState<string>('');

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
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <p className={styles.noResults}>No companies match your search.</p>
        )}
      </main>
    </div>
  );
}