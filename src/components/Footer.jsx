import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-brand">
        <Link to="/" className="footer-logo">FreshMart</Link>
        <p className="footer-desc">Skip the long lines and heavy bags we'll handle the delivery for you.</p>
      </div>
      <div className="footer-nav-group">
        <div className="footer-nav-col">
          <span className="footer-nav-title">Main Pages</span>
          <Link to="/">Home</Link>
          <Link to="/">About Us</Link>
        </div>
        <div className="footer-nav-col">
          <span className="footer-nav-title">Help</span>
          <Link to="/">Help Center</Link>
          <Link to="/">Return Policy</Link>
        </div>
        <div className="footer-nav-col">
          <span className="footer-nav-title">Company</span>
          <Link to="/">Jobs</Link>
          <Link to="/">Partnerships</Link>
        </div>
        <div className="footer-nav-col">
          <span className="footer-nav-title">Contact Information</span>
          <p className="footer-contact-text">📍 Aurora, colorado<br />america serikat,US</p>
        </div>
      </div>
    </footer>
  );
}
