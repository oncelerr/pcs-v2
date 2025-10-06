import React from 'react';

const CompletePaymentModal: React.FC = () => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Complete Payment</h2>
        </div>
        <div className="modal__body">
          <p>Please complete your payment to continue.</p>
        </div>
      </div>
    </div>
  );
};

export default CompletePaymentModal;
