import React from "react";
import "./Privacy.css";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <>
      <div className="term-hero">
        <button className="term-back-btn" onClick={() => navigate(-1)}><img className="term-back-img" src="/assets/Back.png" alt="" /></button>
        <h1 className="term-h1">Privacy Policy</h1>
        <p className="term-p">Last updated: September 20, 2025</p>
      </div>
      <div className="terms-content content">
        <section className="terms-section">
          <p>
            Premium Corp Solutions (“Company,” “we,” “our,” or “us”) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website, https://premiumcorpsolutions.com (the “Site”), and our business services (the “Services”).
          </p>
          <br />
          <p>
            By using our Site or Services, you agree to be legally bound by these Terms. If you do not agree, you must discontinue use immediately.
          </p>
        </section>

        <section className="terms-section">
          <h2>1. INFORMATION WE COLLECT</h2>
          <p>
            We collect information you provide, such as your name, email address, phone number, business details, and payment information. We may also collect technical data automatically, including IP addresses, browser types, and browsing activity, through cookies and similar technologies.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. HOW WE USE INFORMATION</h2>
          <p>
            We use the information you provide to deliver and manage our Services effectively. This includes processing business filings, handling compliance requirements, and maintaining accurate records for your company. We also use your information to communicate with you regarding important updates, deadlines, and other filing-related matters. In addition, the information collected allows us to improve our website and enhance the overall user experience. From time to time, we may also send you promotional messages and compliance reminders. If at any point you prefer not to receive such communications, you may opt out as permitted by law.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. SHARING OF INFORMATION</h2>
          <p>
            Premium Corp Solutions does not sell your personal information under any circumstances. However, in order to provide our Services, we may share your information with trusted service providers, such as payment processors or registered agents, who play a role in fulfilling your business needs. In certain cases, we may also need to share your details with government agencies to complete filings or other official requirements. Additionally, we may disclose information when legally required to do so, such as in response to lawful requests by public authorities or to comply with applicable laws and regulations.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. DATA RETENTION AND SECURITY</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes described in this Privacy Policy or as required by law. We take reasonable technical, administrative, and physical measures to safeguard your data against loss, theft, or unauthorized access. While we strive to protect your information, no method of data transmission or storage is completely secure, and we cannot guarantee absolute protection.

          </p>
        </section>

        <section className="terms-section">
          <h2>5. GDPR Compliance (European Union Residents)</h2>
          <p>
            If you are located in the European Union, you have specific rights under the General Data Protection Regulation (GDPR). These rights include the ability to access and receive a copy of your personal data, request corrections, request deletion of your information, restrict or object to certain processing activities, and request data portability. If you wish to exercise these rights, you may contact us using the details provided below. We will respond in accordance with GDPR requirements.

          </p>
        </section>

        <section className="terms-section">
          <h2>6. CCPA Compliance (California Residents)</h2>
          <p>
            If you are a resident of California, the California Consumer Privacy Act (CCPA) grants you certain rights. These include the right to know what personal information we collect, the right to request its deletion, the right to opt out of the sale of personal data (note that we do not sell personal information), and the right not to be discriminated against for exercising these rights. Requests to exercise these rights may be submitted through the contact details provided below, and we may verify your identity before processing them.

          </p>
        </section>

        <section className="terms-section">
          <h2>7. INTERNATIONAL DATA TRANSFERS</h2>
          <p>
            Because Premium Corp Solutions operates in the United States, information you provide may be transferred to and processed in the U.S. By using our Site or Services, you consent to these transfers, understanding that privacy protections may differ from those in your country of residence.

          </p>
        </section>

        <section className="terms-section">
          <h2>8. CHILDREN’S PRIVACY</h2>
          <p>
            Our Services are intended for use by individuals over the age of 18. We do not knowingly collect personal data from children. If we become aware that a child under 18 has submitted information to us, we will take immediate steps to delete such data.

          </p>
        </section>

        <section className="terms-section">
          <h2>9. CHANGES TO THIS POLICY</h2>
          <p>
            We may revise this Privacy Policy from time to time to reflect changes in our practices or to comply with evolving legal requirements. Any updates will be posted on this page, with the “Last Updated” date adjusted accordingly. Continued use of our Site or Services after updates indicates your acceptance of the revised policy.
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