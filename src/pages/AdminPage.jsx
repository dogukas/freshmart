import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';
import { updateOrderStatus, fetchProducts, updateProductStock, addProduct } from '../api/services';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', image_url: '', stock_quantity: 100
  });

  useEffect(() => {
    async function loadAdminData() {
      if (user?.email === 'teyo758@gmail.com') {
        const [ordersRes, productsRes] = await Promise.all([
          supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
          fetchProducts() // from services
        ]);
        
        if (ordersRes.error) {
          console.error('Error fetching admin orders:', ordersRes.error);
        } else {
          setOrders(ordersRes.data || []);
        }

        if (productsRes) {
          setProducts(productsRes);
        }
      }
      setLoading(false);
    }

    loadAdminData();
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const success = await updateOrderStatus(orderId, newStatus);
    if (!success) {
      alert('Durum güncellenemedi, lütfen tekrar deneyin.');
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: newStock } : p));
    await updateProductStock(productId, newStock);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return alert('İsim ve fiyat zorunlu.');
    
    const added = await addProduct(newProduct);
    if (added) {
      setProducts([added, ...products]);
      setNewProduct({ name: '', category: '', price: '', image_url: '', stock_quantity: 100 });
      alert('Ürün başarıyla eklendi!');
    } else {
      alert('Ürün eklenirken hata oluştu.');
    }
  };

  if (loading) {
    return <div className="admin-loading">Admin paneli yükleniyor...</div>;
  }

  if (user?.email !== 'teyo758@gmail.com') {
    return (
      <div className="admin-unauthorized">
        <h2>Yetkisiz Erişim</h2>
        <p>Bu sayfayı görüntüleme yetkiniz yok.</p>
      </div>
    );
  }

  // Gruplama işlemi (user_email üzerinden)
  const userGroups = {};
  orders.forEach(order => {
    const email = order.user_email || 'Bilinmeyen Kullanıcı';
    if (!userGroups[email]) {
      userGroups[email] = [];
    }
    userGroups[email].push(order);
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Paneli</h1>
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Tüm Siparişler
          </button>
          <button 
            className={`admin-tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📊 Ürün & Stok Yönetimi
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'orders' && (
          Object.keys(userGroups).length === 0 ? (
            <p>Henüz sistemde hiç sipariş bulunmuyor.</p>
          ) : (
            Object.keys(userGroups).map(email => (
            <div key={email} className="admin-user-group">
              <h3 className="admin-user-title">👤 {email}</h3>
              <div className="admin-orders-list">
                {userGroups[email].map(order => (
                  <div key={order.id} className="admin-order-card">
                    <div 
                      className="admin-order-summary"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="admin-order-info">
                        <strong>Sipariş #{order.id}</strong>
                        <span>Tarih: {new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                        <div className="status-dropdown-wrapper" onClick={e => e.stopPropagation()}>
                          <select 
                            className={`status-select ${order.status}`}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">⏳ Bekliyor (Pending)</option>
                            <option value="preparing">🍳 Hazırlanıyor</option>
                            <option value="shipped">🚚 Kargoya Verildi</option>
                            <option value="delivered">✅ Teslim Edildi</option>
                            <option value="completed">🎉 Tamamlandı</option>
                            <option value="cancelled">❌ İptal Edildi</option>
                          </select>
                        </div>
                      </div>
                      <div className="admin-order-total">
                        ${Number(order.total_amount).toFixed(2)}
                      </div>
                    </div>
                    
                    {expandedOrder === order.id && (
                      <div className="admin-order-details">
                        <h4>Sipariş İçeriği:</h4>
                        {order.order_items && order.order_items.length > 0 ? (
                          order.order_items.map((item, idx) => (
                            <div key={idx} className="admin-order-item">
                              <span>Ürün ID: {item.product_id}</span>
                              <span>{item.quantity} adet</span>
                              <span>${Number(item.price).toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <p>Bu siparişte ürün detayı bulunamadı.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
          )
        )}

        {activeTab === 'inventory' && (
          <div className="admin-inventory-section">
            <div className="admin-inventory-add">
              <h3>Yeni Ürün Ekle</h3>
              <form onSubmit={handleAddProduct} className="admin-add-product-form">
                <input type="text" placeholder="Ürün Adı" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input type="text" placeholder="Kategori (örn: Meyve, Sebze)" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                <input type="number" placeholder="Fiyat ($)" required step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                <input type="text" placeholder="Resim URL (isteğe bağlı)" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                <input type="number" placeholder="Başlangıç Stoğu" required value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})} />
                <button type="submit">Ekle</button>
              </form>
            </div>

            <div className="admin-inventory-list">
              <h3>Mevcut Ürünler ve Stoklar</h3>
              <table className="admin-inventory-table">
                <thead>
                  <tr>
                    <th>Görsel</th>
                    <th>Ürün Adı</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>Stok</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td><img src={product.image_url} alt={product.name} className="admin-inv-img" /></td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>
                        <input 
                          type="number" 
                          className="admin-stock-input"
                          value={product.stock_quantity ?? 0}
                          onChange={(e) => handleStockUpdate(product.id, parseInt(e.target.value))}
                        />
                      </td>
                      <td>
                        <button className="admin-quick-update-btn">Güncellendi</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
