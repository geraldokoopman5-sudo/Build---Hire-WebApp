import type { ReactNode } from 'react';
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import CompanySidebar from '../CompanySidebar/CompanySidebar';
import styles from './CompanyLayout.module.css';

type CompanyNavLink =
  | 'my-jobs'
  | 'workforce'
  | 'browse-companies';

interface CompanyLayoutProps {
  activeSidebarLink?: CompanyNavLink;
  children: ReactNode;
}

export default function CompanyLayout({
  activeSidebarLink,
  children,
}: CompanyLayoutProps) {
  return (
    <div className={styles.page}>
      <DashboardHeader showNotifications />

      <div className={styles.body}>
        <CompanySidebar activeLink={activeSidebarLink} />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}