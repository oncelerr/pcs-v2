import React from "react";
import "./About.css";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  return (
    <>
      <div className="abt-hero">
        <h1 className="abt-hero-h1">Your <span className="first-span">Partner</span> in <span className="second-span">Legal Clarity</span></h1>
        <p className="abt-hero-p">We're not just a document service – we're your partner in legal clarity.</p>
        <button className="abt-hero-btn" onClick={() => navigate('/register')}>Get Started</button>
      </div>
      <div className="section-two">
        <div className="section-two-wrp">
          <div className="section-two-left">
            <h1 className="section-two-left-h1">
              Who we are
            </h1>
          </div>
          <div className="section-two-right">
            <p className="section-two-right-p">
              At Premium Corp Solution, we help individuals and businesses across the U.S. navigate legal compliance with ease and confidence. Our mission is to simplify the complex – turning paperwork and legal requirements into a guided, stress-free experience.
              <br /><br />
              At Premium Corp Solution, we help individuals and businesses across the U.S. navigate legal compliance with ease and confidence. Our mission is to simplify the complex – turning paperwork and legal requirements into a guided, stress-free experience.
            </p>
          </div>
        </div>
      </div>
      <div className="section-three">
        <div className="nineth-wrp">
          <div className="nineth-left">
            <h1 className="nineth-title-h1">Reach Out – We’re Here for You</h1>
            <p className="nineth-p">
              Starting a business? Need help with tax filing? Looking to stay compliant? <br />
              Whatever stage you’re at, our team is ready to guide you every step of the way.
              <br />
              <br />
              <span className="nineth-p-bold">Quick Support, Clear Answers</span><br />
              Reach out today, and we’ll respond promptly with the guidance and solutions you need to move forward with confidence.
            </p>
            <button className="nineth-btn" onClick={() => navigate('/contact')}>Contact Us</button>
          </div>
          <div className="nineth-right">
            <img src="/assets/nineth-im.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
