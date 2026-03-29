import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchUserOrders } from '../api/services';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { products } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      async function loadOrders() {
        setIsLoadingOrders(true);
        const data = await fetchUserOrders(user.id);
        setOrders(data);
        setIsLoadingOrders(false);
      }
      loadOrders();
    }
  }, [user]);

  const toggleOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (loading || !user) {
    return <div className="profile-loading">Yükleniyor...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <div className="profile-avatar">
          <div className="avatar-circle">{user.email[0].toUpperCase()}</div>
          <div className="avatar-info">
            <h3>{user.email.split('@')[0]}</h3>
            <p>{user.email}</p>
          </div>
        </div>
        <nav className="profile-nav">
          <button className="profile-nav-btn active">📦 Siparişlerim</button>
          <button className="profile-nav-btn">⚙️ Hesap Ayarları</button>
          <button className="profile-nav-btn" onClick={() => navigate('/')}>🏠 Alışverişe Dön</button>
        </nav>
      </div>

      <div className="profile-content">
        <h2 className="profile-title">Geçmiş Siparişlerim</h2>
        
        {isLoadingOrders ? (
          <div className="profile-orders-skeleton">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-line" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="profile-empty">
            <div className="empty-icon">🛒</div>
            <p>Henüz hiç sipariş vermemişsiniz.</p>
            <button className="empty-btn" onClick={() => navigate('/')}>Alışverişe Başla</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div 
                key={order.id} 
                className={`order-card ${expandedOrderId === order.id ? 'order-card--expanded' : ''}`}
                onClick={() => toggleOrder(order.id)}
              >
                <div className="order-header">
                  <div className="order-meta">
                    <span className="order-id">Sipariş #{order.id}</span>
                    <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={`order-status status-${order.status}`}>
                    {order.status === 'completed' ? 'Tamamlandı' : order.status}
                  </div>
                </div>
                
                <div className="order-body">
                  <div className="order-items-summary">
                    {(order.order_items || []).length} Ürün Kalemi (Tıkla ve İncele)
                  </div>
                  <div className="order-total">${order.total_amount.toFixed(2)}</div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="order-details">
                    <div className="order-details-header">Sipariş İçeriği:</div>
                    {(order.order_items || []).map((item, idx) => {
                      const productInfo = products.find(p => p.id === item.product_id);
                      return (
                        <div key={idx} className="order-detail-item">
                          <span className="detail-name">{productInfo?.name || 'Ürün Bilgisi Yükleniyor...'}</span>
                          <span className="detail-qty">x{item.quantity}</span>
                          <span className="detail-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
