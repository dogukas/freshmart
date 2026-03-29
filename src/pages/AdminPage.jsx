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
            <h2 className="tab-title">Genel Bakış</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Kazanılan Ciro</h3>
                <div className="metric-value">${(totalRevenue || 0).toFixed(2)}</div>
                <div className="metric-label">Teslim Edilen Siparişlerden</div>
              </div>
              <div className="metric-card">
                <h3>Sipariş Sayısı</h3>
                <div className="metric-value">{totalOrdersCount}</div>
                <div className="metric-label">Tüm Zamanlar</div>
              </div>
              <div className="metric-card alert">
                <h3>Kritik Stok</h3>
                <div className="metric-value">{lowStockProducts.length}</div>
                <div className="metric-label">15 Adetin Altında Ürün Var</div>
              </div>
              <div className="metric-card">
                <h3>Kayıtlı Müşteri</h3>
                <div className="metric-value">{customersArray.length}</div>
                <div className="metric-label">Sistemde Açılmış Hesap</div>
              </div>
            </div>

            <div className="recent-orders-section">
              <h3>Son Gelen Siparişler</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sipariş ID</th>
                      <th>Müşteri</th>
                      <th>Tarih</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id?.toString().slice(0,8) || 'N/A'}</td>
                        <td>{order.user_email || 'Bilinmeyen'}</td>
                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                        <td>${Number(order.total_amount || 0).toFixed(2)}</td>
                        <td><span className={`status-badge ${order.status || 'pending'}`}>{order.status || 'pending'}</span></td>
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
            <h2 className="tab-title">Tüm Siparişler</h2>
            <div className="admin-table-container">
              <table className="admin-table interactive">
                <thead>
                  <tr>
                    <th>Sipariş ID</th>
                    <th>Tarih</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersArray.map(order => (
                    <React.Fragment key={order.id}>
                      <tr className="order-row" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                        <td>#{order.id?.toString().slice(0,8) || 'N/A'}</td>
                        <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : '-'}</td>
                        <td>{order.user_email || 'Bilinmeyen'}</td>
                        <td className="font-bold">${Number(order.total_amount || 0).toFixed(2)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select 
                            className={`status-select ${order.status || 'pending'}`}
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">⏳ Bekliyor</option>
                            <option value="preparing">🍳 Hazırlanıyor</option>
                            <option value="shipped">🚚 Kargoya Verildi</option>
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
                              <h4>Sipariş İçeriği:</h4>
                              {order.order_items && order.order_items.length > 0 ? (
                                order.order_items.map((item, idx) => (
                                  <div key={idx} className="expanded-item">
                                    <span>ID: {item.product_id?.toString().slice(0,6) || 'N/A'}</span>
                                    <span>{item.quantity} Adet</span>
                                    <span>Birim Fiyat: ${Number(item.price || 0).toFixed(2)}</span>
                                    <strong>Ara Toplam: ${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</strong>
                                  </div>
                                ))
                              ) : (
                                <p>Sipariş detayı bulunamadı.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {ordersArray.length === 0 && (
                    <tr><td colSpan="5" className="text-center">Hiç sipariş bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="inventory-content">
            <h2 className="tab-title">Ürün & Stok Yönetimi</h2>
            
            <div className="admin-card add-product-card">
              <h3>Yeni Ürün Ekle</h3>
              <form onSubmit={handleAddProduct} className="admin-form-row">
                <input type="text" placeholder="Ürün Adı" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input type="text" placeholder="Kategori" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                <input type="number" placeholder="Fiyat ($)" required step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                <input type="text" placeholder="Görsel URL" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                <input type="number" placeholder="Stok" required value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})} />
                <button type="submit" className="btn-primary">Ekle</button>
              </form>
            </div>

            <div className="admin-card margin-top">
              <h3>Mevcut Ürünler</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Ürün Adı</th>
                      <th>Kategori</th>
                      <th>Fiyat</th>
                      <th>Stok</th>
                      <th>Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsArray.map(product => {
                      const isEditing = editingProduct?.id === product.id;
                      return (
                        <tr key={product.id}>
                          <td><img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} className="table-img" /></td>
                          <td>
                            {isEditing ? (
                              <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="edit-input" />
                            ) : product.name}
                          </td>
                          <td>
                            {isEditing ? (
                              <input type="text" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="edit-input" />
                            ) : product.category}
                          </td>
                          <td>
                            {isEditing ? (
                              <input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="edit-input small" />
                            ) : `$${Number(product.price || 0).toFixed(2)}`}
                          </td>
                          <td>
                            {isEditing ? (
                              <input type="number" value={editingProduct.stock_quantity} onChange={e => setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value)})} className="edit-input small" />
                            ) : (
                              <span className={(product.stock_quantity || 0) < 15 ? 'text-danger font-bold' : ''}>{product.stock_quantity || 0}</span>
                            )}
                          </td>
                          <td className="actions-cell">
                            {isEditing ? (
                              <>
                                <button className="btn-success" onClick={saveProductEdit}>Kaydet</button>
                                <button className="btn-secondary" onClick={() => setEditingProduct(null)}>İptal</button>
                              </>
                            ) : (
                              <>
                                <button className="btn-edit" onClick={() => setEditingProduct(product)}>Düzenle</button>
                                <button className="btn-danger" onClick={() => handleDeleteProduct(product.id)}>Sil</button>
                              </>
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
            <h2 className="tab-title">Kayıtlı Profil Verileri</h2>
            <div className="admin-card">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kullanıcı ID</th>
                      <th>İsim Soyisim</th>
                      <th>Telefon</th>
                      <th>Teslimat Adresi</th>
                      <th>Oluşturulma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersArray.map(c => (
                      <tr key={c.id}>
                        <td className="text-muted" title={c.id}>{c.id?.toString().slice(0,8) || 'N/A'}...</td>
                        <td>{c.full_name || '-'}</td>
                        <td>{c.phone || '-'}</td>
                        <td className="address-col">{c.delivery_address || '-'}</td>
                        <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                    {customersArray.length === 0 && (
                      <tr><td colSpan="5" className="text-center">Kayıtlı tam profil bulunamadı.</td></tr>
                    )}
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
