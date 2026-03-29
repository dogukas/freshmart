import React from 'react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import './FreshPicksSection.css';

export default function FreshPicksSection() {
  const { products, isLoadingProducts } = useCart();
  
  // Show 10 products for the grid (avoiding overlap with HeroLight's first 4 if possible)
  const displayProducts = products.slice(-10);

  return (
    <section className="fresh-picks-section">
      {/* Section header */}
      <div className="section-header">
        <h2 className="section-title">Today's Fresh Picks</h2>
        <button className="show-all-btn">Show All <span>›</span></button>
      </div>

      {/* Main layout: left 2-col grid + right tall hero card */}
      <div className="fresh-picks__layout">
        {/* Left: 2-column product grid */}
        <div className="fresh-picks__grid">
          {isLoadingProducts ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))
          ) : (
            displayProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>

        {/* Right: Tall hero card —"Fresh Fruits & Vegetables" */}
        <div className="fresh-picks__side-hero">
          <div className="fresh-hero-card">
            <img src="/images/basket_hero.png" alt="Fresh fruits and vegetables" className="fresh-hero-card__image" />
            <div className="fresh-hero-card__overlay">
              <h3 className="fresh-hero-card__heading">
                Fresh Fruits &amp; Vegetables. Delivered Daily.
              </h3>
              <p className="fresh-hero-card__sub">
                We deliver everything you need straight to your door.
              </p>
              <button className="fresh-hero-card__btn">
                Shop Fresh Produce <span>›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
