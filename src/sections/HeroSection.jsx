import React from 'react';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-section__bg">
        {/* BIG overflowing FreshMart title */}
        <div className="hero-section__title-container">
          <h1 className="hero-section__title">FreshMart</h1>
        </div>

        {/* Same-Day Delivery badge */}
        <div className="hero-section__badge">Same-Day Delivery</div>

        {/* Sparkle decorations */}
        <div className="sparkle sparkle--1">✦</div>
        <div className="sparkle sparkle--2">✦</div>
        <div className="sparkle sparkle--3">✦</div>
        <div className="sparkle sparkle--4">✦</div>

        {/* Bottom left text + CTA */}
        <div className="hero-section__bottom">
          <p className="hero-section__subtitle">
            Shop from thousands of farm-fresh fruits, vegetables, dairy, and daily essentials at unbeatable prices.
          </p>
          <button className="hero-section__cta">
            Shop Now <span className="cta-arrow">›</span>
          </button>
        </div>

        {/* Delivery person center */}
        <img src="/images/delivery.png" alt="Delivery" className="hero-section__delivery" />

        {/* Floating product card bottom-right */}
        <div className="hero-section__float-card">
          <img src="/images/basket_hero.png" alt="Fresh Vegetables" className="float-card-img" />
          <div className="float-card-info">
            <span className="float-card-title">Fresh Vegetables</span>
            <div className="float-card-prices">
              <span className="float-card-price">$18.00</span>
              <span className="float-card-old">$24.00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
