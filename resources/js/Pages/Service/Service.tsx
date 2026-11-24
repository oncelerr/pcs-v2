import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Service.css";
import { EASE_OUT, gsap, prefersReducedMotion } from "../../lib/motion";

type ServiceCard = {
  id: number;
  title: string;
  description: string;
  image: string;
};

type ServiceTab = {
  id: number;
  title: string;
  description: string;
  cards: ServiceCard[];
};

export default function Service() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<number>(0);
  const pageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasRenderedPanel = useRef(false);
  
  // Convert tab title to URL-friendly format (lowercase with hyphens, handling special chars)
  const titleToSlug = (title: string) => 
    title
      .toLowerCase()
      .replace(/&/g, 'and')  // Replace '&' with 'and'
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens

  // Update URL when tab changes
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    const tabSlug = titleToSlug(serviceTabs[index].title);
    // replace: switching tabs should not add a Back-button step per click
    setSearchParams({ service: tabSlug }, { replace: true });
  };

  // Set active tab based on URL on component mount and when searchParams change
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    
    if (serviceParam) {
      const tabIndex = serviceTabs.findIndex(tab => {
        const slug = titleToSlug(tab.title);
        return slug === serviceParam.toLowerCase();
      });
      
      if (tabIndex !== -1) {
        setActiveTab(tabIndex);
      } else {
        // If no matching tab found, default to first tab
        setActiveTab(0);
      }
    }
  }, [searchParams]);

  const serviceTabs: ServiceTab[] = [
    {
      id: 1,
      title: "Business Formation",
      description: "Start your company the right way.",
      cards: [
        {
          id: 1,
          title: "Business Registration",
          description: "We help you register your business in the U.S. quickly and correctly, ensuring all documents meet state and federal requirements. Whether you need an LLC, Corporation, or Partnership, we guide you through the entire setup process.",
          image: "/assets/business-registration.png"
        },
        {
          id: 2,
          title: "EIN Registration",
          description: "Obtain your Employer Identification Number (EIN) from the IRS. This unique number is essential for tax purposes, opening business bank accounts, and hiring employees.",
          image: "/assets/ein-registration.png"
        }
      ]
    },
    {
      id: 2,
      title: "Compliance & Legal",
      description: "Stay compliant and legally protected.",
      cards: [
        {
          id: 1,
          title: "Annual Report Filing",
          description: "We handle your annual report filings to keep your business in good standing with the state. Never miss a deadline or face penalties.",
          image: "/assets/annual-report-filing.png"
        },
        {
          id: 2,
          title: "Registered Agent Service",
          description: "Our registered agent service ensures you never miss important legal documents, compliance notices, or service of process.",
          image: "/assets/registered-agent-service.png"
        },
        {
          id: 3,
          title: "Business License Research",
          description: "We identify all necessary local, state, and federal licenses and permits required for your specific business type and location.",
          image: "/assets/business-license-research.png"
        }
      ]
    },
    {
      id: 3,
      title: "Brand & Representation",
      description: "Protect and manage your brand.",
      cards: [
        {
          id: 1,
          title: "Trademark Registration",
          description: "Protect your brand with our comprehensive trademark registration service, including comprehensive search and application filing.",
          image: "/assets/trademark-registration.png"
        },
        {
          id: 2,
          title: "DBA Registration",
          description: "Register your 'Doing Business As' name to operate under a trade name different from your legal business name.",
          image: "/assets/dba-registration.png"
        },
        {
          id: 3,
          title: "Copyright Protection",
          description: "Secure your original works of authorship including website content, marketing materials, and software.",
          image: "/assets/copyright-protection.png"
        },
        {
          id: 4,
          title: "Brand Strategy Consultation",
          description: "Get expert advice on building and protecting your brand identity in the market.",
          image: "/assets/brand-strategy-consultation.png"
        }
      ]
    },
    {
      id: 4,
      title: "Virtual Office Solutions",
      description: "Run your business anywhere, anytime.",
      cards: [
        {
          id: 1,
          title: "Business Address",
          description: "Get a professional business address for mail handling and to establish your business presence.",
          image: "/assets/business-address.png"
        },
        {
          id: 2,
          title: "Mail Forwarding",
          description: "Have your business mail forwarded to any location worldwide or scanned and sent digitally.",
          image: "/assets/mail-forwarding.png"
        },
        {
          id: 3,
          title: "Meeting Room Access",
          description: "Access to professional meeting rooms and office spaces when you need to meet clients or work outside your home.",
          image: "/assets/meeting-room-access.png"
        },
        {
          id: 4,
          title: "Phone Answering Service",
          description: "Professional call answering and message taking to ensure you never miss important business calls.",
          image: "/assets/phone-answering-service.png"
        },
        {
          id: 5,
          title: "Virtual Receptionist",
          description: "A professional receptionist to handle your calls with custom greetings and message taking.",
          image: "/assets/virtual-receptionist.png"
        }
      ]
    }
  ];

  // Function to truncate text and add ellipsis if it exceeds max length
  const truncateText = (text: string, maxLength: number = 245) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Arrow keys move between tabs, as screen-reader users expect
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = serviceTabs.length - 1;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    if (next === -1) return;
    e.preventDefault();
    handleTabChange(next);
    tabRefs.current[next]?.focus();
  };

  // Keep the active tab visible in the horizontally scrolling tab bar (mobile)
  useEffect(() => {
    const tab = tabRefs.current[activeTab];
    const bar = tab?.parentElement;
    if (!tab || !bar || bar.scrollWidth <= bar.clientWidth) return;
    const left = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    bar.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [activeTab]);

  // Short cross-fade of the cards when the category changes
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (!hasRenderedPanel.current) {
      hasRenderedPanel.current = true;
      return;
    }
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: EASE_OUT } })
        .from('.serv-page-title, .serv-page-desc', { y: 8, autoAlpha: 0, duration: 0.3, stagger: 0.04 })
        .from('.serv-each-card', { y: 14, autoAlpha: 0, duration: 0.38, stagger: 0.05, clearProps: 'transform' }, '-=0.18');
    }, panel);

    return () => ctx.revert();
  }, [activeTab]);

  const currentTab = serviceTabs[activeTab];

  return (
    <div className="services-page" ref={pageRef}>
      <div className="serv-cont">
        <div className="serv-cont-left">
          <h1 className="serv-title">Our Services</h1>
          <p className="serv-desc">Get in touch today to discover how our compliance experts can simplify your business journey. Whether you're starting up, filing taxes, or staying legally compliant, our team is here to provide personalized support and reliable solutions — every step of the way.</p>
          <Link className="serv-btn" to="/contact">Book Now</Link>
        </div>
        <div className="serv-cont-right">
          <img src="/assets/services-hero-img.png" alt="Our Services" />
        </div>
      </div>
      <div className="serv-card-wrp" id="service">
        <div className="serv-card-tab" role="tablist" aria-label="Service categories" aria-orientation="vertical">
          {serviceTabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              type="button"
              role="tab"
              id={`service-tab-${tab.id}`}
              aria-selected={activeTab === index}
              aria-controls="service-panel"
              tabIndex={activeTab === index ? 0 : -1}
              className={`serv-card-btn ${activeTab === index ? 'active' : ''}`}
              onClick={() => handleTabChange(index)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <div
          className="serv-card"
          id="service-panel"
          role="tabpanel"
          aria-labelledby={`service-tab-${currentTab.id}`}
          ref={panelRef}
        >
          <h2 className="serv-page-title">{currentTab.title}</h2>
          <p className="serv-page-desc">{currentTab.description}</p>
          <div className="serv-card-grid">
            {currentTab.cards.map((card) => (
              <div key={`${currentTab.id}-${card.id}`} className="serv-each-card">
                <img
                  src={card.image}
                  alt={card.title}
                  className="serv-each-card-img"
                  loading="lazy"
                />
                <h3 className="serv-each-card-title">{card.title}</h3>
                <p className="serv-each-card-desc">
                  {truncateText(card.description)}
                </p>
                <Link to="/register" className="serv-each-card-btn" aria-label={`Book Now: ${card.title}`}>Book Now</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
