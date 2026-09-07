import { Link } from 'react-router-dom';
import styles from './HomeHeader.module.css';

export default function HomeHeader() {
  return (
    <header className={styles.header}>
      <Link to="/home" className={styles.logo}>
        <span className={styles.logoMark} aria-hidden="true">◆</span>
        Build &amp; Hire
      </Link>

      <nav className={styles.nav}>
        <Link to="/home" className={styles.navLink}>About</Link>
        <Link to="/marketplace" className={styles.navLink}>Find Companies</Link>
        <Link to="/home" className={styles.navLink}>How It Works</Link>
        <Link to="/marketplace" className={styles.navLink}>For Contractors</Link>
      </nav>

      <div className={styles.actions}>
        <Link to="/" className={styles.logInLink}>Log In</Link>
        <Link to="/marketplace" className={styles.postButton}>Post a Project</Link>
      </div>
    </header>
  );
}