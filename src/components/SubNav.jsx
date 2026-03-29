import React from 'react';
import { Link } from 'react-router-dom';
import './SubNav.css';

export default function SubNav() {
  return (
    <nav className="subnav">
      <div className="subnav__left">
        <Link to="/search" className="subnav__item">Shop</Link>
        <Link to="/" className="subnav__item subnav__item--has-arrow">
          Categories <span>›</span>
        </Link>
        <Link to="/search" className="subnav__item">Deals</Link>
        <Link to="/search?category=vegetables" className="subnav__item">Fresh Produce</Link>
        <Link to="/" className="subnav__item">About</Link>
      </div>
      <div className="subnav__right">
        <Link to="/" className="subnav__meta">Policy</Link>
        <Link to="/" className="subnav__meta">FAQ's</Link>
        <Link to="/" className="subnav__meta">
          <span>🔔</span> Help &amp; Support
        </Link>
      </div>
    </nav>
  );
}
