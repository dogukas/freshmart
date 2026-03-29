import React from 'react';
import { Link } from 'react-router-dom';
import './PopularCategories.css';

const CATEGORIES = [
  { id: 1, name: 'Fresh Vegetables', key: 'vegetables', count: '23 Product', bg: '#eef6ff', image: '/images/basket_hero.png' },
  { id: 2, name: 'Fruits', key: 'fruits', count: '18 Product', bg: '#f0fff4', image: '/images/strawberries.png' },
  { id: 3, name: 'Dairy & Eggs', key: 'dairy', count: '08 Product', bg: '#f5f0ff', image: '/images/milk.png' },
  { id: 4, name: 'Bakery', key: 'bakery', count: '12 Product', bg: '#fff5f5', image: '/images/cat_bakery.png' },
  { id: 5, name: 'Meat & Fish', key: 'meat', count: '09 Product', bg: '#f0fff8', image: '/images/cat_meat.png' },
  { id: 6, name: 'Beverages', key: 'beverages', count: '13 Product', bg: '#fffbf0', image: '/images/cat_beverages.png' },
];

export default function PopularCategories() {
  return (
    <section className="popular-categories">
      <div className="section-header">
        <h2 className="section-title">Popular Categories</h2>
        <button className="show-all-btn">Show All <span>›</span></button>
      </div>
      <div className="popular-categories__grid">
        {CATEGORIES.map(cat => (
          <Link to={`/search?category=${cat.key}`} key={cat.id} className="category-card" style={{ background: cat.bg }}>
            <div className="category-card__image-wrap">
              <img src={cat.image} alt={cat.name} className="category-card__image" />
            </div>
            <div className="category-card__info">
              <span className="category-card__name">{cat.name}</span>
              <span className="category-card__count">{cat.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
