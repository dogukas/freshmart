import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, removeFromCart, getQty, toggleWishlist, isWishlisted } = useCart();
  const qty = getQty(product.id);
  const wishlisted = isWishlisted(product.id);

  // Generate random 4-5 rating for visual flair
  const rating = (4 + Math.random()).toFixed(1);
  const isDiscount = Math.random() > 0.7;

  return (
    <div className="product-card">
      {/* Badges & Actions */}
      <div className="product-card__badges">
        {isDiscount && <span className="badge badge--discount">-15%</span>}
        <button 
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id, product.name);
          }}
        >
          {wishlisted ? '♥' : '♡'}
        </button>
      </div>

      <Link to={`/product/${product.id}`} className="product-card__image-link">
        <div className="product-card__image-container">
          <img src={product.image} alt={product.name} className="product-card__image" />
        </div>
      </Link>
      
      <div className="product-card__content">
        <div className="product-card__source">{product.source}</div>
        <Link to={`/product/${product.id}`} className="product-card__name-link">
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        
        {/* Rating */}
        <div className="product-card__rating">
          <span className="rating-star">★</span>
          <span className="rating-score">{rating}</span>
          <span className="rating-count">({Math.floor(Math.random() * 200) + 20})</span>
        </div>

        <div className="product-card__bottom">
          <div className="product-card__price-wrap">
            <span className="product-card__price">${product.price}</span>
            <span className="product-card__unit">{product.unit}</span>
          </div>

          {qty > 0 ? (
            <div className="product-card__stepper">
              <button className="stepper-btn" onClick={(e) => { e.preventDefault(); removeFromCart(product.id); }}>−</button>
              <span className="stepper-val">{qty}</span>
              <button className="stepper-btn stepper-btn--plus" onClick={(e) => { e.preventDefault(); addToCart(product.id); }}>+</button>
            </div>
          ) : (
            <button className="product-card__add-btn" onClick={(e) => { e.preventDefault(); addToCart(product.id, product.name); }}>
              + Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
