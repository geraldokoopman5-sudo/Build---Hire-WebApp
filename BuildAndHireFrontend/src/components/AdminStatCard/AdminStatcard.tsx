import type { ReactNode } from 'react';
import styles from './AdminStatCard.module.css';

interface AdminStatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  accent?: 'default' | 'danger';
}

export default function AdminStatCard({ label, value, icon, accent = 'default' }: AdminStatCardProps) {
  return (
    <div className={styles.card}>
      <div>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.value} ${accent === 'danger' ? styles.valueDanger : ''}`}>
          {value.toLocaleString()}
        </span>
      </div>
      <div className={styles.iconWrapper}>{icon}</div>
    </div>
  );
}