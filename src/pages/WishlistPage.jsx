import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './WishlistPage.css';

export default function WishlistPage() {
  const { wishlist, products, isLoadingProducts } = useCart();
  const navigate = useNavigate();

  // Filter products that are in the wishlist
  const wishlistedProducts = products.filter(p => !!wishlist[p.id]);

  if (isLoadingProducts) {
    return <div className="wishlist-page__loading">Loading your wishlist...</div>;
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-page__container">
        <div className="wishlist-page__header">
          <button className="wishlist-page__back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2 className="section-title">My Wishlist ♡</h2>
          <p className="wishlist-page__count">{wishlistedProducts.length} items saved</p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="wishlist-page__empty">
            <div className="empty-wishlist-icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you like for later by clicking the heart icon.</p>
            <button className="empty-wishlist-btn" onClick={() => navigate('/')}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wishlist-page__grid">
            {wishlistedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
