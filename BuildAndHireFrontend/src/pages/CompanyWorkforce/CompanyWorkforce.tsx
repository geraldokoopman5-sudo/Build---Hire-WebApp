import { useState, type ChangeEvent } from 'react';
import WorkforceHeader from '../../components/WorkforceHeader/WorkforceHeader';
import CompanySidebar from '../../components/CompanySidebar/CompanySidebar';
import WorkerCard from '../../components/WorkerCard/WorkerCard';
import { workers } from '../../data/workers';
import type { WorkerStatus } from '../../types/worker';
import styles from './CompanyWorkforce.module.css';

type FilterOption = 'all' | WorkerStatus;

export default function CompanyWorkforce() {
  const [query, setQuery] = useState<string>('');
  const [filter, setFilter] = useState<FilterOption>('all');

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesFilter = filter === 'all' || worker.status === filter;
    const matchesQuery =
      worker.name.toLowerCase().includes(query.toLowerCase()) ||
      worker.role.toLowerCase().includes(query.toLowerCase()) ||
      (worker.currentProject?.toLowerCase().includes(query.toLowerCase()) ?? false);

    return matchesFilter && matchesQuery;
  });

  const totalActive = workers.filter((worker) => worker.status === 'active').length;

  return (
    <div className={styles.page}>
      <WorkforceHeader activeLink="my-projects" />

      <div className={styles.body}>
        <CompanySidebar activeLink="workforce" />

        <main className={styles.content}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>Team Directory</h1>
              <p className={styles.subtitle}>Real-time status monitoring for construction personnel.</p>
            </div>
            <button type="button" className={styles.addWorkerButton}>
              + Add New Worker
            </button>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, role, or project..."
                value={query}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <button
                type="button"
                className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
                onClick={() => setFilter('all')}
              >
                All Workers
              </button>
              <button
                type="button"
                className={`${styles.filterButton} ${filter === 'active' ? styles.filterButtonActive : ''}`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button
                type="button"
                className={`${styles.filterButton} ${filter === 'available' ? styles.filterButtonActive : ''}`}
                onClick={() => setFilter('available')}
              >
                Available
              </button>
            </div>
          </div>

          <div className={styles.grid}>
            {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>

          {filteredWorkers.length === 0 && (
            <p className={styles.noResults}>No workers match your search.</p>
          )}

          <div className={styles.statsRow}>
            <div className={`${styles.statCard} ${styles.statCardPink}`}>
              <span className={styles.statLabel}>Total Active</span>
              <span className={styles.statValue}>
                {totalActive} <span className={styles.statUnit}>Personnel</span>
              </span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardBrown}`}>
              <span className={styles.statLabel}>Projects Live</span>
              <span className={styles.statValue}>
                08 <span className={styles.statUnit}>Active Sites</span>
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Efficiency Rating</span>
              <span className={styles.statValueAccent}>
                94% <span className={styles.statUnit}>Avg. Uptime</span>
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}