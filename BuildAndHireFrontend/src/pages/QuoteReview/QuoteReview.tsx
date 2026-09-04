import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import JobsHeader from '../../components/JobsHeader/JobsHeader';
import CardPaymentModal from '../../components/CardPaymentModal/CardPaymentModal';
import { quotes } from '../../data/qoutes';
import { formatCurrency, getQuoteTotal } from '../../utils/quoteMath';
import type { PaymentMethod } from '../../types/quote';
import type { Payment } from '../../types/payment';
import { PaymentMethod as PaymentMethodEnum, PaymentEnum } from '../../types/enums';
import styles from './QuoteReview.module.css';

export default function QuoteReview() {
  const { id } = useParams<{ id: string }>();
  const quote = quotes.find((entry) => entry.id === id) ?? quotes[0];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('eft');
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  if (!quote) {
    return (
      <div className={styles.page}>
        <JobsHeader activeLink="my-jobs" />
        <main className={styles.notFound}>
          <p>Quote not found.</p>
          <Link to="/my-jobs" className={styles.backLink}>
            Back to My Jobs
          </Link>
        </main>
      </div>
    );
  }

  const total = getQuoteTotal(quote.summary);

  const handleAcceptQuote = (): void => {
    if (paymentMethod === 'card') {
      setIsCardModalOpen(true);
      return;
    }

    // TODO: EFT and PayPal simulated flows are not built yet
    console.log('Selected payment method not yet implemented:', paymentMethod);
  };

  const handleCardSuccess = (transactionReference: string): void => {
    const payment: Payment = {
      paymentId: crypto.randomUUID(),
      jobId: quote.id,
      amount: total,
      paymentMethod: PaymentMethodEnum.DebitOrCreditCard,
      status: PaymentEnum.Successful,
      paymentDate: new Date().toISOString(),
      transactionReference,
    };

    console.log('Simulated payment complete:', payment);
    setCompletedPayment(payment);
    setIsCardModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <JobsHeader activeLink="my-jobs" />

      <main className={styles.main}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.eyebrow}>Quote Review</span>
            <h1 className={styles.title}>{quote.jobTitle}</h1>
            <p className={styles.companyLine}> {quote.companyName}</p>
          </div>
          <div className={styles.referenceBlock}>
            <span className={styles.referenceLabel}>Quote Reference</span>
            <span className={styles.referenceValue}>{quote.reference}</span>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <section className={styles.descriptionCard}>
              <h2 className={styles.cardTitle}> Job Description</h2>
              <p className={styles.description}>{quote.description}</p>

              <ul className={styles.scopeList}>
                {quote.scopeItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className={styles.dateRow}>
                <div className={styles.dateBox}>
                  <span className={styles.dateLabel}> Estimated Start</span>
                  <span className={styles.dateValue}>{quote.estimatedStart}</span>
                </div>
                <div className={styles.dateBox}>
                  <span className={styles.dateLabel}> Estimated Completion</span>
                  <span className={styles.dateValue}>{quote.estimatedCompletion}</span>
                </div>
              </div>
            </section>

            <section className={styles.companyCard}>
              <div className={styles.companyBadge}>{quote.companyInitials}</div>
              <div className={styles.companyInfo}>
                <h3 className={styles.companyName}>{quote.companyName}</h3>
              </div>
            </section>
          </div>

          <aside className={styles.summaryCard}>
            <h2 className={styles.cardTitle}>Quote Summary</h2>

            {completedPayment ? (
              <div className={styles.successBox}>
                <p className={styles.successTitle}>  Payment Successful</p>
                <p className={styles.successReference}>
                  Reference: {completedPayment.transactionReference}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.totalRow}>
                  <span>Total Amount Due</span>
                  <span className={styles.totalValue}>{formatCurrency(total)}</span>
                </div>

                <span className={styles.paymentLabel}>Select Payment Method</span>

                <div className={styles.paymentOptions}>
                  {/* <label
                    className={`${styles.paymentOption} ${paymentMethod === 'eft' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="eft"
                      checked={paymentMethod === 'eft'}
                      onChange={() => setPaymentMethod('eft')}
                    />
                     EFT / Bank Transfer
                  </label> */}
                  <label
                    className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                     Credit / Debit Card
                  </label>
                  {/* <label
                    className={`${styles.paymentOption} ${paymentMethod === 'paypal' ? styles.paymentOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                    />
                     PayPal
                  </label> */}
                </div>

                <button type="button" className={styles.acceptButton} onClick={handleAcceptQuote}>
                  Accept Quote &amp; Pay →
                </button>
                <button type="button" className={styles.revisionButton}>
                  Request Revision
                </button>

                <p className={styles.termsText}>
                  By accepting, you agree to the <Link to="/terms">Terms of Service</Link>.
                </p>
              </>
            )}
          </aside>
        </div>
      </main>

      {isCardModalOpen && (
        <CardPaymentModal
          amount={formatCurrency(total)}
          onClose={() => setIsCardModalOpen(false)}
          onSuccess={handleCardSuccess}
        />
      )}
    </div>
  );
}