import style from './Modal.module.css';

export default function Modal({ modalType, paymentErrorMessage, setShowModal }: { modalType: string, paymentErrorMessage: string, setShowModal: (show: boolean) => void }) {
  const isSuccess = modalType === 'success';

  return (
    <div className={style.modalOverlay}>
      <div className={isSuccess ? style.successModal : style.errorModal}>
        {isSuccess ? (
          <div className={style.successIcon}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#106552"/>
              <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : (
          <div className={style.errorIcon}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#EF4444" />
              <path d="M32 20V36" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <circle cx="32" cy="44" r="2" fill="white" />
            </svg>
          </div>
        )}
        <h3 className={isSuccess ? style.successTitle : style.errorTitle}>
          {isSuccess ? 'Success!' : 'Something went wrong — Try Again'}
        </h3>
        <p className={isSuccess ? style.successMessage : style.errorMessage}>{paymentErrorMessage}</p>
        <div className={isSuccess ? style.successActions : style.errorActions}>
          <button 
            className={isSuccess ? style.successButton : style.errorButton} 
            onClick={() => setShowModal(false)}
          >
            {isSuccess ? 'Close' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
}