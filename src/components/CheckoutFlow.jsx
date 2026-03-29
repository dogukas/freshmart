import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/services';
import './CheckoutFlow.css';

export default function CheckoutFlow() {
  const { isCheckoutOpen, setCheckoutOpen, cart, products, cartTotal, emptyCart, showToast } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [loading, setLoading] = useState(false);
  
  const [address, setAddress] = useState({
    fullName: user?.email.split('@')[0] || '',
    street: '',
    city: '',
    phone: ''
  });

  const [payment, setPayment] = useState({
    cardNumber: '**** **** **** 4242',
    expiry: '12/26',
    cvv: '***'
  });

  if (!isCheckoutOpen) return null;

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const productDef = products.find(p => p.id === id);
    return { id, qty, price: productDef?.price || 0 };
  }).filter(item => item.price > 0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + delivery;

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else setCheckoutOpen(false);
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 1500));
      
      const success = await createOrder(cartItems, total, showToast, emptyCart, user.id);
      
      if (success) {
        setCheckoutOpen(false);
        setStep(1);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Bir hata oluştu, lütfen tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-overlay" onClick={() => setCheckoutOpen(false)}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <div className="checkout-header">
          <button className="checkout-back" onClick={handleBack}>←</button>
          <h2>{step === 1 ? 'Delivery Address' : 'Payment Method'}</h2>
          <div className="checkout-steps">
            <span className={`step-dot ${step === 1 ? 'active' : ''}`}></span>
            <span className={`step-dot ${step === 2 ? 'active' : ''}`}></span>
          </div>
        </div>

        <div className="checkout-body">
          {step === 1 ? (
            <form id="address-form" onSubmit={handleNext}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={address.fullName} 
                  onChange={e => setAddress({...address, fullName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input 
                  type="text" 
                  required 
                  value={address.street} 
                  onChange={e => setAddress({...address, street: e.target.value})}
                  placeholder="123 Fresh St"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    required 
                    value={address.city} 
                    onChange={e => setAddress({...address, city: e.target.value})}
                    placeholder="New York"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    required 
                    value={address.phone} 
                    onChange={e => setAddress({...address, phone: e.target.value})}
                    placeholder="+1 234 567"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="payment-form">
              <div className="card-preview">
                <div className="card-chip"></div>
                <div className="card-number">{payment.cardNumber}</div>
                <div className="card-info">
                  <span>{address.fullName.toUpperCase()}</span>
                  <span>{payment.expiry}</span>
                </div>
              </div>
              <p className="payment-hint">Secure SSL Encrypted Payment</p>
            </div>
          )}

          <div className="checkout-summary">
            <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
                <span>Delivery</span>
                <span>{delivery === 0 ? 'FREE' : `$${delivery}`}</span>
            </div>
            <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          {step === 1 ? (
            <button type="submit" form="address-form" className="checkout-btn">Continue to Payment</button>
          ) : (
            <button 
              className="checkout-btn" 
              disabled={loading}
              onClick={handleCompleteOrder}
            >
              {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
