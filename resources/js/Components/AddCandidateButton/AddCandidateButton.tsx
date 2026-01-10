import React, { useState } from 'react';
import AddCandidateModal from '../AddCandidateModal/AddCandidateModal';
import CompleteProfileModal from '../../Pages/Dashboard/Components/CompleteProfileModal/CompleteProfileModal';
import ConfirmationModal from '../ConfirmationModal';

interface AddCandidateButtonProps {
  onCandidateAdded?: () => void;
  className?: string;
  buttonText?: string;
}

interface CandidateData {
  name: string;
  email: string;
  userId?: number;
}

const AddCandidateButton: React.FC<AddCandidateButtonProps> = ({
  onCandidateAdded,
  className = 'add-candidate',
  buttonText = 'Add Candidate'
}) => {
  const [addCandidateModal, setAddCandidateModal] = useState<boolean>(false);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState<boolean>(false);
  const [newCandidateData, setNewCandidateData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm' as 'confirm' | 'success' | 'error' | 'info',
    onConfirm: () => {}
  });

  const handleAddCandidate = async (candidateData: { name: string; email: string }) => {
    try {
      setLoading(true);
      
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch('/api/addcan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: candidateData.name,
          email: candidateData.email,
          password: 'password',
          password_confirmation: 'password',
          agree_terms: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add candidate');
      }
      
      const result = await response.json();
      
      if (result.message && result.message.includes('Registration successful') || result.user) {
        setAddCandidateModal(false);
        
        setNewCandidateData({
          name: candidateData.name,
          email: candidateData.email,
          userId: result.user?.id || result.user_id
        });
        
        setShowCompleteProfileModal(true);
        
        setModalState({
          isOpen: true,
          title: 'Success',
          message: 'Candidate added successfully. Please complete their profile.',
          type: 'success',
          onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
        });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to add candidate',
        type: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfileClose = () => {
    setShowCompleteProfileModal(false);
    setNewCandidateData(null);
    
    // Notify parent component that candidate was added
    if (onCandidateAdded) {
      onCandidateAdded();
    }
  };

  const handleModalCancel = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <button 
        className={className} 
        onClick={() => setAddCandidateModal(true)}
        disabled={loading}
      >
        {buttonText}
      </button>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={handleModalCancel}
      />

      {/* Add Candidate Modal */}
      {addCandidateModal && (
        <AddCandidateModal 
          onClose={() => setAddCandidateModal(false)}
          onSubmit={handleAddCandidate}
        />
      )}

      {/* Complete Profile Modal */}
      {showCompleteProfileModal && newCandidateData && (
        <CompleteProfileModal 
          onClose={handleCompleteProfileClose}
          candidateUserId={newCandidateData.userId}
        />
      )}
    </>
  );
};

export default AddCandidateButton;