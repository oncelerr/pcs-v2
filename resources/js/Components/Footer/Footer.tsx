import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

// Footer links are real links, so they work with keyboard, middle-click and
// "open in new tab". Hash targets (#pricing-section, #service) are scrolled to
// by the router listener in app.tsx once the page has rendered.
const SERVICE_LINKS = [
  { label: "Business Formation", slug: "business-formation" },
  { label: "Compliance & Legal", slug: "compliance-and-legal" },
  { label: "Brand & Representation", slug: "brand-and-representation" },
  { label: "Virtual Office Solutions", slug: "virtual-office-solutions" },
];

export default function Footer() {
  return (
    <footer className="footer-cont">
      <div className="footer-wrp">
        <div className="top">
          <div className="pcs">
            <img className="abt-img" src="/assets/logo-wht.png" alt="Premium Corporate Solutions" width={330} height={40} />
            <p className="abt-pcs">Premium Corporate Solutions is not a law firm and does not provide legal advice. Please refer to our Terms & Conditions and Privacy & Data Protection for more information.</p>
            <p className="email"><a href="mailto:support@premiumcorpsolutions.com">support@premiumcorpsolutions.com</a></p>
            <p className="address">30 North Gould Street, Sheridan, WY, United States, Wyoming</p>
            <Link className="get-in-touch" to="/contact">Get in touch</Link>
            <div className="socials">
              <a className="social-link" href="https://www.facebook.com/premiumcorporatesolutions" target="_blank" rel="noopener noreferrer" aria-label="Facebook (opens in a new tab)"><img src="/assets/facebook.png" alt="Facebook" /></a>
              <a className="social-link" href="https://www.instagram.com/premiumcorpsolutions/" target="_blank" rel="noopener noreferrer" aria-label="Instagram (opens in a new tab)"><img src="/assets/instagram.png" alt="Instagram" /></a>
              <a className="social-link" href="https://www.linkedin.com/company/108148701" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)"><img src="/assets/linkedin.png" alt="LinkedIn" /></a>
            </div>
          </div>
          <nav className="footer-col catalog" aria-labelledby="footer-catalog">
            <h2 className="footer-col-title" id="footer-catalog">Catalog</h2>
            <Link className="nav-link-footer" to="/">Home</Link>
            <Link className="nav-link-footer" to="/about">About</Link>
            <Link className="nav-link-footer" to="/services">Services</Link>
            <Link className="nav-link-footer" to="/#pricing-section">Pricing</Link>
            <Link className="nav-link-footer" to="/contact">Contact</Link>
          </nav>
          <nav className="footer-col servicess" aria-labelledby="footer-services">
            <h2 className="footer-col-title" id="footer-services">Services</h2>
            {SERVICE_LINKS.map((service) => (
              <Link key={service.slug} className="nav-link-footer" to={`/services?service=${service.slug}#service`}>
                {service.label}
              </Link>
            ))}
          </nav>
          <nav className="footer-col resources" aria-labelledby="footer-resources">
            <h2 className="footer-col-title" id="footer-resources">Resources</h2>
            <Link to="/terms" className="nav-link-footer">Terms & Conditions</Link>
            <Link to="/privacy" className="nav-link-footer">Privacy Policy</Link>
          </nav>
          <div className="footer-col accepted-payments">
            <h2 className="footer-col-title">Accepted Payments</h2>
            <ul className="payment-list">
              <li>Paypal</li>
              <li>Mastercard</li>
              <li>Visa</li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <p>All rights reserved @ Premium Corp Solutions 2025 | Made by <a href="https://vibehive.ph" target="_blank" rel="noopener noreferrer">Vibe Hive Digital Services</a></p>
        </div>
      </div>
    </footer>
  );
}
