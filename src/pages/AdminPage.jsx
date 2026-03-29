import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';
import { 
  updateOrderStatus, 
  fetchProducts, 
  updateProductStock, 
  addProduct,
  fetchAllProfiles,
  deleteProduct,
  updateProductFields
} from '../api/services';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Modals/Expansions
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', image_url: '', stock_quantity: 100
  });

  useEffect(() => {
    async function loadAdminData() {
      if (user?.email === 'teyo758@gmail.com') {
        try {
          const [ordersRes, productsRes, customersRes] = await Promise.all([
            supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
            fetchProducts(),
            fetchAllProfiles()
          ]);
          
          if (ordersRes.error) {
            console.error('Error fetching admin orders:', ordersRes.error);
          } else {
            setOrders(ordersRes.data || []);
          }

          if (productsRes) setProducts(productsRes);
          if (customersRes) setCustomers(customersRes);
        } catch (err) {
          console.error('Admin data loading failed:', err);
        }
      }
      setLoading(false);
    }

    loadAdminData();
  }, [user]);

  // Actions
  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const success = await updateOrderStatus(orderId, newStatus);
    if (!success) alert('Durum güncellenemedi, lütfen tekrar deneyin.');
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

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    const success = await deleteProduct(productId);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      alert('Ürün silinirken bir hata oluştu');
    }
  };

  const saveProductEdit = async () => {
    if (!editingProduct) return;
    const success = await updateProductFields(editingProduct.id, {
      name: editingProduct.name,
      price: editingProduct.price,
      category: editingProduct.category,
      image_url: editingProduct.image_url,
      stock_quantity: editingProduct.stock_quantity
    });
    if (success) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    } else {
      alert('Güncelleme başarısız oldu.');
    }
  };

  if (loading) {
    return <div className="admin-loading">Dashboard yükleniyor...</div>;
  }

  if (user?.email !== 'teyo758@gmail.com') {
    return (
      <div className="admin-unauthorized">
        <h2>Yetkisiz Erişim</h2>
        <p>Bu sayfayı görüntüleme yetkiniz yok.</p>
      </div>
    );
  }

  // Defensive Dashboard Calculations
  const ordersArray = orders || [];
  const productsArray = products || [];
  const customersArray = customers || [];

  const totalRevenue = ordersArray
    .filter(o => o && (o.status === 'completed' || o.status === 'delivered'))
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  
  const totalOrdersCount = ordersArray.length;
  const lowStockProducts = productsArray.filter(p => p && (p.stock_quantity ?? 100) < 15);
  const recentOrders = ordersArray.slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Genel Bakış
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            📦 Siparişler ({totalOrdersCount})
          </button>
          <button className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            🏷️ Ürünler
          </button>
          <button className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
            👥 Müşteriler
          </button>
        </nav>
      </div>

      <div className="admin-main">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h1 className="tab-title">Hoş geldiniz, Yönetici</h1>
            <p className="tab-subtitle">Mağazanızda bugün olup biten her şeyi buradan takip edebilirsiniz.</p>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Kazanılan Toplam Ciro</h3>
                <div className="metric-value-container">
                  <div className="metric-value">${(totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="metric-label">Son 30 gündeki tamamlanan siparişler</div>
              </div>
              <div className="metric-card">
                <h3>Toplam Sipariş</h3>
                <div className="metric-value-container">
                  <div className="metric-value">{totalOrdersCount}</div>
                </div>
                <div className="metric-label">Sisteme düşen tüm talepler</div>
              </div>
              <div className={lowStockProducts.length > 0 ? "metric-card alert" : "metric-card"}>
                <h3>Kritik Stok Uyarıları</h3>
                <div className="metric-value-container">
                  <div className="metric-value">{(lowStockProducts || []).length} Ürün</div>
                </div>
                <div className="metric-label">Stok seviyesi 15'in altına düşenler</div>
              </div>
              <div className="metric-card">
                <h3>Aktif Müşteri Hesabı</h3>
                <div className="metric-value-container">
                  <div className="metric-value">{(customersArray || []).length}</div>
                </div>
                <div className="metric-label">Doğrulanmış ve kayıtlı profiller</div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Son Siparişler</h3>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sipariş Numarası</th>
                      <th>Müşteri E-Posta</th>
                      <th>Tarih</th>
                      <th>Ödeme Tutarı</th>
                      <th>Durum Bilgisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="font-bold">ORD-{order.id?.toString().slice(0,8).toUpperCase() || 'N/A'}</td>
                        <td>{order.user_email || 'Bilinmeyen'}</td>
                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                        <td className="font-bold">${Number(order.total_amount || 0).toFixed(2)}</td>
                        <td><span className={`status-badge ${order.status || 'pending'}`}>{order.status || 'beklemede'}</span></td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr><td colSpan="5" className="text-center">Henüz sipariş yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-content">
            <h1 className="tab-title">Sipariş Yönetimi</h1>
            <p className="tab-subtitle">Tüm siparişlerin durumunu güncelleyebilir ve detaylarını inceleyebilirsiniz.</p>
            
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Tüm Sipariş Listesi</h3>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tarih</th>
                      <th>Müşteri</th>
                      <th>Tutar</th>
                      <th>İşlem / Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersArray.map(order => (
                      <React.Fragment key={order.id}>
                        <tr className="order-row" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} style={{cursor: 'pointer'}}>
                          <td className="font-bold">#{order.id?.toString().slice(0,8).toUpperCase()}</td>
                          <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : '-'}</td>
                          <td>{order.user_email}</td>
                          <td className="font-bold">${Number(order.total_amount || 0).toFixed(2)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select 
                              className="status-select"
                              value={order.status || 'pending'}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              <option value="pending">⏳ Beklemede</option>
                              <option value="preparing">🍳 Hazırlanıyor</option>
                              <option value="shipped">🚚 Kargoda</option>
                              <option value="delivered">✅ Teslim Edildi</option>
                              <option value="completed">🎉 Tamamlandı</option>
                              <option value="cancelled">❌ İptal Edildi</option>
                            </select>
                          </td>
                        </tr>
                        {expandedOrder === order.id && (
                          <tr className="expanded-row">
                            <td colSpan="5">
                              <div className="expanded-order-details">
                                <h4>Ürün Detayları</h4>
                                {order.order_items?.map((item, idx) => (
                                  <div key={idx} className="expanded-item">
                                    <span>{item.quantity}x Ürün ID: {item.product_id?.slice(0,8)}</span>
                                    <span>Birim: ${Number(item.price || 0).toFixed(2)}</span>
                                    <strong>Toplam: ${(item.quantity * item.price).toFixed(2)}</strong>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="inventory-content">
            <h1 className="tab-title">Stok ve Envanter</h1>
            <p className="tab-subtitle">Mağazanızdaki ürünleri yönetin, fiyat ve stok güncellemeleri yapın.</p>
            
            <div className="admin-card" style={{padding: '32px', marginBottom: '32px'}}>
              <div className="admin-card-header" style={{padding: '0 0 24px 0'}}>
                <h3>Yeni Ürün Ekle</h3>
              </div>
              <form onSubmit={handleAddProduct} className="admin-form-row">
                <div>
                  <label style={{fontSize: '14px', fontWeight: '500'}}>Ürün Adı</label>
                  <input type="text" placeholder="Örn: Organik Elma" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div>
                  <label style={{fontSize: '14px', fontWeight: '500'}}>Kategori</label>
                  <input type="text" placeholder="Meyve" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                </div>
                <div>
                  <label style={{fontSize: '14px', fontWeight: '500'}}>Fiyat</label>
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                </div>
                <button type="submit" className="btn-primary">Ürünü Kaydet</button>
              </form>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Ürün Listesi</h3>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
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
                    {productsArray.map(product => {
                      const isEditing = editingProduct?.id === product.id;
                      return (
                        <tr key={product.id}>
                          <td><img src={product.image_url} alt={product.name} className="table-img" /></td>
                          <td>{isEditing ? <input className="edit-input" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /> : product.name}</td>
                          <td>{isEditing ? <input className="edit-input" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} /> : product.category}</td>
                          <td>{isEditing ? <input className="edit-input" type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} /> : `$${Number(product.price || 0).toFixed(2)}`}</td>
                          <td style={{fontWeight: '700', color: (product.stock_quantity < 15) ? '#b42318' : 'inherit'}}>{isEditing ? <input className="edit-input" type="number" value={editingProduct.stock_quantity} onChange={e => setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value)})} /> : product.stock_quantity}</td>
                          <td>
                            {isEditing ? (
                              <div style={{display:'flex', gap: '8px'}}>
                                <button className="btn-primary" onClick={saveProductEdit} style={{padding: '6px 12px'}}>Kaydet</button>
                                <button className="btn-secondary" onClick={() => setEditingProduct(null)} style={{padding: '6px 12px'}}>İptal</button>
                              </div>
                            ) : (
                              <div style={{display:'flex', gap: '8px'}}>
                                <button className="btn-secondary" onClick={() => setEditingProduct(product)}>Düzenle</button>
                                <button className="btn-danger" onClick={() => handleDeleteProduct(product.id)}>Sil</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="customers-content">
            <h1 className="tab-title">Müşteriler</h1>
            <p className="tab-subtitle">Mağazanıza kayıt olan kullanıcıların profil ve adres bilgilerine ulaşın.</p>
            
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Kayıtlı Kullanıcı Rehberi</h3>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Müşteri</th>
                      <th>Telefon</th>
                      <th>Teslimat Adresi</th>
                      <th>Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersArray.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{fontWeight: '600', color: '#101828'}}>{c.full_name || 'İsimsiz Müşteri'}</div>
                          <div style={{fontSize: '12px', color: '#667085'}}>{c.id?.slice(0,8)}</div>
                        </td>
                        <td>{c.phone || '-'}</td>
                        <td title={c.delivery_address}>{c.delivery_address ? (c.delivery_address.slice(0,40) + '...') : '-'}</td>
                        <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
