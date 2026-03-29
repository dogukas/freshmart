import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import './PromoSection.css';

const PROMO_CARDS = [
  {
    id: 1,
    title: "New Here? Enjoy 10% Off Your First Order",
    subtitle: 'Sign up today and get instant savings on your first grocery purchase.',
    bg: 'linear-gradient(135deg, #1a4a2e 0%, #2d8c5f 100%)',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.7)',
    emoji: '🍗',
  },
  {
    id: 2,
    title: 'Free Delivery On Orders Over $50',
    subtitle: 'Stock up on your weekly groceries and save more with zero delivery charges.',
    bg: 'linear-gradient(135deg, #e8455a 0%, #ff7b8a 100%)',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.8)',
    emoji: '🛒',
  },
  {
    id: 3,
    title: 'Fresh Groceries For Your Family, Without Hassle.',
    subtitle: 'We deliver everything you need straight to your door.',
    bg: 'linear-gradient(135deg, #f5e642 0%, #ffd700 100%)',
    titleColor: '#1a1a1a',
    subtitleColor: '#4a4a4a',
    emoji: '👩‍🍳',
  },
];

const TABS = ['Fresh Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery', 'Meat & Fish', 'Beverages'];

const WEEKLY_PRODUCTS = [
  { id: 'grapes', name: 'Seedless Green Grapes', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/pineapple.png' },
  { id: 'strawberry3', name: 'Organic Strawberries', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/strawberries.png' },
  { id: 'kiwi', name: 'Imported Kiwi', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/mangoes.png' },
  { id: 'pomo', name: 'Sweet Pomegranates', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/tomatoes.png' },
  { id: 'papaya3', name: 'Ripe Papaya', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/papaya.png' },
];

const MOST_SELLING = [
  { id: 'ms1', name: 'Imported Kiwi', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/mangoes.png' },
  { id: 'ms2', name: 'Sweet Pomegranates', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/tomatoes.png' },
  { id: 'ms3', name: 'Seedless Green Grapes', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/pineapple.png' },
  { id: 'ms4', name: 'Fresh Mangoes', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/mangoes.png' },
  { id: 'ms5', name: 'Fresh Chicken Breast', source: 'Local Farmers', price: '1.33', unit: 'per kg', image: '/images/chicken.png' },
];

export default function PromoSection() {
  const [activeTab, setActiveTab] = useState('Fruits');

  return (
    <section className="promo-section">
      {/* Promo cards row */}
      <div className="promo-cards-row">
        {PROMO_CARDS.map(card => (
          <div key={card.id} className="promo-card" style={{ background: card.bg }}>
            <div className="promo-card__text">
              <h3 className="promo-card__title" style={{ color: card.titleColor }}>{card.title}</h3>
              <p className="promo-card__sub" style={{ color: card.subtitleColor }}>{card.subtitle}</p>
            </div>
            <div className="promo-card__bottom">
              <span className="promo-card__emoji">{card.emoji}</span>
              <button className="promo-card__arrow">›</button>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly best selling */}
      <div className="weekly-section">
        <div className="section-header">
          <h2 className="section-title">Weekly Best Selling items</h2>
          <button className="show-all-btn">Show All <span>›</span></button>
        </div>
        <div className="tab-filter">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="weekly__products-row">
          {WEEKLY_PRODUCTS.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Most selling */}
      <div className="most-selling-section">
        <div className="section-header">
          <h2 className="section-title">Most Selling Products</h2>
          <button className="show-all-btn">Show All <span>›</span></button>
        </div>
        <div className="most-selling__row">
          {MOST_SELLING.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
