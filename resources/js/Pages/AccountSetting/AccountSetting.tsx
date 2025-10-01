import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AccountSetting.css'
import { COUNTRIES } from '../../data/countries';

const AccountSetting: React.FC = () => {
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
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Username</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">New Password</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <h3 className="h3-title">Confirm Password</h3>
              <input className="pd-fn" type="text" name="" id="" />
            </div>
          </div>
          <div className="personal-deets-section">
            <div className="personal-deets-input">
              <button className="reset-creds">Reset Credentials</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
