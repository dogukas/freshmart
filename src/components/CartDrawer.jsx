import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/services';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, addToCart, removeFromCart, clearFromCart, cartTotal, emptyCart, showToast, products, setCheckoutOpen } = useCart();
  const { user, setAuthModalOpen } = useAuth();

  // Map cart items against dynamically loaded Supabase products
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const productDef = products.find(p => p.id === id);
    return {
      id,
      qty,
      ...(productDef || { name: 'Loading...', price: 0, unit: '', image: '' }),
    };
  }).filter(item => item.price > 0); // Hide unresolved items briefly while products load

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Auth Check
    if (!user) {
      setCartOpen(false);
      setAuthModalOpen(true);
      showToast('Siparişi tamamlamak için lütfen giriş yapın veya üye olun.', 'info');
      return;
    }

    // Open enhanced checkout flow
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`cart-drawer ${cartOpen ? 'cart-drawer--open' : ''}`}>
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            My Cart
            {cartTotal > 0 && (
              <span className="cart-drawer__count">{cartTotal} items</span>
            )}
          </h2>
          <button className="cart-drawer__close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {cartTotal === 0 ? (
          <div className="cart-drawer__empty">
            <div className="cart-empty-icon">🛒</div>
            <p>Your cart is empty</p>
            <p className="cart-empty-sub">Looks like you haven't added anything yet.</p>
            <button className="cart-shop-btn" onClick={() => setCartOpen(false)}>Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item__img" />
                  <div className="cart-item__info">
                    <span className="cart-item__name">{item.name}</span>
                    <span className="cart-item__price">${(item.price * item.qty).toFixed(2)}</span>
                    <span className="cart-item__unit">${item.price} {item.unit}</span>
                  </div>
                  <div className="cart-item__controls">
                    <button className="cart-item__btn" onClick={() => removeFromCart(item.id)}>−</button>
                    <span className="cart-item__qty">{item.qty}</span>
                    <button className="cart-item__btn" onClick={() => addToCart(item.id)}>+</button>
                  </div>
                  <button className="cart-item__remove" onClick={() => clearFromCart(item.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cart-drawer__summary">
              {subtotal < 50 && (
                <div className="cart-free-delivery-bar">
                  <span>🚚 Add ${(50 - subtotal).toFixed(2)} more for free delivery!</span>
                  <div className="cart-progress">
                    <div className="cart-progress__fill" style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
              {subtotal >= 50 && (
                <div className="cart-free-delivery-ok">🎉 Free Delivery Unlocked!</div>
              )}
              <div className="cart-summary-line">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-line">
                <span>Delivery</span>
                <span>{delivery === 0 ? <span className="free-label">Free</span> : `$${delivery.toFixed(2)}`}</span>
              </div>
              <div className="cart-summary-line cart-summary-line--total">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <button 
                className="cart-checkout-btn" 
                onClick={handleCheckout} 
                disabled={total === 0}
              >
                Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
