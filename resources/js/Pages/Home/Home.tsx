import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Home.css";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

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

  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroParagraphRef = useRef<HTMLParagraphElement>(null);
  const paymentsRef = useRef<HTMLDivElement>(null);
  const thirdSectionRef = useRef<HTMLDivElement>(null);
  const thirdLeftRef = useRef<HTMLDivElement>(null);
  const thirdRightRef = useRef<HTMLDivElement>(null);
  const fourthSectionRef = useRef<HTMLDivElement>(null);
  const fourthHeadingRef = useRef<HTMLHeadingElement>(null);
  const servicesSectionRef = useRef<HTMLDivElement>(null);
  const servicesContentRef = useRef<HTMLDivElement>(null);
  const servicesListRef = useRef<HTMLDivElement>(null);
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (heroHeadingRef.current) {
      const heading = heroHeadingRef.current;
      const spans = heading.querySelectorAll('span');
      
      // Reset initial state for heading
      gsap.set(spans, { 
        y: 50, 
        opacity: 0,
        display: 'inline-block' 
      });

      // Animate each span with a slight delay
      spans.forEach((span, index) => {
        gsap.to(span, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true
          }
        });
      });
    }

    // Animate the hero paragraph
    if (heroParagraphRef.current) {
      gsap.fromTo(heroParagraphRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.3, // Slight delay after heading animation
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heroParagraphRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    // Animate payment logos with fade in
    if (paymentsRef.current) {
      const logos = paymentsRef.current.querySelectorAll('img');
      gsap.fromTo(logos,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          stagger: 0.2, // Slight delay between each logo
          scrollTrigger: {
            trigger: paymentsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    // Animate fourth section heading
    if (fourthSectionRef.current && fourthHeadingRef.current) {
      const heading = fourthHeadingRef.current;
      const span = heading.querySelector('span');
      
      // Initial state
      gsap.set(span, { 
        display: 'inline-block',
        color: '#9A2B60',
        scale: 0.8,
        opacity: 0
      });

      // Animation
      gsap.to(span, {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
          trigger: fourthSectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    }

    // Animate third section
    if (thirdSectionRef.current && thirdLeftRef.current && thirdRightRef.current) {
      // Animate flag image (slide up with fade)
      gsap.fromTo(thirdLeftRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: thirdSectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Animate right content (fade in)
      const rightContent = [
        thirdRightRef.current.querySelector('h1'),
        thirdRightRef.current.querySelector('p')
      ].filter(Boolean);

      gsap.fromTo(rightContent,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.2,
          scrollTrigger: {
            trigger: thirdRightRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    // Animate services section
    if (servicesSectionRef.current && servicesContentRef.current && servicesListRef.current) {
      // Animate section header
      gsap.fromTo(
        servicesContentRef.current.querySelector('h1, p'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: servicesSectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Animate services list
      const serviceItems = servicesListRef.current.querySelectorAll('.services');
      gsap.fromTo(
        serviceItems,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: servicesListRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }
  }, []);

  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const pricingSection = useRef<HTMLDivElement>(null);
  const pricingCards = useRef<HTMLDivElement[]>([]);
  const pricingTitle = useRef<HTMLHeadingElement>(null);
  const pricingSubtitle = useRef<HTMLParagraphElement>(null);

  // GSAP Animation
  useEffect(() => {
    if (!pricingSection.current) return;

    // Animation for title and subtitle
    gsap.fromTo(
      [pricingTitle.current, pricingSubtitle.current],
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: pricingSection.current,
          start: "top 70%",
          toggleActions: "play none none none"
        }
      }
    );

    gsap.fromTo(
      pricingCards.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: pricingSection.current,
          start: "top 60%",
          toggleActions: "play none none none"
        }
      }
    );

    // Clean up ScrollTrigger instances on component unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Add cards to the ref array
  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !pricingCards.current.includes(el)) {
      pricingCards.current.push(el);
    }
  };

  return (
    <>
      <div className="home-container">
        <h1 className="hero-h1" ref={heroHeadingRef}>
          <span className="prem-span">Premium</span> <span className="business-span">Business</span> <span>Formation & Registered Agent Solutions for Global Owners</span>
        </h1>
        <p className="hero-p" ref={heroParagraphRef}>Business Registration • Tax Filing • Compliance</p>
        <div className="btn-wrp">
          <button className="get-started-btn" onClick={() => handleNavigation("/services")}>Get Started</button>
          <button className="see-pricing-btn" onClick={scrollToPricing}>See Pricing</button>
        </div>
      </div>
      <div className="payments" ref={paymentsRef}>
        <img src="/assets/amazon.png" alt="" />
        <img src="/assets/shopify.png" alt="" />
        <img src="/assets/stripe.png" alt="" />
      </div>
      <div className="third-section" ref={thirdSectionRef}>
        <div className="third-left" ref={thirdLeftRef}><img src="/assets/flag.png" alt="" /></div>
        <div className="third-right" ref={thirdRightRef}>
          <h1 className="third-h1">Having a Hard Time Registering Your Business in the U.S.?</h1>
          <p className="third-p">Starting a business in the U.S. can be confusing and stressful. The paperwork, legal steps, and tax rules aren’t easy — and small mistakes can cause big delays. We’re here to make it simple, fast, and stress-free so you can focus on growing your business.</p>
        </div>
      </div>
      <div className="fourth-section" ref={fourthSectionRef}>
        <h1 className="fourth-h1" ref={fourthHeadingRef}>
          How We Help You <span className="span-succeed">Succeed</span>
        </h1>
        <div className="card-wrp">
          {helpCards.map((card, index) => (
            <React.Fragment key={index}>
              <div className="card">
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
        <div className="fifth-left">
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
                <div className="top-card" key={cardIndex}>
                  <img src={card.img} alt="" />
                  <p className="top-card-title">{card.title}</p>
                  <p className="top-card-p">{card.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="sixth-section" ref={servicesSectionRef}>
        <div className="sixth-wrp" ref={servicesContentRef}>
          <h1 className="sixth-h1">Our Services</h1>
          <p className="sixth-p">
            Discover what we do best. Explore our wide range of services designed to
            help you achieve your goals with efficiency and impact.
          </p>
          <img className="sixth-img" src="/assets/banner.png" alt="" />

          <div className="service-wrp" ref={servicesListRef}>
            {servicesList.map((service, index) => (
              <React.Fragment key={index}>
                <div className="services">
                  <h1 className="services-h1">{service.title}</h1>
                  <p className="services-p">{service.text}</p>
                  <button 
                    className="services-btn" 
                    onClick={() => {
                      navigate('/services?service=' + service.link);
                      setTimeout(() => {
                        const element = document.getElementById('service');
                        if (element) {
                          const yOffset = -100;
                          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    <img src="/assets/arrow.png" alt="" />
                  </button>
                </div>
                {index !== servicesList.length - 1 && <div className="hr"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div id="pricing-section" className="seventh-section" ref={pricingSection}>
        <div className="seventh-wrp">
          <h1 className="seventh-h11" ref={pricingTitle}>Simple, One-Time Pricing</h1>
          <p className="seventh-p" ref={pricingSubtitle}>Pay once, enjoy our services without hidden fees or recurring charges.</p>
          <img className="seventh-dots" src="/assets/dots.png" alt="" />
          <div className="seventh-card-wrp">
            {pricingPlans.map((plan, index) => (
              <div className="seventh-card" key={index} ref={addToCardsRef}>
                {plan.popular && <div className="popular-badge">Popular</div>}
                <p className="seventh-badge">{plan.badge}</p>
                <h1 className="seventh-title">
                  {plan.price} <span>One Time</span>
                </h1>
                <button className="seventh-btn" onClick={() => navigate('/register')}>Get Started</button>
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
          <img className="seventh-dots-2" src="/assets/dots.png" alt="" />
        </div>
      </div>
      <div className="eight-section">
        <div className="eight-top">
          <div className="eight-left">
            <h1 className="eight-h1">
              <span className="eight-1-span">Go Global.</span><br />
              <span className="eight-2-span">Go Bigger.</span><br />
              Start with a U.S. <br />business.
            </h1>
            <p className="eight-p">Starting a business in the United States provides access to the world’s largest market, a trusted legal and financial system, and global credibility. <br /><br />As a U.S. business owner, you can enjoy tax advantages, limited liability protection, and the flexibility to scale worldwide. With access to funding, banking, international payment platforms, and top talent, your U.S. business is set up for long-term growth and success.</p>
            <button className="eight-btn" onClick={() => navigate('/register')}>Start Your U.S. Business</button>
          </div>
          <div className="eight-right">
            <img src="/assets/us-map.png" alt="" className="eight-img" />
          </div>
        </div>
        <div className="eight-bottom">
          <h1 className="eight-bottom-h1">Take the first step toward a stress-free <br />business journey.</h1>
          <button className="eigth-btn-bottom" onClick={() => navigate('/register')}>Sign up today!</button>
        </div>
      </div>
      <div className="nineth-section">
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
            <button 
              className="nineth-btn" 
              onClick={() => {
                navigate('/contact');
              }}
            >
              Contact Us
            </button>
          </div>
          <div className="nineth-right">
            <img src="/assets/nineth-im.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}

