import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyProfile.css'
import { COUNTRIES } from '../../data/countries';

const MyProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="mp-wrp">
      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">Personal Details</h3>
        </div>
        <div className="mp-hr" />
        <div className="personal-deets-field">
          <h3 className="h3-title">Personal Details</h3>
          <div className="mp-hr" />
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">First Name</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Middle Name <span className="opt-tag">(Optional)</span></h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Last Name</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Suffix Name <span className="opt-tag">(Optional)</span></h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Email Address</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Contact Number</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">SSN</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Country</h3>
              <select className="pd-fn" name="country" id="country" defaultValue="">
                <option value="" disabled>Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
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
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Street Address Line 2</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">City</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">State / Province</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Postal / Zip Code</h3>
              <input className="pd-fn" type="text" name="" id="" />
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
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Type</h3>
              <select className="pd-fn" name="country" id="country" defaultValue="">
                <option value="" disabled>Select a Company Type</option>
                <option value="llc">LLC</option>
                <option value="nonprofit">Non-profit</option>
                <option value="subsidiary">Subsidiary</option>
                <option value="inc">Inc</option>
                <option value="corporation">Corporation</option>
              </select>
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Website</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Industry</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Company Designator</h3>
              <select className="pd-fn" name="country" id="country" defaultValue="">
                <option value="" disabled>Select a Company Designator</option>
                <option value="llc">LLC</option>
                <option value="nonprofit">Non-profit</option>
                <option value="subsidiary">Subsidiary</option>
                <option value="inc">Inc</option>
                <option value="corporation">Corporation</option>
              </select>
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">State Registration</h3>
              <select className="pd-fn" name="country" id="country" defaultValue="">
                <option value="" disabled>Select a State Registration</option>
                <option value="llc">DELAWARE</option>
                <option value="nonprofit">WYOMING</option>
                <option value="subsidiary">FLORIDA</option>
                <option value="inc">CALIFORNIA</option>
                <option value="corporation">NEVADA</option>
                <option value="corporation">Others</option>
              </select>
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
              <h3 className="h3-title">Main Applicant's Passport</h3>
              <input className="pd-fn" type="file" name="companyFile" id="companyFile" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Main Applicant's Proof of Address</h3>
              <input className="pd-fn" type="file" name="companyFile" id="companyFile" />
            </div>
            <div className="personal-deets-input">
              <h3 className="h3-title">Main Applicant's Signature</h3>
              <input className="pd-fn" type="file" name="companyFile" id="companyFile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
