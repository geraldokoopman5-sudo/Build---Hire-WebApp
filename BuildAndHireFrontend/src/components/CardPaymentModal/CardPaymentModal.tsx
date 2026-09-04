import { useState, type ChangeEvent } from 'react';
import type { CardPaymentFormValues, CardFormErrors } from '../../types/payment';
import { formatCardNumber, formatExpiryDate, validateCardForm } from '../../utils/cardValidation';
import { generateFakeTransactionReference, simulatePaymentDelay } from '../../utils/simulatePayment';
import styles from './CardPaymentModal.module.css';

interface CardPaymentModalProps {
  amount: string;
  onClose: () => void;
  onSuccess: (transactionReference: string) => void;
}

const INITIAL_VALUES: CardPaymentFormValues = {
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
};

export default function CardPaymentModal({ amount, onClose, onSuccess }: CardPaymentModalProps) {
  const [values, setValues] = useState<CardPaymentFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValues((prev) => ({ ...prev, cardholderName: event.target.value }));
  };

  const handleCardNumberChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValues((prev) => ({ ...prev, cardNumber: formatCardNumber(event.target.value) }));
  };

  const handleExpiryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValues((prev) => ({ ...prev, expiryDate: formatExpiryDate(event.target.value) }));
  };

  const handleCvvChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 4);
    setValues((prev) => ({ ...prev, cvv: digitsOnly }));
  };

  const handleConfirm = async (): Promise<void> => {
    const validationErrors = validateCardForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsProcessing(true);
    await simulatePaymentDelay();
    const fakeReference = generateFakeTransactionReference();
    setIsProcessing(false);
    onSuccess(fakeReference);
  };

  const maskedNumber = values.cardNumber || '•••• •••• •••• ••••';
  const displayName = values.cardholderName || 'Your Name';
  const displayExpiry = values.expiryDate || 'MM/YY';

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={styles.title}>Card Details</h2>
        <p className={styles.subtitle}>Secure payment via Build &amp; Hire Marketplace</p>
        <p className={styles.simulationNote}>This is a demo — no real payment is processed.</p>

        <div className={styles.cardVisual}>
          <div className={styles.cardTopRow}>
            <span className={styles.chipIcon} aria-hidden="true">Build And Hire</span>
            <span className={styles.cardBrand}>VISA</span>
          </div>
          <div className={styles.cardNumberDisplay}>{maskedNumber}</div>
          <div className={styles.cardBottomRow}>
            <div>
              <span className={styles.cardFieldLabel}>Cardholder</span>
              <span className={styles.cardFieldValue}>{displayName}</span>
            </div>
            <div>
              <span className={styles.cardFieldLabel}>Expiry</span>
              <span className={styles.cardFieldValue}>{displayExpiry}</span>
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="cardholderName" className={styles.label}>
            Cardholder Name
          </label>
          <input
            id="cardholderName"
            type="text"
            placeholder="John Doe"
            value={values.cardholderName}
            onChange={handleNameChange}
            className={`${styles.input} ${errors.cardholderName ? styles.inputError : ''}`}
            disabled={isProcessing}
          />
          {errors.cardholderName && <p className={styles.errorText}>{errors.cardholderName}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="cardNumber" className={styles.label}>
            Card Number
          </label>
          <input
            id="cardNumber"
            type="text"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={values.cardNumber}
            onChange={handleCardNumberChange}
            className={`${styles.input} ${errors.cardNumber ? styles.inputError : ''}`}
            disabled={isProcessing}
          />
          {errors.cardNumber && <p className={styles.errorText}>{errors.cardNumber}</p>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="expiryDate" className={styles.label}>
              Expiry Date
            </label>
            <input
              id="expiryDate"
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={values.expiryDate}
              onChange={handleExpiryChange}
              className={`${styles.input} ${errors.expiryDate ? styles.inputError : ''}`}
              disabled={isProcessing}
            />
            {errors.expiryDate && <p className={styles.errorText}>{errors.expiryDate}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="cvv" className={styles.label}>
              CVV
            </label>
            <input
              id="cvv"
              type="password"
              inputMode="numeric"
              placeholder="•••"
              value={values.cvv}
              onChange={handleCvvChange}
              className={`${styles.input} ${errors.cvv ? styles.inputError : ''}`}
              disabled={isProcessing}
            />
            {errors.cvv && <p className={styles.errorText}>{errors.cvv}</p>}
          </div>
        </div>

        <button type="button" className={styles.confirmButton} onClick={handleConfirm} disabled={isProcessing}>
          {isProcessing ? 'Processing…' : `Confirm & Pay ${amount}`}
        </button>

        <button type="button" className={styles.backButton} onClick={onClose} disabled={isProcessing}>
          ← Back
        </button>
      </div>
    </div>
  );
}