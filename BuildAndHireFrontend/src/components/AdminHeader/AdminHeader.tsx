import styles from './AdminHeader.module.css';

export default function AdminHeader() {
  return (
    <div className={styles.brandBlock}>
      <span className={styles.brandName}>Build &amp; Hire</span>
      <span className={styles.brandSubtitle}>Marketplace Admin</span>
    </div>
  );
}