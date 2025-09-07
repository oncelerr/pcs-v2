import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <>
      <div className="footer-cont">
        <div className="footer-wrp">
          <div className="top">
            <div className="pcs">
              <img className="abt-img" src="/assets/logo-wht.png" alt="" />
              <p className="abt-pcs">Premium Corporate Solutions is not a law firm and does not provide legal advice. Please refer to our Terms & Conditions and Privacy & Data Protection for more information.</p>
              <p className="email">email@example.com</p>
              <p className="phone-num">(555) 555-5555</p>
              <p className="address">100 Smith Street Collingwood VIC 3066 AU</p>
              <button className="get-in-touch">Get in touch</button>
              <div className="socials">
                <button className="facebook"><img src="/assets/facebook.png" alt="" /></button>
                <button className="instagram"><img src="/assets/instagram.png" alt="" /></button>
              </div>
            </div>
            <div className="catalog">
              <h1 className="catalog-title">Catalog</h1>
              <button className="nav-link-footer">Home</button>
              <button className="nav-link-footer">About</button>
              <button className="nav-link-footer">Services</button>
              <button className="nav-link-footer">Pricing</button>
              <button className="nav-link-footer">Contact</button>
            </div>
            <div className="servicess">
              <h1 className="service-title">Services</h1>
              <button className="nav-link-footer">Business Formation</button>
              <button className="nav-link-footer">Compliance & Legal</button>
              <button className="nav-link-footer">Brand & Representation</button>
              <button className="nav-link-footer">Virtual Office Solutions</button>
            </div>
            <div className="resources">
              <h1 className="resources-title">Resources</h1>
              <button className="nav-link-footer">Terms & Conditions</button>
              <button className="nav-link-footer">Privacy Policy</button>
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