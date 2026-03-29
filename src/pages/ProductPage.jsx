import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductPage.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoadingProducts, addToCart, toggleWishlist, isWishlisted, getQty } = useCart();
  
  const product = products.find(p => p.id === id);
  const quantity = getQty(id);

  if (isLoadingProducts) {
    return <div className="product-page__loading">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="product-page__error">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-page__container">
        <button className="product-page__back" onClick={() => navigate(-1)}>
          ← Back to Results
        </button>
        
        <div className="product-page__main">
          <div className="product-page__image-section">
            <div className="product-page__image-container">
              <img src={product.image} alt={product.name} className="product-page__image" />
              {product.discount && <span className="product-page__badge">-{product.discount}%</span>}
            </div>
          </div>

          <div className="product-page__info-section">
            <div className="product-page__header">
              <span className="product-page__source">Farm Fresh • Local Organic</span>
              <h1 className="product-page__name">{product.name}</h1>
              <div className="product-page__rating">
                <span className="rating-stars">★★★★★</span>
                <span className="rating-text">(4.8 / 124 reviews)</span>
              </div>
            </div>

            <div className="product-page__price-wrap">
              <span className="product-page__price">${product.price.toFixed(2)}</span>
              <span className="product-page__unit">per {product.unit}</span>
            </div>

            <p className="product-page__description">
              Our {product.name} is sourced directly from local organic farms. 
              Grown with care and harvested at the peak of freshness to ensure the highest quality 
              and best taste for your kitchen. No artificial pesticides or fertilizers are used.
            </p>

            <div className="product-page__actions">
              <div className="product-page__qty-controls">
                <button className="qty-btn" onClick={() => addToCart(product.id, product.name)}>+</button>
                <span className="qty-num">{quantity || 0}</span>
                {/* Simplified for now, can add decrement if needed */}
              </div>
              
              <button 
                className="product-page__add-btn"
                onClick={() => addToCart(product.id, product.name)}
              >
                Add to Cart
              </button>

              <button 
                className={`product-page__wish-btn ${isWishlisted(product.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id, product.name)}
              >
                {isWishlisted(product.id) ? '♥' : '♡'}
              </button>
            </div>

            <div className="product-page__features">
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <div>
                  <strong>Free Delivery</strong>
                  <p>Order over $50</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <div>
                  <strong>Safe Payment</strong>
                  <p>100% Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
