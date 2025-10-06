import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styles from './CompletePaymentModal.module.css';
import Modal from '../../../../Components/Modal/Modal';
import LoadingSpinner from '../../../../Components/LoadingSpinner';

const pricingPlans = [
  {
    badge: "Basic",
    price: "$349",
    title: "LLC Basic Plan",
    popular: true,
    inclusions: [
      "Company Formation + Documents of Registration",
      "Employer Identification Number (EIN)",
      "Beneficial Ownership Information Reporting (BOI)",
      "Registered Agent Subscription",
      "Bank Account Registration",
      "Dashboard Access",
    ],
  },
  {
    badge: "Basic",
    price: "$399",
    title: "Corp Basic Plan",
    inclusions: [
      "Company Formation + Documents of Registration",
      "Employer Identification Number (EIN)",
      "Beneficial Ownership Information Reporting (BOI)",
      "Registered Agent Subscription",
      "Bank Account Registration",
      "Dashboard Access",
    ],
  },
  {
    badge: "Premium",
    price: "$499",
    title: "LLC Premium Plan",
    inclusions: [
      "Company Formation + Documents of Registration",
      "Employer Identification Number (EIN)",
      "Beneficial Ownership Information Reporting (BOI)",
      "Registered Agent Subscription",
      "Bank Account Registration",
      "Dashboard Access",
      "Worry-free Annual Compliance Reporting",
      "Worry-free Annual Tax Return Filing",
      "Certificate of Good Standing",
    ],
  },
  {
    badge: "Premium",
    price: "$599",
    title: "Corp Premium Plan",
    inclusions: [
      "Company Formation + Documents of Registration",
      "Employer Identification Number (EIN)",
      "Beneficial Ownership Information Reporting (BOI)",
      "Registered Agent Subscription",
      "Bank Account Registration",
      "Dashboard Access",
      "Worry-free Annual Compliance Reporting",
      "Worry-free Annual Tax Return Filing",
      "Certificate of Good Standing",
    ],
  },
];

// Custom spinner wrapper for payment buttons
const ButtonSpinner = () => (
  <div className={styles.spinnerContainer}>
    <LoadingSpinner size="small" color="#126654" />
  </div>
);

export default function CompletePaymentModal() {
  const [showConfigErrorModal, setShowConfigErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});

  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  // Check if Stripe key is configured
  if (!stripePublicKey) {
    console.error('VITE_STRIPE_PUBLIC_KEY is not configured in environment variables');
  }
  
  const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

  const handleCheckout = async (planTitle: string) => {
    // Set loading state for this specific plan
    setLoadingStates(prev => ({ ...prev, [planTitle]: true }));
    // Reset error state if it was previously set
    setErrorStates(prev => ({ ...prev, [planTitle]: false }));
    
    try {
      // Check if Stripe is properly configured
      if (!stripePromise) {
        setErrorMessage('Payment system is not properly configured. Please contact support.');
        setShowConfigErrorModal(true);
        setLoadingStates(prev => ({ ...prev, [planTitle]: false }));
        setErrorStates(prev => ({ ...prev, [planTitle]: true }));
        return;
      }

      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ plan: planTitle }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Checkout session error:', errorData);
        setErrorMessage('Failed to create checkout session. Please try again.');
        setShowConfigErrorModal(true);
        setLoadingStates(prev => ({ ...prev, [planTitle]: false }));
        setErrorStates(prev => ({ ...prev, [planTitle]: true }));
        return;
      }

      const data = await res.json();
      const stripe = await stripePromise;

      if (stripe && data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage('An error occurred while processing your request. Please try again.');
      setShowConfigErrorModal(true);
      setLoadingStates(prev => ({ ...prev, [planTitle]: false }));
      setErrorStates(prev => ({ ...prev, [planTitle]: true }));
    }
  };

  return (
    <>
      {showConfigErrorModal && (
        <Modal 
          modalType="error" 
          paymentErrorMessage={errorMessage} 
          setShowModal={setShowConfigErrorModal} 
        />
      )}
      <div className={styles.modalOverlay} aria-hidden={false}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-setup-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div id="profile-setup-modal-title" className={styles.modalTitle}>Payment Required</div>
        </div>
        <div id="pricing-section" className={styles.seventhSection}>
          <div className={styles.seventhWrp}>
            <div className={styles.seventhCardWrp}>
              {pricingPlans.map((plan, index) => (
                <div className={styles.seventhCard} key={index}>
                  {plan.popular && <div className={styles.popularBadge}>Popular</div>}
                  <p className={styles.seventhBadge}>{plan.badge}</p>
                  <h1 className={styles.seventhH1}>{plan.title}</h1>
                  <h1 className={styles.seventhTitle}>
                    {plan.price} <span>One Time</span>
                  </h1>
                  <button 
                    className={`${styles.seventhBtn} ${errorStates[plan.title] ? styles.errorBtn : ''}`} 
                    onClick={() => handleCheckout(plan.title)}
                    disabled={loadingStates[plan.title]}
                  >
                    {loadingStates[plan.title] ? (
                      <ButtonSpinner />
                    ) : errorStates[plan.title] ? (
                      'Try Again'
                    ) : (
                      'Select & Continue'
                    )}
                  </button>
                  <div className={styles.seventhHr}></div>
                  {plan.inclusions.map((inc, i) => (
                    <div className={styles.seventhInclusions} key={i}>
                      <img src="/assets/check-circle.png" alt="" />
                      <div className={styles.seventhInclusionTxt}>{inc}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}