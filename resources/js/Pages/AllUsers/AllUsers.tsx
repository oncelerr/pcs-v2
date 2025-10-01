import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AllUsers.css'
import { COUNTRIES } from '../../data/countries';

const AllUsers: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Table column configuration
  const columns = [
    { key: 'companyName', label: 'Company Name', width: 186 },
    { key: 'fullName', label: 'Full Name', width: 185 },
    { key: 'companyDesignator', label: 'Company Designator', width: 164 },
    { key: 'stateRegistration', label: 'State Registration', width: 155 },
    { key: 'franchise', label: 'Franchise', width: 131 },
    { key: 'irs', label: 'IRS', width: 109 },
    { key: 'action', label: 'Action', width: 80 }
  ];

  // Sample table data
  const tableData = [
    {
      companyName: "VIMA Vacation Intervals Management LLC",
      fullName: "Gerardo Alonso Espinosa de los Monteros Garrido",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "PRIXGIG",
      fullName: "Johnny Nel",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Acvs Corporation",
      fullName: "Héctor Manuel Aceves Ortega",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Enrosure Services",
      fullName: "Abhishek Shaw",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Freshh Anderson",
      fullName: "Greg Amponsah",
      companyDesignator: "Corporation",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Lemon Sun",
      fullName: "Alejandro Mendoza",
      companyDesignator: "LLC",
      stateRegistration: "FLORIDA",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Connect Train Me LLC",
      fullName: "Rishi Dinanath",
      companyDesignator: "LLC",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "LYNXLABS",
      fullName: "Jorge Alejandro Caballero Murillo",
      companyDesignator: "LLC",
      stateRegistration: "DELAWARE",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "Optic Health LLC",
      fullName: "Maria Elizabeth Nieuwoudt",
      companyDesignator: "LLC",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    },
    {
      companyName: "8020.studio LLC",
      fullName: "Vladimir Blagojevic",
      companyDesignator: "LLC",
      stateRegistration: "WYOMING",
      franchise: "04/11/2023",
      irs: "04/11/2023"
    }
  ];

  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'relative', background: '#F5F7F9', overflow: 'hidden' }}>
        <div style={{ width: 281, height: 1031, paddingLeft: 24, paddingRight: 24, paddingTop: 48, paddingBottom: 48, left: 0, top: 0, position: 'absolute', background: '#005444', borderTopRightRadius: 20, borderBottomRightRadius: 20, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex' }}>
            <img style={{ alignSelf: 'stretch', height: 51 }} src="https://placehold.co/233x51" />
            <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #C3D8D4 solid', outlineOffset: '-0.50px' }}></div>
            <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex' }}>
              <div style={{ alignSelf: 'stretch', background: '#146857', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
                <div style={{ alignSelf: 'stretch', paddingLeft: 14, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ width: 24, height: 24, position: 'relative' }}>
                      <div style={{ width: 17.50, height: 17.50, left: 3.25, top: 3.25, position: 'absolute', background: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>Home</div>
                  </div>
                </div>
              </div>
              <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
                <div style={{ alignSelf: 'stretch', paddingLeft: 14, paddingRight: 14, paddingTop: 16, paddingBottom: 16, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: 12, height: 5, left: 6, top: 14, position: 'absolute', borderRadius: 9999, outline: '1.50px white solid', outlineOffset: '-0.75px' }} />
                      <div style={{ width: 6, height: 6, left: 9, top: 5, position: 'absolute', borderRadius: 9999, outline: '1.50px white solid', outlineOffset: '-0.75px' }} />
                    </div>
                    <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>User Management</div>
                    <div style={{ width: 20, height: 20, position: 'relative', transform: 'rotate(-180deg)', transformOrigin: 'top left', overflow: 'hidden' }}>
                      <div style={{ width: 11.67, height: 5.83, left: 4.17, top: 7.50, position: 'absolute', outline: '1.50px white solid', outlineOffset: '-0.75px' }} />
                    </div>
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', paddingTop: 12, paddingBottom: 12, paddingLeft: 48, paddingRight: 14, background: '#9A2B60', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>All Users Registered</div>
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', paddingTop: 12, paddingBottom: 12, paddingLeft: 48, paddingRight: 14, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>Unprocessed Users</div>
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', paddingTop: 12, paddingBottom: 12, paddingLeft: 48, paddingRight: 14, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>Compliance</div>
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', paddingTop: 12, paddingBottom: 12, paddingLeft: 48, paddingRight: 14, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>Successful Compliance</div>
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', paddingTop: 12, paddingBottom: 12, paddingLeft: 48, paddingRight: 14, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>Compliance Uploaded Files</div>
                  </div>
                </div>
              </div>
              <div style={{ alignSelf: 'stretch', paddingLeft: 14, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                  <div style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: 18, height: 18, left: 3, top: 3, position: 'absolute', outline: '1.50px #B8DCD5 solid', outlineOffset: '-0.75px' }} />
                  </div>
                  <div style={{ flex: '1 1 0', color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '500', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>Content Manager</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: 221, paddingLeft: 14, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
            <div style={{ paddingLeft: 14, paddingRight: 14, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
              <div style={{ width: 2.56, height: 5.12, outline: '1.50px white solid', outlineOffset: '-0.75px' }} />
              <div style={{ width: 8, height: 16, outline: '1.50px white solid', outlineOffset: '-0.75px' }} />
              <div style={{ width: 24, height: 24, transform: 'rotate(-180deg)', transformOrigin: 'top left', opacity: 0 }} />
              <div style={{ width: 62, height: 25, color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: '400', lineHeight: 25.60, wordWrap: 'break-word' }}>Logout</div>
            </div>
          </div>
        </div>
        <div style={{ width: 1085, left: 313, top: 48, position: 'absolute', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ color: 'black', fontSize: 36, fontFamily: 'DM Sans', fontWeight: '700', lineHeight: 54, letterSpacing: 0.20, wordWrap: 'break-word' }}>Dashboard</div>
          <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 27, display: 'flex' }}>
            <div style={{ width: 329, height: 41, paddingLeft: 12.91, paddingRight: 12.91, paddingTop: 16.94, paddingBottom: 16.94, background: '#FEFEFE', borderRadius: 6.45, outline: '0.81px #D9D9D9 solid', outlineOffset: '-0.81px', justifyContent: 'center', alignItems: 'center', gap: 8.07, display: 'flex' }}>
              <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#757575', fontSize: 12.91, fontFamily: 'Font Awesome 6 Pro', fontWeight: '400', wordWrap: 'break-word' }}>search</div>
              <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#757575', fontSize: 12.91, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word' }}>Search</div>
            </div>
            <div style={{ justifyContent: 'flex-end', alignItems: 'center', gap: 22, display: 'flex' }}>
              <div style={{ width: 32, height: 32, paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
                <div style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: 16, height: 18, left: 4, top: 3, position: 'absolute', outline: '1.50px #0F172A solid', outlineOffset: '-0.75px' }} />
                  <div style={{ width: 8, height: 8, left: 15, top: 0, position: 'absolute', background: '#E03137', borderRadius: 12, outline: '2px white solid' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: 1083, paddingBottom: 32, paddingLeft: 32, paddingRight: 32, left: 315, top: 123, position: 'absolute', background: 'white', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', borderRadius: 16, outline: '1px #E7E7E7 solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'inline-flex' }}>
          <div style={{ width: 1083, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex' }}>
            <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex' }}>
              <div style={{ alignSelf: 'stretch', height: 68, paddingLeft: 27, paddingRight: 27, paddingTop: 17, paddingBottom: 17, borderTopLeftRadius: 16, borderTopRightRadius: 16, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex' }}>
                <div style={{ color: '#18987B', fontSize: 16, fontFamily: 'Font Awesome 6 Pro', fontWeight: '400', lineHeight: 24, letterSpacing: 0.20, wordWrap: 'break-word' }}>file</div>
                <div style={{ color: 'black', fontSize: 20, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 30, letterSpacing: 0.20, wordWrap: 'break-word' }}>All Users</div>
              </div>
              <div style={{ alignSelf: 'stretch', paddingLeft: 32, paddingRight: 32, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'flex' }}>
                <div style={{ alignSelf: 'stretch', height: 40, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ width: 498, alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: '#F8F8F8', overflow: 'hidden', borderRadius: 12, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                    <div style={{ width: 20, height: 20, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: 12, height: 12, left: 4, top: 4, position: 'absolute', outline: '1px #687588 solid', outlineOffset: '-0.50px' }} />
                    </div>
                    <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#687588', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Search</div>
                  </div>
                  <div style={{ width: 479, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 16, display: 'flex' }}>
                    <div style={{ flex: '1 1 0', alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: '#F8F8F8', overflow: 'hidden', borderRadius: 12, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                      <div style={{ width: 148, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Profession</div>
                      <div style={{ width: 16, height: 16, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: 9.33, height: 4.67, left: 3.33, top: 6, position: 'absolute', outline: '1px #323B49 solid', outlineOffset: '-0.50px' }} />
                      </div>
                    </div>
                    <div style={{ flex: '1 1 0', alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: '#F8F8F8', overflow: 'hidden', borderRadius: 12, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                      <div style={{ width: 148, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Status</div>
                      <div style={{ width: 16, height: 16, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: 9.33, height: 4.67, left: 3.33, top: 6, position: 'absolute', outline: '1px #323B49 solid', outlineOffset: '-0.50px' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: '#146755', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
                    <div style={{ width: 20, height: 20, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: 13.33, height: 13.33, left: 3.33, top: 3.33, position: 'absolute', outline: '1.50px white solid', outlineOffset: '-0.75px' }} />
                    </div>
                    <div style={{ textAlign: 'center', color: 'white', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 22.40, wordWrap: 'break-word' }}>Add a Candidate</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Table Header */}
            <div className="table-header">
              <div className="table-header-row">
                <div className="table-header-container">
                  {columns.map((column) => (
                    <div key={column.key} className="table-header-cell" style={{ width: column.width }}>
                      <div className="table-header-cell-content">
                        <div className={column.key === 'stateRegistration' ? 'table-header-text-alt' : column.key === 'action' ? 'table-header-action' : 'table-header-text'}>
                          {column.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Table Body - Optimized */}
          <div className="table-body">
            {tableData.map((row, index) => (
              <React.Fragment key={index}>
                <div className="table-row">
                  {columns.map((column) => (
                    <div key={column.key} className="table-cell" style={{ width: column.width }}>
                      <div className="table-cell-content">
                        {column.key === 'action' ? (
                          <div className="view-link">View</div>
                        ) : (
                          <div className="table-cell-text">
                            {row[column.key as keyof typeof row]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {index < tableData.length - 1 && <div className="table-divider"></div>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 164, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Gerardo Alonso Espinosa de los Monteros Garrido</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>DELAWARE</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>PRIXGIG</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Johnny Nel</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>DELAWARE</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Acvs Corporation</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 169, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Héctor Manuel Aceves Ortega</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>DELAWARE</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-end', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Enrosure Services</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Abhishek Shaw</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>DELAWARE</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Freshh Anderson</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Greg Amponsah</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Corporation</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>WYOMING</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Lemon Sun</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Alejandro Mendoza</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>FLORIDA</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Connect Train Me LLC</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Rishi Dinanath</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>WYOMING</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LYNXLABS</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 169, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Jorge Alejandro Caballero Murillo</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>DELAWARE</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Optic Health LLC</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 169, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Maria Elizabeth Nieuwoudt</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>WYOMING</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', height: 0, outline: '1px #E0E0E0 solid', outlineOffset: '-0.50px' }}></div>
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
        <div style={{ width: 186, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>8020.studio LLC</div>
          </div>
        </div>
        <div style={{ width: 185, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingTop: 2, paddingBottom: 2, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>Vladimir Blagojevic</div>
          </div>
        </div>
        <div style={{ width: 164, height: 56, paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex' }}>
          <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>LLC</div>
        </div>
        <div style={{ width: 155, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3E4654', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>WYOMING</div>
          </div>
        </div>
        <div style={{ width: 131, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ width: 109, height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#323B49', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word' }}>04/11/2023</div>
          </div>
        </div>
        <div style={{ height: 57, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex' }}>
            <div style={{ width: 44, textAlign: 'center', color: '#9A2B60', fontSize: 14, fontFamily: 'DM Sans', fontWeight: '500', lineHeight: 21, letterSpacing: 0.20, wordWrap: 'break-word' }}>View</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllUsers;
