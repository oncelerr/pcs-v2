import React, { useLayoutEffect, useRef } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { EASE_OUT, gsap, prefersReducedMotion, scrollToSection, useReveal } from "../../lib/motion";

export default function Home() {
  const helpCards = [
    {
      icon: "/assets/building.png",
      title: "Easy Registration",
      text: "We take care of the full registration process, making sure your company is set up correctly and legally in the U.S., without the usual stress and confusion.",
    },
    {
      icon: "/assets/file.png",
      title: "Timely Tax Filing",
      text: "Our team ensures your business taxes are filed properly and on time, helping you avoid penalties and stay compliant with U.S. tax laws.",
    },
    {
      icon: "/assets/calendar.png",
      title: "Year-Round Compliance",
      text: "Staying compliant doesn't stop after registration. We monitor your business’ obligations throughout the year so you never miss a deadline or face unexpected penalties.",
    },
    {
      icon: "/assets/building.png",
      title: "Business Growth Focus",
      text: "With the technicalities handled, you can finally focus on growing your business. We’re here to support your journey with reliable compliance and advisory services.",
    },
  ];

  const whyChooseUsCards = [
    [
      {
        img: "/assets/coins.png",
        title: "Value For Money",
        text: "We don’t promise “ZERO FEES” only to add hidden costs later. Our one-time payment covers everything you need to start your business.",
      },
      {
        img: "/assets/laptop-mobile.png",
        title: "User-Friendly",
        text: "Track the progress of your filings with ease. Access your mail and documents in a few taps.",
      },
    ],
    [
      {
        img: "/assets/chart-line.png",
        title: "Straightforward Process",
        text: "Form your business with confidence through a straightforward process from start to success.",
      },
      {
        img: "/assets/badge-check.png",
        title: "Compliance Guarantee",
        text: "Track the progress of your filings with ease. Access your mail and documents in a few taps.",
      },
    ],
  ];

  const servicesList = [
    {
      title: "Business Formation",
      text: "We take care of the full registration process, making sure your company is set up correctly and legally in the U.S., without the usual stress and confusion.",
      link: "business-formation"
    },
    {
      title: "Compliance & Legal",
      text: "Staying compliant doesn't stop after registration. We monitor your business’ obligations throughout the year so you never miss a deadline or face unexpected penalties.",
      link: "compliance-and-legal"
    },
    {
      title: "Brand & Representation",
      text: "With the technicalities handled, you can finally focus on growing your business. We’re here to support your journey with reliable compliance and advisory services.",
      link: "brand-and-representation"
    },
    {
      title: "Virtual Office Solutions",
      text: "Our team ensures your business taxes are filed properly and on time, helping you avoid penalties and stay compliant with U.S. tax laws.",
      link: "virtual-office-solutions"
    },
  ];

  const pricingPlans = [
    {
      badge: "Basic",
      price: "$349",
      title: "LLC Basic Plan",
      popular: true,
      inclusions: [
        "Company Formation + Documents of Registration",
        "Employer Identification Number (EIN)",
        "Beneficial Ownership Information Reporting (BOI)",
        "Registered Agent Subscription",
        "Bank Account Registration",
        "Dashboard Access",
      ],
    },
    {
      badge: "Basic",
      price: "$399",
      title: "Corp Basic Plan",
      inclusions: [
        "Company Formation + Documents of Registration",
        "Employer Identification Number (EIN)",
        "Beneficial Ownership Information Reporting (BOI)",
        "Registered Agent Subscription",
        "Bank Account Registration",
        "Dashboard Access",
      ],
    },
    {
      badge: "Premium",
      price: "$499",
      title: "LLC Premium Plan",
      inclusions: [
        "Company Formation + Documents of Registration",
        "Employer Identification Number (EIN)",
        "Beneficial Ownership Information Reporting (BOI)",
        "Registered Agent Subscription",
        "Bank Account Registration",
        "Dashboard Access",
        "Worry-free Annual Compliance Reporting",
        "Worry-free Annual Tax Return Filing",
        "Certificate of Good Standing",
      ],
    },
    {
      badge: "Premium",
      price: "$599",
      title: "Corp Premium Plan",
      inclusions: [
        "Company Formation + Documents of Registration",
        "Employer Identification Number (EIN)",
        "Beneficial Ownership Information Reporting (BOI)",
        "Registered Agent Subscription",
        "Bank Account Registration",
        "Dashboard Access",
        "Worry-free Annual Compliance Reporting",
        "Worry-free Annual Tax Return Filing",
        "Certificate of Good Standing",
      ],
    },
  ];

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const scrollToPricing = () => {
    scrollToSection('pricing-section');
  };

  // Scroll-triggered reveals for everything marked data-reveal
  useReveal(pageRef);

  // One short intro sequence for the hero; everything else stays still
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: EASE_OUT } })
        .from('.hero-h1 > span', { y: 22, autoAlpha: 0, duration: 0.6, stagger: 0.08 })
        .from('.hero-p', { y: 12, autoAlpha: 0, duration: 0.45 }, '-=0.35')
        .from('.btn-wrp > *', { y: 12, autoAlpha: 0, duration: 0.45, stagger: 0.06, clearProps: 'transform' }, '-=0.3');
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page" ref={pageRef}>
      <div className="home-container" ref={heroRef}>
        <h1 className="hero-h1">
          <span className="prem-span">Premium</span> <span className="business-span">Business</span> <span>Formation & Registered Agent Solutions for Global Owners</span>
        </h1>
        <p className="hero-p">Business Registration • Tax Filing • Compliance</p>
        <div className="btn-wrp">
          <Link className="get-started-btn" to="/services">Get Started</Link>
          <button type="button" className="see-pricing-btn" onClick={scrollToPricing}>See Pricing</button>
        </div>
      </div>
      <div className="payments">
        <img src="/assets/amazon.png" alt="Amazon" />
        <img src="/assets/shopify.png" alt="Shopify" />
        <img src="/assets/stripe.png" alt="Stripe" />
      </div>
      <div className="third-section">
        <div className="third-left" data-reveal><img src="/assets/flag.png" alt="" /></div>
        <div className="third-right" data-reveal>
          <h1 className="third-h1">Having a Hard Time Registering Your Business in the U.S.?</h1>
          <p className="third-p">Starting a business in the U.S. can be confusing and stressful. The paperwork, legal steps, and tax rules aren’t easy — and small mistakes can cause big delays. We’re here to make it simple, fast, and stress-free so you can focus on growing your business.</p>
        </div>
      </div>
      <div className="fourth-section">
        <h1 className="fourth-h1" data-reveal>
          How We Help You <span className="span-succeed">Succeed</span>
        </h1>
        <div className="card-wrp">
          {helpCards.map((card, index) => (
            <React.Fragment key={index}>
              <div className="card" data-reveal>
                <div className="icon"><img src={card.icon} alt="" /></div>
                <p className="title-p">{card.title}</p>
                <p className="fourth-p">{card.text}</p>
              </div>
              {index !== helpCards.length - 1 && <div className="vr"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="fifth-section">
        <div className="fifth-left" data-reveal>
          <h1 className="fifth-h1">Why Choose Us?</h1>
          <p className="fifth-p">
            Effortless U.S. Business Formation <br /> for International Founders—
            Affordable, Expert-Guided, and 100% Compliant. From registration to tax
            filing, we handle the complexities so you can focus on growing your
            business.
          </p>
        </div>

        <div className="fifth-right">
          {whyChooseUsCards.map((row, rowIndex) => (
            <div className="top-card-wrp" key={rowIndex}>
              {row.map((card, cardIndex) => (
                <div className="top-card" key={cardIndex} data-reveal>
                  <img src={card.img} alt="" />
                  <p className="top-card-title">{card.title}</p>
                  <p className="top-card-p">{card.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="sixth-section">
        <div className="sixth-wrp">
          <h1 className="sixth-h1" data-reveal>Our Services</h1>
          <p className="sixth-p" data-reveal>
            Discover what we do best. Explore our wide range of services designed to
            help you achieve your goals with efficiency and impact.
          </p>
          <img className="sixth-img" src="/assets/banner.png" alt="" data-reveal />

          <div className="service-wrp">
            {servicesList.map((service, index) => (
              <React.Fragment key={index}>
                <div className="services" data-reveal>
                  <h1 className="services-h1">{service.title}</h1>
                  <p className="services-p">{service.text}</p>
                  <Link
                    className="services-btn"
                    to={`/services?service=${service.link}#service`}
                    aria-label={`View ${service.title} services`}
                  >
                    <img src="/assets/arrow.png" alt="" />
                  </Link>
                </div>
                {index !== servicesList.length - 1 && <div className="hr"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div id="pricing-section" className="seventh-section">
        <div className="seventh-wrp">
          <h1 className="seventh-h11" data-reveal>Simple, One-Time Pricing</h1>
          <p className="seventh-p" data-reveal>Pay once, enjoy our services without hidden fees or recurring charges.</p>
          <img className="seventh-dots" src="/assets/dots.png" alt="" aria-hidden="true" />
          <div className="seventh-card-wrp">
            {pricingPlans.map((plan, index) => (
              <div className={`seventh-card ${plan.popular ? "is-popular" : ""}`} key={index} data-reveal>
                {plan.popular && <div className="popular-badge">Popular</div>}
                <p className="seventh-badge">{plan.badge}</p>
                <h1 className="seventh-title">
                  {plan.price} <span>One Time</span>
                </h1>
                <Link className="seventh-btn" to="/register" aria-label={`Get Started with the ${plan.title}`}>Get Started</Link>
                <div className="seventh-hr"></div>
                <h1 className="seventh-h1">{plan.title}</h1>

                {plan.inclusions.map((inc, i) => (
                  <div className="seventh-inclusions" key={i}>
                    <img src="/assets/check-circle.png" alt="" />
                    <div className="seventh-inclusion-txt">{inc}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <img className="seventh-dots-2" src="/assets/dots.png" alt="" aria-hidden="true" />
        </div>
      </div>
      <div className="eight-section">
        <div className="eight-top">
          <div className="eight-left" data-reveal>
            <h1 className="eight-h1">
              <span className="eight-1-span">Go Global.</span><br />
              <span className="eight-2-span">Go Bigger.</span><br />
              Start with a U.S. <br />business.
            </h1>
            <p className="eight-p">Starting a business in the United States provides access to the world’s largest market, a trusted legal and financial system, and global credibility. <br /><br />As a U.S. business owner, you can enjoy tax advantages, limited liability protection, and the flexibility to scale worldwide. With access to funding, banking, international payment platforms, and top talent, your U.S. business is set up for long-term growth and success.</p>
            <Link className="eight-btn" to="/register">Start Your U.S. Business</Link>
          </div>
          <div className="eight-right" data-reveal>
            <img src="/assets/us-map.png" alt="" className="eight-img" />
          </div>
        </div>
        <div className="eight-bottom" data-reveal>
          <h1 className="eight-bottom-h1">Take the first step toward a stress-free <br />business journey.</h1>
          <Link className="eigth-btn-bottom" to="/register">Sign up today!</Link>
        </div>
      </div>
      <div className="nineth-section">
        <div className="nineth-wrp">
          <div className="nineth-left" data-reveal>
            <h1 className="nineth-title-h1">Reach Out – We’re Here for You</h1>
            <p className="nineth-p">
              Starting a business? Need help with tax filing? Looking to stay compliant? <br />
              Whatever stage you’re at, our team is ready to guide you every step of the way.
              <br />
              <br />
              <span className="nineth-p-bold">Quick Support, Clear Answers</span><br />
              Reach out today, and we’ll respond promptly with the guidance and solutions you need to move forward with confidence.
            </p>
            <Link className="nineth-btn" to="/contact">
              Contact Us
            </Link>
          </div>
          <div className="nineth-right" data-reveal>
            <img src="/assets/nineth-im.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
