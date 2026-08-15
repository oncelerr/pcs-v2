import React from 'react';
import styles from './CompletePaymentModal.module.css';

export default function CompletePaymentModal() {
  return (
    <div className={styles.modalOverlay} aria-hidden={false}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div id="payment-modal-title" className={styles.modalTitle}>Payment Required</div>
        </div>
        <div style={{ padding: '16px 24px 24px 24px', color: '#475569', fontSize: 16, lineHeight: '24px' }}>
          <p>Online payment is temporarily unavailable while we set up a new payment provider.</p>
          <p>
            To settle your payment and activate your account, please email{' '}
            <a href="mailto:fillings@premiumcorpsolutions.com" style={{ color: '#146755', fontWeight: 600 }}>
              fillings@premiumcorpsolutions.com
            </a>.
          </p>
          <p>Once your payment is confirmed, our team will update your account and you'll be able to continue.</p>
        </div>
      </div>
    </div>
  );
}
