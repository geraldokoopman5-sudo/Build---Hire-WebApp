import type { BadgeTone } from '../../utils/platformStatusLables';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

export default function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}