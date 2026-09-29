import styles from './PaymentSuccessModal.module.css';

interface PaymentSuccessModalProps {
  amount: string;
  transactionReference: string;
  onClose: () => void;
}

export default function PaymentSuccessModal({
  amount,
  transactionReference,
  onClose,
}: PaymentSuccessModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.checkIcon} aria-hidden="true">✓</div>
        <h2 className={styles.title}>Payment Successful</h2>
        <p className={styles.amount}>{amount}</p>
        <p className={styles.reference}>Reference: {transactionReference}</p>
        <p className={styles.note}>This was a simulated payment — no real charge was made.</p>
        <button type="button" className={styles.doneButton} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}