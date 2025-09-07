import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0); // threshold
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`navbar-cont ${scrolled ? "scrolled" : ""}`}>
      <div className={`navbar-wrp ${scrolled ? "scrolled" : ""}`}>
        <img src="/assets/Logo.png" alt="Logo" />
        <div className="nav-links">
          <button onClick={() => navigate("/")} className="nav-link">Home</button>
          <button onClick={() => navigate("/about")} className="nav-link">About</button>
          <button onClick={() => navigate("/services")} className="nav-link">Services</button>
          <button onClick={() => navigate("/contact")} className="nav-link">Contact</button>
        </div>
        <button className="login-btn">Login</button>
      </div>
    </div>
  );
}
