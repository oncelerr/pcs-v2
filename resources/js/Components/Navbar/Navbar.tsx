import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { gsap, prefersReducedMotion } from "../../lib/motion";

type NavItem = { label: string; to: string; isActive: (pathname: string) => boolean };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/", isActive: (p) => p === "/" },
  { label: "About", to: "/about", isActive: (p) => p.startsWith("/about") },
  { label: "Services", to: "/services", isActive: (p) => p.startsWith("/services") },
  { label: "Blog", to: "/blogs", isActive: (p) => p.startsWith("/blogs") || p.startsWith("/article") },
  { label: "Contact", to: "/contact", isActive: (p) => p.startsWith("/contact") },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Compact, solid bar once the page scrolls
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close the mobile menu with Escape or a tap outside the navbar
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  // Close the mobile menu if the viewport grows past the mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 961px)");
    const onChange = () => {
      if (!mq.matches) return;
      setMenuOpen(false);
      // Drop the inline height/visibility the mobile animation left behind
      if (panelRef.current) gsap.set(panelRef.current, { clearProps: "height,opacity,visibility" });
      gsap.set(panelRef.current?.querySelectorAll(".nav-link") ?? [], { clearProps: "transform,opacity" });
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Desktop: slide the underline to the active link
  const moveIndicator = useCallback((animate: boolean) => {
    const container = linksRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const active = container.querySelector<HTMLElement>(".nav-link.active");
    if (!active || getComputedStyle(indicator).display === "none") {
      gsap.set(indicator, { autoAlpha: 0 });
      return;
    }

    const props = { x: active.offsetLeft, width: active.offsetWidth, autoAlpha: 1 };
    if (!animate || prefersReducedMotion()) {
      gsap.set(indicator, props);
    } else {
      gsap.to(indicator, { ...props, duration: 0.4, ease: "power3.out", overwrite: true });
    }
  }, []);

  const firstIndicatorRun = useRef(true);
  useLayoutEffect(() => {
    moveIndicator(!firstIndicatorRun.current);
    firstIndicatorRun.current = false;
  }, [pathname, moveIndicator]);

  useEffect(() => {
    const onResize = () => moveIndicator(false);
    window.addEventListener("resize", onResize);
    // Web fonts change link widths after first paint
    document.fonts?.ready.then(() => moveIndicator(false));
    return () => window.removeEventListener("resize", onResize);
  }, [moveIndicator]);

  // Mobile: open and close the menu panel
  const firstMenuRun = useRef(true);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const isMobile = window.matchMedia("(max-width: 960px)").matches;
    if (!isMobile) {
      gsap.set(panel, { clearProps: "height,opacity,visibility" });
      firstMenuRun.current = false;
      return;
    }

    const items = panel.querySelectorAll<HTMLElement>(".nav-link, .nav-actions-mobile > *");
    const instant = firstMenuRun.current || prefersReducedMotion();
    firstMenuRun.current = false;

    if (menuOpen) {
      if (instant) {
        gsap.set(panel, { height: "auto", autoAlpha: 1 });
        gsap.set(items, { clearProps: "transform,opacity" });
        return;
      }
      gsap.timeline()
        .fromTo(panel, { height: 0, autoAlpha: 0 }, { height: "auto", autoAlpha: 1, duration: 0.32, ease: "power2.out" })
        .fromTo(items, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, stagger: 0.035, ease: "power2.out", clearProps: "transform,opacity" }, "-=0.2");
    } else if (instant) {
      gsap.set(panel, { height: 0, autoAlpha: 0 });
    } else {
      gsap.to(panel, { height: 0, autoAlpha: 0, duration: 0.22, ease: "power2.in" });
    }
  }, [menuOpen]);

  const renderAccountActions = (variant: "desktop" | "mobile") => (
    <div className={variant === "desktop" ? "nav-actions" : "nav-actions-mobile"}>
      {user ? (
        <>
          <Link to="/dashboard" className="nav-btn nav-btn-ghost" onClick={closeMenu}>Dashboard</Link>
          <button type="button" onClick={handleLogout} className="nav-btn nav-btn-solid">Logout</button>
        </>
      ) : (
        <Link to="/login" className="nav-btn nav-btn-solid" onClick={closeMenu}>Login</Link>
      )}
    </div>
  );

  return (
    <header
      ref={navRef}
      className={`navbar-cont ${scrolled ? "scrolled" : ""} ${menuOpen ? "menu-open" : ""}`}
    >
      <nav className="navbar-wrp" aria-label="Main">
        <Link to="/" className="nav-logo" aria-label="Premium Corporate Solutions home">
          <img src="/assets/Logo.png" alt="Logo" width={330} height={41} />
        </Link>

        <div className="nav-panel" id="primary-navigation" ref={panelRef}>
          <div className="nav-links" ref={linksRef}>
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
          </div>
          {renderAccountActions("mobile")}
        </div>

        {renderAccountActions("desktop")}

        <button
          ref={toggleRef}
          type="button"
          className={`nav-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
}
