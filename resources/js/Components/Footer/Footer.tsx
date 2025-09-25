import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <>
      <div className="footer-cont">
        <div className="footer-wrp">
          <div className="top">
            <div className="pcs">
              <img className="abt-img" src="/assets/logo-wht.png" alt="" />
              <p className="abt-pcs">Premium Corporate Solutions is not a law firm and does not provide legal advice. Please refer to our Terms & Conditions and Privacy & Data Protection for more information.</p>
              <p className="email">admin@premiumcorpsolutions.com</p>
              <p className="phone-num">+1 3204297403</p>
              <p className="address">30 North Gould Street, Sheridan, WY, United States, Wyoming</p>
              <button className="get-in-touch" onClick={() => navigate('/contact')}>Get in touch</button>
              <div className="socials">
                <a className="facebook" href="https://www.facebook.com/premiumcorporatesolutions" target="_blank" rel="noopener noreferrer"><img src="/assets/facebook.png" alt="Facebook" /></a>
                <a className="instagram" href="https://www.instagram.com/premiumcorpsolutions/" target="_blank" rel="noopener noreferrer"><img src="/assets/instagram.png" alt="Instagram" /></a>
                <a className="linkedin" href="https://www.linkedin.com/company/108148701" target="_blank" rel="noopener noreferrer"><img src="/assets/linkedin.png" alt="LinkedIn" /></a>
              </div>
            </div>
            <div className="catalog">
              <h1 className="catalog-title">Catalog</h1>
              <button className="nav-link-footer" onClick={() => navigate('/')}>Home</button>
              <button className="nav-link-footer" onClick={() => navigate('/about')}>About</button>
              <button className="nav-link-footer" onClick={() => navigate('/services')}>Services</button>
              <button
                className="nav-link-footer"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  // Small delay to ensure the home page has loaded before scrolling
                  setTimeout(() => {
                    const element = document.getElementById('pricing-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                Pricing
              </button>
              <button className="nav-link-footer" onClick={() => navigate('/contact')}>Contact</button>
            </div>
            <div className="servicess">
              <h1 className="service-title">Services</h1>
              <button className="nav-link-footer"
                onClick={() => {
                  navigate('/services?service=business-formation');
                  setTimeout(() => {
                    const element = document.getElementById('service');
                    if (element) {
                      const yOffset = -100;
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >Business Formation</button>
              <button className="nav-link-footer"
                onClick={() => {
                  navigate('/services?service=compliance-and-legal');
                  setTimeout(() => {
                    const element = document.getElementById('service');
                    if (element) {
                      const yOffset = -100;
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >Compliance & Legal</button>
              <button className="nav-link-footer"
                onClick={() => {
                  navigate('/services?service=brand-and-representation');
                  setTimeout(() => {
                    const element = document.getElementById('service');
                    if (element) {
                      const yOffset = -100;
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >Brand & Representation</button>
              <button className="nav-link-footer"
                onClick={() => {
                  navigate('/services?service=virtual-office-solutions');
                  setTimeout(() => {
                    const element = document.getElementById('service');
                    if (element) {
                      const yOffset = -100;
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >Virtual Office Solutions</button>
            </div>
            <div className="resources">
              <h1 className="resources-title">Resources</h1>
              <button onClick={() => navigate('/terms')} className="nav-link-footer">Terms & Conditions</button>
              <button onClick={() => navigate('/privacy')} className="nav-link-footer">Privacy Policy</button>
            </div>
            <div className="accepted-payments">
              <h1 className="accepted-payments-title">Accepted Payments</h1>
              <button className="nav-link-footer">Paypal</button>
              <button className="nav-link-footer">Mastercard</button>
              <button className="nav-link-footer">Visa</button>
            </div>
          </div>
          <div className="bottom">
            <p>All rights reserved @ Premium Corp Solution 2025 | Made by <a href="https://vibehive.ph">Vibe Hive Digital Services</a></p>
          </div>
        </div>
      </div>
    </>
  );
}