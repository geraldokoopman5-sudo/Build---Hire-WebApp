import {
  Link,
} from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader/AdminHeader';

import {
  useAdminManagement,
} from '../../context/AdminManagementContext';

import {
  AdminRole,
} from '../../types/admin';

import {
  AccountStatus,
} from '../../types/enums';

import styles from './SuperAdminDashboard.module.css';

export default function SuperAdminDashboard() {
  const {
    admins,
  } = useAdminManagement();

  const activeAdmins =
    admins.filter(
      (admin) =>
        admin.status ===
        AccountStatus.Active
    ).length;

  const inactiveAdmins =
    admins.filter(
      (admin) =>
        admin.status ===
        AccountStatus.InActive
    ).length;

  const superAdmins =
    admins.filter(
      (admin) =>
        admin.adminRole ===
        AdminRole.SuperAdmin
    ).length;

  return (
    <div className={styles.page}>
      <AdminHeader />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Super Administration
            </span>

            <h1 className={styles.title}>
              Super Admin Dashboard
            </h1>

            <p className={styles.subtitle}>
              Manage privileged administrator
              accounts and platform access.
            </p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              Total Admins
            </span>

            <strong className={styles.statValue}>
              {admins.length}
            </strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              Active Admins
            </span>

            <strong className={styles.statValue}>
              {activeAdmins}
            </strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              Inactive Admins
            </span>

            <strong className={styles.statValue}>
              {inactiveAdmins}
            </strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              Super Admins
            </span>

            <strong className={styles.statValue}>
              {superAdmins}
            </strong>
          </div>
        </div>

        <section className={styles.managementCard}>
          <div>
            <span className={styles.cardEyebrow}>
              Administrator Accounts
            </span>

            <h2 className={styles.cardTitle}>
              Admin Management
            </h2>

            <p className={styles.cardText}>
              Create, edit, deactivate, or remove
              administrator accounts.
            </p>
          </div>

          <Link
            to="/super-admin/admins"
            className={styles.primaryButton}
          >
            Manage Admins
          </Link>
        </section>
      </main>
    </div>
  );
}