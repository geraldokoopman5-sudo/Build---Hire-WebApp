import { Link } from 'react-router-dom';

import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="not-found-title">
        <p className={styles.code}>404</p>
        <h1 id="not-found-title" className={styles.title}>
          Page not found
        </h1>
        <p className={styles.description}>
          The page you requested does not exist or may have moved.
        </p>
        <Link to="/" className={styles.link}>
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
