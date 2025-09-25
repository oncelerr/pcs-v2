import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  return null;
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <ScrollToTop />
      <div className={`navbar-cont ${scrolled ? "scrolled" : ""}`}>
        <div className={`navbar-wrp ${scrolled ? "scrolled" : ""}`}>
          <img 
            src="/assets/Logo.png" 
            alt="Logo" 
            onClick={() => handleNavigation("/")} 
            style={{ cursor: 'pointer' }}
          />
          <div className="nav-links">
            <button onClick={() => handleNavigation("/")} className="nav-link">Home</button>
            <button onClick={() => handleNavigation("/about")} className="nav-link">About</button>
            <button onClick={() => handleNavigation("/services")} className="nav-link">Services</button>
            <button onClick={() => handleNavigation("/contact")} className="nav-link">Contact</button>
            {user && (
              <button 
                onClick={() => handleNavigation("/dashboard")} 
                className="nav-link"
              >
                Dashboard
              </button>
            )}
          </div>
          {user ? (
            <div className="user-actions">
              <button onClick={handleLogout} className="login-btn">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => handleNavigation("/login")} className="login-btn">
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
}
