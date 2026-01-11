import React from "react";
import './Blogs.css';

export default function Blogs() {
    return (
        <div className="blogs-page">
            {/* Header Section */}
            <header className="header">
                <div className="header-content">
                    <img className="logo" src="https://placehold.co/329x40" alt="Logo" />
                    <nav className="nav-menu">
                        <ul className="nav-links">
                            <li><a href="#" className="nav-link">Home</a></li>
                            <li><a href="#" className="nav-link">About</a></li>
                            <li><a href="#" className="nav-link">Services</a></li>
                            <li><a href="#" className="nav-link">Contact</a></li>
                        </ul>
                        <button className="login-button">Log in</button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Blog Page</h1>
                    <p className="hero-subtitle">
                        Premium Corp Solutions ("Company," "we," "our," or "us") respects your privacy. 
                        This Privacy Policy explains how we collect, use, and protect.
                    </p>
                </div>
            </section>

            {/* Featured Blog Post */}
            <section className="featured-blog">
                <div className="container">
                    <div className="featured-content">
                        <div className="featured-image"></div>
                        <div className="featured-details">
                            <div className="badges">
                                <span className="badge">3PL Growth</span>
                                <span className="badge">3PL Tips</span>
                                <span className="badge">3+</span>
                            </div>
                            <h2>Work With Experts In Fulfillment Solutions</h2>
                            <div className="date">Jan 25, 2025</div>
                            <p className="blog-excerpt">
                                Every business is unique, and so is every 3PL. Our goal is to help you find the ideal warehouse 
                                and fulfillment center in China, with global warehouse capabilities, while providing answers to 
                                all your questions and ensuring a seamless transition to your perfect 3PL partner.
                            </p>
                            <a href="#" className="read-more">Read Article →</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="blog-grid">
                <div className="container">
                    <div className="grid">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <article key={item} className="blog-card">
                                <img src="https://placehold.co/416x240" alt="Blog thumbnail" className="blog-image" />
                                <div className="card-content">
                                    <div className="card-badges">
                                        <span className="badge">3PL Growth</span>
                                        <span className="badge">3PL Tips</span>
                                        <span className="badge">3+</span>
                                    </div>
                                    <div className="card-date">Jan 25, 2025</div>
                                    <h3 className="card-title">The 2024 Best Apparel 3PL Warehouses</h3>
                                    <p className="card-excerpt">
                                        Explore the top apparel 3PL warehouses of 2024, known for their efficient fulfillment, 
                                        fashion logistics expertise, and scalable solutions.
                                    </p>
                                    <a href="#" className="read-more">Read Article →</a>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button className="pagination-button">‹</button>
                        <button className="pagination-number active">1</button>
                        <button className="pagination-number">2</button>
                        <button className="pagination-number">3</button>
                        <button className="pagination-number">4</button>
                        <button className="pagination-number">5</button>
                        <button className="pagination-button">›</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <img src="https://placehold.co/329x40" alt="Logo" />
                            <p className="footer-description">
                                Premium Corporate Solutions is not a law firm and does not provide legal advice. 
                                Please refer to our Terms & Conditions and Privacy & Data Protection for more information.
                            </p>
                            <div className="contact-info">
                                <a href="mailto:email@example.com" className="contact-link">email@example.com</a>
                                <a href="tel:5555555555" className="contact-link">(555) 555-5555</a>
                                <address>100 Smith Street Collingwood VIC 3066 AU</address>
                            </div>
                            <button className="contact-button">Get In Touch</button>
                        </div>

                        <div className="footer-links">
                            <div className="footer-section">
                                <h4>Catalog</h4>
                                <ul>
                                    <li><a href="#">Home</a></li>
                                    <li><a href="#">About</a></li>
                                    <li><a href="#">Services</a></li>
                                    <li><a href="#">Pricing</a></li>
                                    <li><a href="#">Contact</a></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Services</h4>
                                <ul>
                                    <li><a href="#">Business Formation</a></li>
                                    <li><a href="#">Compliance & Legal</a></li>
                                    <li><a href="#">Brand & Representation</a></li>
                                    <li><a href="#">Virtual Office Solutions</a></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Resources</h4>
                                <ul>
                                    <li><a href="#">Terms & Conditions</a></li>
                                    <li><a href="#">Privacy Policy</a></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Accepted Payments</h4>
                                <ul>
                                    <li><a href="#">Paypal</a></li>
                                    <li><a href="#">MasterCard</a></li>
                                    <li><a href="#">Visa</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>All rights reserved @ Premium Corp Solutions 2025 | Made by Vibe Hive Digital Services</p>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook">f</a>
                            <a href="#" aria-label="Twitter">t</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
