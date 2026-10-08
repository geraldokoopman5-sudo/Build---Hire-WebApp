import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';

import AdminHeader from '../../components/AdminHeader/AdminHeader';
import AdminStatCard from '../../components/AdminStatCard/AdminStatcard';
import StatusBadge from '../../components/StatusBadge/StatusBadge';

import {
  apiRequest,
} from '../../utils/api';

import {
  getPlatformStatusLabel,
  getPlatformStatusTone,
} from '../../utils/platformStatusLables';

import {
  AccountStatus,
  PaymentEnum,
} from '../../types/enums';
import { formatCurrency } from '../../utils/quoteMath';

import type {
  PlatformCompany,
  PlatformCustomer,
} from '../../types/platformEntity';

import styles from './AdminPortal.module.css';

type EntityTab =
  | 'companies'
  | 'customers';

interface ApiCompany { companyId: string; companyName: string; status: AccountStatus; address?: { city?: string }; }
interface ApiCustomer { customerId: string; customerName: string; status: AccountStatus; address?: { city?: string }; }
interface ApiJob { companyId: string; customerId: string; }
interface ApiPayment { paymentId: string; jobId: string; amount: number; status: number; paymentDate: string; transactionReference: string | null; }

export default function AdminPortal() {
  const [activeTab, setActiveTab] =
    useState<EntityTab>('companies');

  const [companies, setCompanies] =
    useState<PlatformCompany[]>([]);

  const [customers, setCustomers] =
    useState<PlatformCustomer[]>([]);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] =
    useState<string>('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      apiRequest<ApiCompany[]>('/api/Companies', { signal: controller.signal }),
      apiRequest<ApiCustomer[]>('/api/Customer', { signal: controller.signal }),
      apiRequest<ApiJob[]>('/api/Jobs', { signal: controller.signal }),
      apiRequest<ApiPayment[]>('/api/Payment', { signal: controller.signal }),
    ]).then(([firms, people, jobs, paymentRecords]) => {
      if (controller.signal.aborted) return;
      setPayments(paymentRecords);
      setCompanies(firms.map(company => ({
        id: company.companyId, name: company.companyName,
        initials: company.companyName.slice(0, 2).toUpperCase(),
        location: company.address?.city ?? '—', status: company.status,
        isFlagged: false, joinedDate: '—',
        totalProjects: jobs.filter(job => job.companyId === company.companyId).length,
      })));
      setCustomers(people.map(customer => ({
        id: customer.customerId, name: customer.customerName,
        initials: customer.customerName.slice(0, 2).toUpperCase(),
        location: customer.address?.city ?? '—', status: customer.status,
        isFlagged: false, joinedDate: '—',
        totalJobsPosted: jobs.filter(job => job.customerId === customer.customerId).length,
      })));
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load accounts.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setQuery(event.target.value);
  };

  const updateCompanyStatus = async (
    id: string,
    status: AccountStatus
  ): Promise<void> => {
    try {
      await apiRequest<void>(`/api/Companies/${id}/Status`, {
        method: 'PATCH', body: JSON.stringify({ status }),
      });
      setCompanies((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status,
            }
          : entry
      )
    );
      setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update company.'); }
  };

  const updateCustomerStatus = async (
    id: string,
    status: AccountStatus
  ): Promise<void> => {
    try {
      await apiRequest<void>(`/api/Customer/${id}/status`, {
        method: 'PATCH', body: JSON.stringify({ status }),
      });
      setCustomers((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status,
            }
          : entry
      )
    );
      setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update customer.'); }
  };

  const reviewPayment = async (id: string, status: number): Promise<void> => {
    try {
      await apiRequest(`/api/Payment/${id}/status`, {
        method: 'PATCH', body: JSON.stringify({ status }),
      });
      setPayments(current => current.map(payment => payment.paymentId === id ? { ...payment, status } : payment));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not review payment.');
    }
  };

  const filteredCompanies = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return companies.filter((entry) =>
      entry.name
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [companies, query]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return customers.filter((entry) =>
      entry.name
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [customers, query]);

  const totalFirms =
    companies.length;

  const pendingReview =
    companies.filter(
      (entry) =>
        entry.status ===
        AccountStatus.Pending
    ).length;

  return (
    <div className={styles.page}>
      <AdminHeader />
      {loading && <p role="status">Loading accounts…</p>}
      {error && <p role="alert">{error}</p>}

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            Admin Portal
          </h1>

          <p className={styles.subtitle}>
            Oversee platform activity, manage
            entity verification, and monitor
            marketplace health from one place.
          </p>
        </div>

        <div className={styles.tabToggle}>
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === 'companies'
                ? styles.tabButtonActive
                : ''
            }`}
            onClick={() => {
              setActiveTab('companies');
              setQuery('');
            }}
          >
            Companies
          </button>

          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === 'customers'
                ? styles.tabButtonActive
                : ''
            }`}
            onClick={() => {
              setActiveTab('customers');
              setQuery('');
            }}
          >
            Customers
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <AdminStatCard
          label="Total Firms"
          value={totalFirms}
          icon={<span />}
        />

        <AdminStatCard
          label="Pending Review"
          value={pendingReview}
          icon={<span />}
        />

      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>
            {activeTab === 'companies'
              ? 'Construction Firms'
              : 'Customers'}
          </h2>

          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              type="text"
              placeholder={
                activeTab === 'companies'
                  ? 'Search companies...'
                  : 'Search customers...'
              }
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
                <th className={styles.actionsHeader}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCompanies.map(
                (entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className={styles.entityCell}>
                        <span className={styles.avatar}>
                          {entry.initials}
                        </span>

                        <div>
                          <span className={styles.entityName}>
                            {entry.name}
                          </span>

                          <span className={styles.entityLocation}>
                            {entry.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusBadge
                        label={getPlatformStatusLabel(
                          entry.status,
                          entry.isFlagged
                        )}
                        tone={getPlatformStatusTone(
                          entry.status,
                          entry.isFlagged
                        )}
                      />
                    </td>

                    <td>
                      {entry.totalProjects}
                    </td>

                    <td>
                      {entry.joinedDate}
                    </td>

                    <td>
                      <div
                        className={
                          styles.actionButtons
                        }
                      >
                        {entry.status ===
                          AccountStatus.Pending && (
                          <>
                            <button
                              type="button"
                              className={
                                styles.approveButton
                              }
                              onClick={() =>
                                updateCompanyStatus(
                                  entry.id,
                                  AccountStatus.Active
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className={
                                styles.rejectButton
                              }
                              onClick={() =>
                                updateCompanyStatus(
                                  entry.id,
                                  AccountStatus.Deleted
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {entry.status ===
                          AccountStatus.Active && (
                          <>
                            <button
                              type="button"
                              className={
                                styles.suspendButton
                              }
                              onClick={() =>
                                updateCompanyStatus(
                                  entry.id,
                                  AccountStatus.InActive
                                )
                              }
                            >
                              Suspend
                            </button>

                            <button
                              type="button"
                              className={
                                styles.deleteButton
                              }
                              onClick={() =>
                                updateCompanyStatus(
                                  entry.id,
                                  AccountStatus.Deleted
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {entry.status ===
                          AccountStatus.InActive && (
                          <>
                            <button
                              type="button"
                              className={
                                styles.approveButton
                              }
                              onClick={() =>
                                updateCompanyStatus(
                                  entry.id,
                                  AccountStatus.Active
                                )
                              }
                            >
                              Reactivate
                            </button>

                            <button
                              type="button"
                              className={
                                styles.deleteButton
                              }
                              onClick={() =>
                                updateCompanyStatus(
                                  entry.id,
                                  AccountStatus.Deleted
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {entry.status ===
                          AccountStatus.Deleted && (
                          <span
                            className={
                              styles.noActions
                            }
                          >
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
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
                <th className={styles.actionsHeader}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map(
                (entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className={styles.entityCell}>
                        <span className={styles.avatar}>
                          {entry.initials}
                        </span>

                        <div>
                          <span className={styles.entityName}>
                            {entry.name}
                          </span>

                          <span className={styles.entityLocation}>
                            {entry.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusBadge
                        label={getPlatformStatusLabel(
                          entry.status,
                          entry.isFlagged
                        )}
                        tone={getPlatformStatusTone(
                          entry.status,
                          entry.isFlagged
                        )}
                      />
                    </td>

                    <td>
                      {entry.totalJobsPosted}
                    </td>

                    <td>
                      {entry.joinedDate}
                    </td>

                    <td>
                      <div
                        className={
                          styles.actionButtons
                        }
                      >
                        {entry.status ===
                          AccountStatus.Active && (
                          <>
                            <button
                              type="button"
                              className={
                                styles.suspendButton
                              }
                              onClick={() =>
                                updateCustomerStatus(
                                  entry.id,
                                  AccountStatus.InActive
                                )
                              }
                            >
                              Suspend
                            </button>

                            <button
                              type="button"
                              className={
                                styles.deleteButton
                              }
                              onClick={() =>
                                updateCustomerStatus(
                                  entry.id,
                                  AccountStatus.Deleted
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {entry.status ===
                          AccountStatus.InActive && (
                          <>
                            <button
                              type="button"
                              className={
                                styles.approveButton
                              }
                              onClick={() =>
                                updateCustomerStatus(
                                  entry.id,
                                  AccountStatus.Active
                                )
                              }
                            >
                              Reactivate
                            </button>

                            <button
                              type="button"
                              className={
                                styles.deleteButton
                              }
                              onClick={() =>
                                updateCustomerStatus(
                                  entry.id,
                                  AccountStatus.Deleted
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {entry.status ===
                          AccountStatus.Deleted && (
                          <span
                            className={
                              styles.noActions
                            }
                          >
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}

        {(
          activeTab === 'companies'
            ? filteredCompanies.length
            : filteredCustomers.length
        ) === 0 && (
          <div className={styles.noResults}>
            No matching records found.
          </div>
        )}
      </div>
      <section className={styles.tableCard}>
        <div className={styles.tableHeader}><h2 className={styles.tableTitle}>EFT requests</h2></div>
        <p>Check your bank records independently before marking any request verified.</p>
        {payments.length === 0 ? <p>No EFT requests yet.</p> : <table className={styles.table}>
          <thead><tr><th>Job</th><th>Amount</th><th>Bank reference</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{payments.map(payment => <tr key={payment.paymentId}>
            <td>{payment.jobId}</td><td>{formatCurrency(payment.amount)}</td>
            <td>{payment.transactionReference || '—'}</td>
            <td>{payment.status === PaymentEnum.Pending ? 'Pending' : payment.status === PaymentEnum.Successful ? 'Verified' : 'Not verified'}</td>
            <td>{payment.status === PaymentEnum.Pending && <div className={styles.actionButtons}>
              <button type="button" className={styles.approveButton} onClick={() => reviewPayment(payment.paymentId, PaymentEnum.Successful)}>Mark verified</button>
              <button type="button" className={styles.rejectButton} onClick={() => reviewPayment(payment.paymentId, PaymentEnum.Failed)}>Mark not verified</button>
            </div>}</td>
          </tr>)}</tbody>
        </table>}
      </section>
    </div>
  );
}
