import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../pages/CustomerJobs/CustomerJobS.module.css';

function NavIcon({ kind }: { kind: 'home' | 'companies' | 'projects' }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === 'home' ? <><path d="m3 10 9-7 9 7v10H3Z" /><path d="M9 20v-7h6v7" /></>
      : kind === 'companies' ? <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3" /></>
      : <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></>}
  </svg>;
}

export default function CustomerPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#customer-page">Skip to content</a>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} to="/home">Build <span>&amp;</span> Hire<span>.</span></Link>
        <div className={styles.workspace}>Your project space</div>
        <nav className={styles.nav} aria-label="Customer navigation">
          <Link className={styles.navlink} to="/home"><NavIcon kind="home" />Home</Link>
          <Link className={styles.navlink} to="/marketplace"><NavIcon kind="companies" />Browse companies</Link>
          <Link className={`${styles.navlink} ${styles.active}`} to="/my-jobs"><NavIcon kind="projects" />My projects</Link>
        </nav>
        <div className={styles.support}><strong>Every step, in one place.</strong>Your project status and payment status are tracked separately.</div>
        <div className={styles.account}><div className={styles.avatar} aria-hidden="true">○</div><div>Your workspace<small>Customer account</small></div></div>
      </aside>
      <div className={styles.content}>
        <header className={styles.topbar}><div>My projects <span className={styles.separator}>/</span><strong>{title}</strong></div><span className={styles.demo}>Simulated payments</span></header>
        <main className={styles.main} id="customer-page" tabIndex={-1}>{children}</main>
      </div>
    </div>
  </div>;
}
