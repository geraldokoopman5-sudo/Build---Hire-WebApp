import CustomerSidebar from './CustomerSidebar';
import type { ReactNode } from 'react';
import styles from '../../pages/CustomerJobs/CustomerJobS.module.css';


export default function CustomerPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#customer-page">Skip to content</a>
    <div className={styles.layout}>
      <CustomerSidebar />
      <div className={styles.content}>
        <header className={styles.topbar}><div>My projects <span className={styles.separator}>/</span><strong>{title}</strong></div><span className={styles.demo}>Simulated payments</span></header>
        <main className={styles.main} id="customer-page" tabIndex={-1}>{children}</main>
      </div>
    </div>
  </div>;
}
