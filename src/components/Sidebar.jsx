import React from 'react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">FreshMart</div>
      <div className="sidebar__search">
        <span className="sidebar__search-icon">🔍</span>
        <span className="sidebar__search-placeholder">Search Grocery Items...</span>
      </div>
      <nav className="sidebar__nav">
        <a href="#" className="sidebar__nav-item">Shop</a>
        <a href="#" className="sidebar__nav-item">
          Categories <span className="sidebar__nav-arrow">›</span>
        </a>
        <a href="#" className="sidebar__nav-item">Deals</a>
        <a href="#" className="sidebar__nav-item">Fresh Produce</a>
        <a href="#" className="sidebar__nav-item">About</a>
      </nav>
      <div className="sidebar__lang">🇺🇸 EN</div>
      <div className="sidebar__actions">
        <div className="sidebar__action">
          <span>🛒</span>
          <span className="sidebar__action-label">CART</span>
        </div>
        <div className="sidebar__action">
          <span>♡</span>
          <span className="sidebar__action-label">LOVED</span>
        </div>
        <div className="sidebar__action">
          <span>👤</span>
          <span className="sidebar__action-label">Login/Signup</span>
        </div>
      </div>
      <div className="sidebar__right-actions">
        <div className="sidebar__right-item">Help & Support</div>
        <div className="sidebar__right-item">FAQ's</div>
        <div className="sidebar__right-item">Policy</div>
      </div>
    </aside>
  );
}
