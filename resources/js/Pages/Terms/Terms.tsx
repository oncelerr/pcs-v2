import React from "react";
import "./Terms.css";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();
  return (
    <>
      <div className="term-hero">
        <button className="term-back-btn" onClick={() => navigate(-1)}><img className="term-back-img" src="/assets/Back.png" alt="" /></button>
        <h1 className="term-h1">Terms & Conditions</h1>
        <p className="term-p">Last updated: September 20, 2025</p>
      </div>
      <div className="terms-content content">
        <section className="terms-section">
          <p>
            Welcome to Premium Corp Solutions. These Terms of Service ("Terms") govern your use of our website, 
            <a href="https://premiumcorpsolutions.com" target="_blank" rel="noopener noreferrer">https://premiumcorpsolutions.com</a> 
            (the "Site"), and the business formation, compliance, and related services we provide (collectively, the "Services").
          </p>
          <p>
            By using our Site or Services, you agree to be legally bound by these Terms. If you do not agree, you must discontinue use immediately.
          </p>
        </section>

        <section className="terms-section">
          <h2>1. SCOPE OF SERVICES</h2>
          <p>
            Premium Corp Solutions provides assistance with U.S. company formation, registered agent services, annual compliance, 
            EIN applications, trademarks, DBAs, and other related business services.
          </p>
          <p className="disclaimer">
            We are not a law firm, accounting firm, or financial advisory firm, and our Services do not constitute legal, tax, or financial advice. 
            For such matters, you should consult a licensed professional.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. USER RESPONSIBILITIES</h2>
          <p>
            You agree to provide complete and accurate information when using our Services. You are responsible for maintaining the 
            confidentiality of your account information and for any activity that occurs under your account. Premium Corp Solutions 
            is not responsible for issues caused by inaccurate or incomplete information provided by you.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. PAYMENTS AND REFUNDS</h2>
          <p>
            All fees must be paid in full before Services are rendered unless otherwise agreed in writing. Once filings or processing 
            have begun, fees are non-refundable, even if a filing is rejected or delayed by a government agency.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. NO GUARANTEE OF OUTCOMES</h2>
          <p>
            We strive to provide accurate and timely Services, but we cannot guarantee approval by any state, federal, or regulatory 
            authority. The success of your business venture remains your responsibility.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. INTELLECTUAL PROPERTY</h2>
          <p>
            All content on the Site—including text, graphics, logos, and design—is the property of Premium Corp Solutions or its licensors. 
            Unauthorized use, reproduction, or distribution of our content is prohibited.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. THIRD PARTY SERVICES</h2>
          <p>
            Our Services may involve third-party providers such as payment processors and state filing agencies. While we carefully 
            select our partners, Premium Corp Solutions is not responsible for their actions, delays, or errors.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. LIMITATION OF LIABILITY</h2>
          <p>
            To the maximum extent permitted by law, Premium Corp Solutions shall not be liable for indirect, incidental, or consequential 
            damages arising from your use of the Site or Services. Our total liability shall not exceed the fees paid by you for the 
            Service in question.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. TERMINATION</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Site or Services if you violate these Terms or applicable law.
          </p>
        </section>

        <section className="contact-section">
          <p>If you have questions about these Terms, please contact us:</p>
          <p>
            Premium Corp Solutions<br />
            Email: <a href="mailto:support@premiumcorpsolutions.com">support@premiumcorpsolutions.com</a><br />
            Address: 30 N. Gould St. Sheridan, Wyoming 82801
          </p>
        </section>
      </div>
    </>
  )
}