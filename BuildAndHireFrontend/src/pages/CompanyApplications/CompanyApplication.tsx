import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CompanyLayout from '../../components/CompanyLayout/CompanyLayout';
import { companyJobs } from '../../data/companyJobs';

import styles from './CompanyApplication.module.css';

type StatusFilter =
  | 'all'
  | 'working'
  | 'available'
  | 'unavailable';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'working':
      return 'Working';

    case 'available':
      return 'Available';

    case 'unavailable':
      return 'Unavailable';

    default:
      return status;
  }
}

export default function CompanyApplications() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] =
    useState<string>('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

  const filteredApplications = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return companyJobs.filter((job) => {
      const matchesStatus =
        statusFilter === 'all' ||
        job.status === statusFilter;

      if (!query) {
        return matchesStatus;
      }

      const searchableText = [
        job.title,
        job.description,
        job.dateRange,
        job.paymentNote,
      ]
        .join(' ')
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(query)
      );
    });
  }, [searchQuery, statusFilter]);

  return (
    <CompanyLayout activeSidebarLink="applications">
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Company Dashboard
          </span>

          <h1 className={styles.title}>
            Applications
          </h1>

          <p className={styles.subtitle}>
            Review job requests associated with your
            company.
          </p>
        </div>

        <div className={styles.total}>
          <span className={styles.totalLabel}>
            Total Applications
          </span>

          <span className={styles.totalValue}>
            {filteredApplications.length}
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Search applications..."
          className={styles.searchInput}
          aria-label="Search applications"
        />

        <div
          className={styles.filterGroup}
          aria-label="Application status"
        >
          <button
            type="button"
            className={`${styles.filterButton} ${
              statusFilter === 'all'
                ? styles.filterButtonActive
                : ''
            }`}
            onClick={() =>
              setStatusFilter('all')
            }
          >
            All
          </button>

          <button
            type="button"
            className={`${styles.filterButton} ${
              statusFilter === 'working'
                ? styles.filterButtonActive
                : ''
            }`}
            onClick={() =>
              setStatusFilter('working')
            }
          >
            Working
          </button>

          <button
            type="button"
            className={`${styles.filterButton} ${
              statusFilter === 'available'
                ? styles.filterButtonActive
                : ''
            }`}
            onClick={() =>
              setStatusFilter('available')
            }
          >
            Available
          </button>

          <button
            type="button"
            className={`${styles.filterButton} ${
              statusFilter === 'unavailable'
                ? styles.filterButtonActive
                : ''
            }`}
            onClick={() =>
              setStatusFilter('unavailable')
            }
          >
            Unavailable
          </button>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <section className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>
            No Applications Found
          </h2>

          <p className={styles.emptyText}>
            No job applications match your current
            search or status filter.
          </p>
        </section>
      ) : (
        <div className={styles.list}>
          {filteredApplications.map((job) => (
            <article
              key={job.id}
              className={styles.applicationCard}
            >
              <div className={styles.applicationMain}>
                <div className={styles.applicationHeader}>
                  <div>
                    <span
                      className={styles.applicationReference}
                    >
                      Application / Job
                    </span>

                    <h2
                      className={
                        styles.applicationTitle
                      }
                    >
                      {job.title}
                    </h2>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status-${job.status}`]
                    }`}
                  >
                    {getStatusLabel(job.status)}
                  </span>
                </div>

                <p className={styles.description}>
                  {job.description}
                </p>

                <div className={styles.detailsGrid}>
                  <div>
                    <span className={styles.detailLabel}>
                      Schedule
                    </span>

                    <span className={styles.detailValue}>
                      {job.dateRange}
                    </span>
                  </div>

                  <div>
                    <span className={styles.detailLabel}>
                      Quote
                    </span>

                    <span className={styles.detailValue}>
                      ${job.quoteAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className={styles.detailLabel}>
                      Payment
                    </span>

                    <span className={styles.detailValue}>
                      {job.paymentNote}
                    </span>
                  </div>

                  <div>
                    <span className={styles.detailLabel}>
                      Paid
                    </span>

                    <span className={styles.detailValue}>
                      ${job.amountPaid.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.applicationActions}>
                <button
                  type="button"
                  className={styles.viewButton}
                  onClick={() =>
                    navigate(
                      `/company/jobs/${job.id}`
                    )
                  }
                >
                  Review Job
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </CompanyLayout>
  );
}