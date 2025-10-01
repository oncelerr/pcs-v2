import React from "react";
import './Blogs.css';

export default function Blogs() {
  return (
    <div className="blogs-page">
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
    </div>
  );
}
