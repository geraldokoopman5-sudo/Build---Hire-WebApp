import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}><span className={styles.logo}>Build &amp; Hire</span></header>
      <main className={styles.main}>
        <aside className={styles.introGroup} aria-label="Your project workspace">
          <section className={styles.intro}>
            <span className={styles.eyebrow}>MAKE ROOM FOR WHAT IS NEXT</span>
            <h1>Good projects.<br />Clear beginnings.</h1>
            <p>Find a company and bring every request, quote, and project update into one workspace.</p>
          </section>
          <section className={styles.note}>
            <h2>Find your team</h2><p>Browse approved company accounts for your next project.</p>
          </section>
          <section className={styles.note}>
            <h2>Keep it together</h2><p>Follow your project from its first quote to its final update.</p>
          </section>
        </aside>
        {children}
      </main>
    </div>
  );
}
