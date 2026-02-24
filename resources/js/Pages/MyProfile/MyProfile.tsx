import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyProfile.css'
import { COUNTRIES } from '../../data/countries';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

interface UserProfile {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix_name: string;
  email_address: string;
  contact_number: string;
  ssn: string;
  country: string;
  address_one: string;
  address_two: string;
  city: string;
  state: string;
  zip_code: string;
  company_name: string;
  company_type: string;
  company_website: string;
  company_industry: string;
  company_designator: string;
  state_registration: string;
}

interface UploadedFiles {
  passport_file_name: string | null;
  proof_address_file_name: string | null;
  signature_file_name: string | null;
}

const MyProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await fetch('/api/my-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
          setUploadedFiles(data.uploaded_files);
        } else {
          setError(data.message || 'Failed to load profile.');
        }
      } catch {
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getCountryName = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code);
    return country ? country.name : code || '—';
  };

  const displayValue = (value: string | null | undefined) => value || '—';

  if (loading) {
    return (
      <div className="mp-wrp">
        <div className="personal-deets-cont">
          <div className="profile-loading-container">
            <LoadingSpinner size="large" color="#126654" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mp-wrp">
        <div className="personal-deets-cont">
          <div className="profile-error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mp-wrp">
      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">Personal Details</h3>
        </div>
        <div className="mp-hr" />
        <div className="personal-deets-field">
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">First Name</h3>
              <div className="pd-display">{displayValue(profile?.first_name)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Middle Name <span className="opt-tag">(Optional)</span></h3>
              <div className="pd-display">{displayValue(profile?.middle_name)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Last Name</h3>
              <div className="pd-display">{displayValue(profile?.last_name)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Suffix Name <span className="opt-tag">(Optional)</span></h3>
              <div className="pd-display">{displayValue(profile?.suffix_name)}</div>
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Email Address</h3>
              <div className="pd-display">{displayValue(profile?.email_address)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Contact Number</h3>
              <div className="pd-display">{displayValue(profile?.contact_number)}</div>
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">SSN</h3>
              <div className="pd-display">{profile?.ssn ? '••••••' + profile.ssn.slice(-4) : '—'}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Country</h3>
              <div className="pd-display">{getCountryName(profile?.country || '')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">Address Information</h3>
        </div>
        <div className="mp-hr" />
        <div className="personal-deets-field">
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Street Address</h3>
              <div className="pd-display">{displayValue(profile?.address_one)}</div>
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Street Address Line 2</h3>
              <div className="pd-display">{displayValue(profile?.address_two)}</div>
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">City</h3>
              <div className="pd-display">{displayValue(profile?.city)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">State / Province</h3>
              <div className="pd-display">{displayValue(profile?.state)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Postal / Zip Code</h3>
              <div className="pd-display">{displayValue(profile?.zip_code)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">Company Information</h3>
        </div>
        <div className="mp-hr" />
        <div className="personal-deets-field">
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Name</h3>
              <div className="pd-display">{displayValue(profile?.company_name)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Type</h3>
              <div className="pd-display">{displayValue(profile?.company_type)}</div>
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Website</h3>
              <div className="pd-display">{displayValue(profile?.company_website)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Industry</h3>
              <div className="pd-display">{displayValue(profile?.company_industry)}</div>
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Designator</h3>
              <div className="pd-display">{displayValue(profile?.company_designator)}</div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">State Registration</h3>
              <div className="pd-display">{displayValue(profile?.state_registration)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">Uploaded Documents</h3>
        </div>
        <div className="mp-hr" />
        <div className="personal-deets-field">
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Main Applicant's Passport</h3>
              <div className="pd-display pd-file">
                {uploadedFiles?.passport_file_name || 'No file uploaded'}
              </div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Main Applicant's Proof of Address</h3>
              <div className="pd-display pd-file">
                {uploadedFiles?.proof_address_file_name || 'No file uploaded'}
              </div>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Main Applicant's Signature</h3>
              <div className="pd-display pd-file">
                {uploadedFiles?.signature_file_name || 'No file uploaded'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
