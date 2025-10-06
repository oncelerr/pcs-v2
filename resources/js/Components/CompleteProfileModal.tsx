import React from 'react';

const CompleteProfileModal: React.FC = () => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Complete Your Profile</h2>
        </div>
        <div className="modal__body">
          <p>Please complete your profile to continue.</p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
