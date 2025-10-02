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
      <div className="personal-deets-cont">
        <div className="personal-deets-header">
          <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
          <h3 className="h3-title">All User Registered</h3>
        </div>
        <div className="tool-bar">
          <input className="search-bar" type="text" placeholder="Search" />
          <select className="dropdown-bar" name="" id="">
            <option value="" disabled>Select Profession</option>
            <option value="">Active</option>
            <option value="">Inactive</option>
          </select>
          <input className="status-bar" type="text" placeholder="Status" />
          <button className="add-candidate">Add Candidate</button>
        </div>
        <table className="all-users-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Full Name</th>
              <th>Company Designator</th>
              <th>State Registration</th>
              <th>Franchise</th>
              <th>IRS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((country, index) => (
              <tr key={index}>
                <td>{country.companyName}</td>
                <td>{country.fullName}</td>
                <td>{country.companyDesignator}</td>
                <td>{country.stateRegistration}</td>
                <td>{country.franchise}</td>
                <td>{country.irs}</td>
                <td><button className="all-users-table-btn">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AllUsers;
