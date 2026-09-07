import { useState, type ChangeEvent } from 'react';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import AdminStatCard from '../../components/AdminStatCard/AdminStatcard';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { platformCompanies as initialCompanies } from '../../data/PlatformCompanies';
import { platformCustomers as initialCustomers } from '../../data/platformCustomer';
import { getPlatformStatusLabel, getPlatformStatusTone } from '../../utils/platformStatusLables';
import { AccountStatus } from '../../types/enums';
import type { PlatformCompany, PlatformCustomer } from '../../types/platformEntity';
import styles from './AdminPortal.module.css';

type EntityTab = 'companies' | 'customers';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<EntityTab>('companies');
  const [companies, setCompanies] = useState<PlatformCompany[]>(initialCompanies);
  const [customers, setCustomers] = useState<PlatformCustomer[]>(initialCustomers);
  const [query, setQuery] = useState<string>('');

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  const updateCompanyStatus = (id: string, status: AccountStatus): void => {
    setCompanies((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  };

  const updateCustomerStatus = (id: string, status: AccountStatus): void => {
    setCustomers((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  };

  const filteredCompanies = companies.filter((entry) =>
    entry.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredCustomers = customers.filter((entry) =>
    entry.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalFirms = companies.length;
  const pendingReview = companies.filter((entry) => entry.status === AccountStatus.Pending).length;
  const flaggedCount =
    companies.filter((entry) => entry.isFlagged).length +
    customers.filter((entry) => entry.isFlagged).length;

  return (
    <div className={styles.page}>
      <AdminHeader />

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>
            Oversee platform activity, manage entity verification, and monitor marketplace health
            from a centralized organic interface.
          </p>
        </div>

        <div className={styles.tabToggle}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'companies' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            Companies
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'customers' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <AdminStatCard label="Total Firms" value={totalFirms} icon={<span></span>} />
        <AdminStatCard label="Pending Review" value={pendingReview} icon={<span></span>} />
        <AdminStatCard label="Flagged" value={flaggedCount} icon={<span></span>} accent="danger" />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>
            {activeTab === 'companies' ? 'Construction Firms' : 'Customers'}
          </h2>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder={activeTab === 'companies' ? 'Search companies...' : 'Search customers...'}
              value={query}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
        </div>

        {activeTab === 'companies' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Status</th>
                <th>Total Projects</th>
                <th>Joined Date</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className={styles.entityCell}>
                      <span className={styles.avatar}>{entry.initials}</span>
                      <div>
                        <span className={styles.entityName}>{entry.name}</span>
                        <span className={styles.entityLocation}>{entry.location}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge
                      label={getPlatformStatusLabel(entry.status, entry.isFlagged)}
                      tone={getPlatformStatusTone(entry.status, entry.isFlagged)}
                    />
                  </td>
                  <td>{entry.totalProjects}</td>
                  <td>{entry.joinedDate}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {entry.status === AccountStatus.Pending && (
                        <>
                          <button
                            type="button"
                            className={styles.approveButton}
                            onClick={() => updateCompanyStatus(entry.id, AccountStatus.Active)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className={styles.rejectButton}
                            onClick={() => updateCompanyStatus(entry.id, AccountStatus.Deleted)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {entry.status === AccountStatus.Active && (
                        <>
                          <button
                            type="button"
                            className={styles.suspendButton}
                            onClick={() => updateCompanyStatus(entry.id, AccountStatus.InActive)}
                          >
                            Suspend
                          </button>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => updateCompanyStatus(entry.id, AccountStatus.Deleted)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {entry.status === AccountStatus.InActive && (
                        <>
                          <button
                            type="button"
                            className={styles.approveButton}
                            onClick={() => updateCompanyStatus(entry.id, AccountStatus.Active)}
                          >
                            Reactivate
                          </button>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => updateCompanyStatus(entry.id, AccountStatus.Deleted)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {entry.status === AccountStatus.Deleted && (
                        <span className={styles.noActions}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Status</th>
                <th>Jobs Posted</th>
                <th>Joined Date</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className={styles.entityCell}>
                      <span className={styles.avatar}>{entry.initials}</span>
                      <div>
                        <span className={styles.entityName}>{entry.name}</span>
                        <span className={styles.entityLocation}>{entry.location}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge
                      label={getPlatformStatusLabel(entry.status, entry.isFlagged)}
                      tone={getPlatformStatusTone(entry.status, entry.isFlagged)}
                    />
                  </td>
                  <td>{entry.totalJobsPosted}</td>
                  <td>{entry.joinedDate}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {entry.status === AccountStatus.Active && (
                        <>
                          <button
                            type="button"
                            className={styles.suspendButton}
                            onClick={() => updateCustomerStatus(entry.id, AccountStatus.InActive)}
                          >
                            Suspend
                          </button>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => updateCustomerStatus(entry.id, AccountStatus.Deleted)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {entry.status === AccountStatus.InActive && (
                        <>
                          <button
                            type="button"
                            className={styles.approveButton}
                            onClick={() => updateCustomerStatus(entry.id, AccountStatus.Active)}
                          >
                            Reactivate
                          </button>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => updateCustomerStatus(entry.id, AccountStatus.Deleted)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {entry.status === AccountStatus.Deleted && (
                        <span className={styles.noActions}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}