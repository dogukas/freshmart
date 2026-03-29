import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { cartTotal, wishlistTotal, setCartOpen } = useCart();
  const { user, setAuthModalOpen, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleAuthClick = () => {
    if (user) {
      setDropdownOpen(!dropdownOpen);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    navigate('/');
  };

  const displayName = user ? user.email.split('@')[0] : 'Login/Signup';

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <header className={`navbar ${menuOpen ? 'navbar--menu-open' : ''}`}>
      <div className="navbar__mobile-header">
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>FreshMart</Link>
        <button className="navbar__burger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`navbar__left ${menuOpen ? 'active' : ''}`}>
        <span className="navbar__lang">🇺🇸 EN</span>
        <div className="navbar__search">
          <span className="navbar__search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search Grocery Items..." 
            className="navbar__search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <Link to="/" className="navbar__logo navbar__logo--desktop">FreshMart</Link>

      <div className={`navbar__right ${menuOpen ? 'active' : ''}`}>
        <Link to="/wishlist" className="navbar__icon-btn" onClick={() => setMenuOpen(false)}>
          <span>♡</span>
          <span className="navbar__icon-label">LOVED</span>
          {wishlistTotal > 0 && <span className="navbar__cart-badge navbar__badge--love">{wishlistTotal}</span>}
        </Link>
        <button 
          className="navbar__icon-btn navbar__icon-btn--cart"
          onClick={() => { setCartOpen(true); setMenuOpen(false); }}
        >
          <span>🛒</span>
          <span className="navbar__icon-label">CART</span>
          {cartTotal > 0 && <span className="navbar__cart-badge">{cartTotal}</span>}
        </button>
        
        <div className="navbar__user-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <button className="navbar__icon-btn" onClick={handleAuthClick}>
            <span>{user ? '👋' : '👤'}</span>
            <span className="navbar__icon-label" style={{ maxWidth: '80px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
          </button>
          
          {dropdownOpen && user && (
            <div className="navbar__dropdown">
              <Link to="/profile" className="navbar__dropdown-item" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}>
                Profilim / Siparişler
              </Link>
              <button className="navbar__dropdown-item logout-item" onClick={handleSignOut}>
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
