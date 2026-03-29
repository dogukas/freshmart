import React, { useEffect, useState, useMemo } from 'react';
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
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
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

  // Defensive Array Filtering
  const ordersArray = (orders || []).filter(o => o && o.id);
  const productsArray = (products || []).filter(p => p && p.id);
  const customersArray = (customers || []).filter(c => c && c.id);

  const totalRevenue = ordersArray
    .filter(o => o.status === 'completed' || o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  
  const totalOrdersCount = ordersArray.length;
  const lowStockProducts = productsArray.filter(p => (p.stock_quantity ?? 100) < 15);
  const recentOrders = ordersArray.slice(0, 5);

  // Chart Data Calculations
  const statusChartData = useMemo(() => {
    if (!ordersArray || ordersArray.length === 0) return [];
    const counts = ordersArray.reduce((acc, order) => {
      if (!order) return acc;
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: counts[key]
    }));
  }, [ordersArray]);

  const categoryChartData = useMemo(() => {
    if (!productsArray || productsArray.length === 0) return [];
    const counts = productsArray.reduce((acc, prod) => {
      if (!prod) return acc;
      const cat = prod.category || 'Diğer';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [productsArray]);

  const COLORS = ['#079455', '#17B26A', '#32D583', '#73E2A3', '#A6EFD2', '#D1FADF'];

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR V2 */}
      <div className="admin-sidebar">
        <div className="sidebar-container">
          <div className="admin-logo">
            <div className="logo-icon">🍀</div>
            <h2>FreshMart</h2>
          </div>
          
          <nav className="admin-nav">
            <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <span className="nav-icon">📊</span> <span>Genel Bakış</span>
            </button>
            <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <span className="nav-icon">📦</span> <span>Siparişler</span>
            </button>
            <button className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
              <span className="nav-icon">🏷️</span> <span>Ürün & Stok</span>
            </button>
            <button className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
              <span className="nav-icon">👥</span> <span>Müşteriler</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">Yönetici</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button className="settings-btn" title="Ayarlar">⚙️</button>
          </div>
        </div>
      </div>

      <div className="admin-main">
        {/* TOP HEADER BAR V2 */}
        <header className="main-header">
          <div className="header-left">
            <div className="breadcrumbs">
              <span>Yönetim</span>
              <span className="divider">/</span>
              <span className="current">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
            <h1 className="header-title">
              {activeTab === 'dashboard' && 'Mağaza Özeti'}
              {activeTab === 'orders' && 'Sipariş Yönetimi'}
              {activeTab === 'inventory' && 'Ürün Kataloğu'}
              {activeTab === 'customers' && 'Müşteri Rehberi'}
            </h1>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <span className="icon">⬇️</span> Dışa Aktar
            </button>
            {activeTab === 'inventory' && (
              <button className="btn-primary">
                <span className="icon">➕</span> Yeni Ürün
              </button>
            )}
          </div>
        </header>

        {/* CONTENT V2 */}
        <div className="tab-content-wrapper">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Kazanılan Toplam Ciro</h3>
                    <span className="trend positive">↑ 12.5%</span>
                  </div>
                  <div className="metric-value-container">
                    <div className="metric-value">${(totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="metric-label">Son 30 gündeki ciro</div>
                </div>
                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Toplam Sipariş</h3>
                    <span className="trend positive">↑ 8.2%</span>
                  </div>
                  <div className="metric-value-container">
                    <div className="metric-value">{totalOrdersCount}</div>
                  </div>
                  <div className="metric-label">Tamamlanan talepler</div>
                </div>
                <div className={lowStockProducts.length > 0 ? "metric-card alert" : "metric-card"}>
                  <div className="metric-header">
                    <h3>Kritik Stok Uyarıları</h3>
                  </div>
                  <div className="metric-value-container">
                    <div className="metric-value">{(lowStockProducts || []).length} Ürün</div>
                  </div>
                  <div className="metric-label">Stok seviyesi 15'in altında</div>
                </div>
                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Aktif Müşteri</h3>
                    <span className="trend positive">↑ 4.1%</span>
                  </div>
                  <div className="metric-value-container">
                    <div className="metric-value">{(customersArray || []).length}</div>
                  </div>
                  <div className="metric-label">Kayıtlı ve doğrulanmış</div>
                </div>
              </div>

              {/* GRAPHİKLER BÖLÜMÜ (PIE UI) */}
              <div className="insights-grid">
                <div className="admin-card chart-card">
                  <div className="admin-card-header">
                    <h3>Sipariş Durum Dağılımı</h3>
                  </div>
                  <div className="chart-container">
                    {statusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">Veri bulunamadı</div>
                    )}
                  </div>
                </div>

                <div className="admin-card chart-card">
                  <div className="admin-card-header">
                    <h3>Kategori Bazlı Ürün Analizi</h3>
                  </div>
                  <div className="chart-container">
                    {categoryChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">Veri bulunamadı</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>Son Sipariş Akışı</h3>
                    <p className="card-subtitle">En son gelen 5 siparişin detaylı dökümü.</p>
                  </div>
                  <button className="btn-text">Tümünü Gör →</button>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sipariş Numarası</th>
                        <th>Müşteri</th>
                        <th>Tarih</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => {
                        if (!order || !order.id) return null;
                        return (
                          <tr key={order.id}>
                            <td className="font-bold">ORD-{String(order.id).slice(0, 8).toUpperCase()}</td>
                            <td>
                              <div className="table-user">
                                <span className="user-email">{order.user_email || 'Bilinmeyen'}</span>
                              </div>
                            </td>
                            <td>{order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : '-'}</td>
                            <td className="font-bold">${Number(order.total_amount || 0).toFixed(2)}</td>
                            <td><span className={`status-badge ${order.status || 'pending'}`}>{order.status || 'Beklemede'}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="orders-content">
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>Tüm Siparişler</h3>
                    <p className="card-subtitle">Müşteri taleplerini buradan yönetin.</p>
                  </div>
                  <div className="filter-actions">
                    <input type="text" placeholder="Sipariş Ara..." className="search-input" />
                  </div>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tarih</th>
                        <th>Müşteri</th>
                        <th>Tutar</th>
                        <th>Durum Yönetimi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersArray.map(order => {
                        if (!order || !order.id) return null;
                        return (
                          <React.Fragment key={order.id}>
                            <tr className="order-row" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                              <td className="font-bold">#{String(order.id).slice(0, 8).toUpperCase()}</td>
                              <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : '-'}</td>
                              <td>{order.user_email || 'Misafir'}</td>
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
                                  <div className="expanded-outer">
                                    <div className="expanded-inner">
                                      <h4>Ürün Listesi</h4>
                                      {order.order_items?.map((item, idx) => (
                                        <div key={idx} className="inner-item">
                                          <span>{item.quantity}x Ürün ID: {String(item.product_id).slice(0, 8)}</span>
                                          <strong>${(Number(item.quantity) * Number(item.price)).toFixed(2)}</strong>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="inventory-content">
              <div className="inventory-grid">
                <div className="admin-card add-card">
                  <div className="admin-card-header">
                    <h3>Yeni Ürün Kaydı</h3>
                  </div>
                  <div className="card-padding">
                    <form onSubmit={handleAddProduct} className="premium-form">
                      <div className="form-group">
                        <label>Ürün Adı</label>
                        <input type="text" placeholder="Örn: Portakal" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                      </div>
                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Kategori</label>
                          <input type="text" placeholder="Meyve" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Fiyat ($)</label>
                          <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Başlangıç Stoğu</label>
                        <input type="number" required value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})} />
                      </div>
                      <button type="submit" className="btn-primary full-width">Ürünü Yayınla</button>
                    </form>
                  </div>
                </div>

                <div className="admin-card table-card">
                  <div className="admin-card-header">
                    <h3>Ürün Listesi</h3>
                    <input type="text" placeholder="Ürün Ara..." className="search-input" />
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ürün</th>
                          <th>Kategori</th>
                          <th>Fiyat</th>
                          <th>Stok Belgesi</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsArray.map(product => {
                          const isEditing = editingProduct?.id === product.id;
                          return (
                            <tr key={product.id}>
                              <td>
                                <div className="product-table-cell">
                                  <img src={product.image_url} alt="" className="mini-img" />
                                  <span>{isEditing ? <input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="edit-input" /> : product.name}</span>
                                </div>
                              </td>
                              <td>{isEditing ? <input value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="edit-input" /> : product.category}</td>
                              <td className="font-bold">${isEditing ? <input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="edit-input" /> : Number(product.price).toFixed(2)}</td>
                              <td>
                                <span className={`stock-indicator ${(product.stock_quantity < 15) ? 'low' : 'good'}`}>
                                  {isEditing ? <input type="number" value={editingProduct.stock_quantity} onChange={e => setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value)})} className="edit-input" /> : product.stock_quantity + ' adet'}
                                </span>
                              </td>
                              <td>
                                {isEditing ? (
                                  <div className="edit-actions">
                                    <button className="btn-save" onClick={saveProductEdit}>✅</button>
                                    <button className="btn-cancel" onClick={() => setEditingProduct(null)}>❌</button>
                                  </div>
                                ) : (
                                  <div className="table-actions">
                                    <button className="btn-icon" onClick={() => setEditingProduct(product)}>✏️</button>
                                    <button className="btn-icon delete" onClick={() => handleDeleteProduct(product.id)}>🗑️</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="customers-content">
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>Kullanıcı Veritabanı</h3>
                    <p className="card-subtitle">Kayıtlı tüm kullanıcılar ve profilleri.</p>
                  </div>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Müşteri</th>
                        <th>İletişim</th>
                        <th>Teslimat Adresi</th>
                        <th>Hesap Yaşı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersArray.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div className="customer-cell">
                              <div className="cust-avatar">{c.full_name?.charAt(0)}</div>
                              <div className="cust-details">
                                <span className="cust-name">{c.full_name || 'İsimsiz Müşteri'}</span>
                                <span className="cust-id">ID: {c.id?.slice(0,8)}</span>
                              </div>
                            </div>
                          </td>
                          <td>{c.phone || '-'}</td>
                          <td className="address-cell-v2" title={c.delivery_address}>{c.delivery_address || '-'}</td>
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
    </div>
  );
}
