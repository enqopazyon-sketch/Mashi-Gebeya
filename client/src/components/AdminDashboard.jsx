import React, { useState, useEffect } from 'react';
import { 
  Shield, Package, ShoppingBag, DollarSign, Plus, Trash2, Edit, 
  Send, X, Key, Upload, Link as LinkIcon, Image as ImageIcon, Layers
} from 'lucide-react';

export default function AdminDashboard({ products, setProducts, initialOrders, storeSettings, t }) {
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState(initialOrders || []);
  const [stats, setStats] = useState({
    totalProducts: products.length,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  // Product Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageSourceTab, setImageSourceTab] = useState('file'); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState('');
  
  // Multi-image list state
  const [imageList, setImageList] = useState([]);

  const [productForm, setProductForm] = useState({
    title: '',
    category: 'ማልያዎች (Jerseys)',
    price: '',
    description: '',
    inStock: true
  });

  // Telegram Bot Settings state
  const [botSettings, setBotSettings] = useState({
    botToken: '',
    adminChatId: '',
    storeName: 'Mashi Gebeya',
    storePhone: '0911305530',
    storeAddress: 'Jemo 1 Block 157'
  });
  const [testMsgStatus, setTestMsgStatus] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchSettings();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setBotSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  // Handle Multi-File Upload from computer (1, 2, 3+ photos)
  const handleMultipleFilesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setImageList(prev => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    if (!urlInput) return;
    setImageList(prev => [...prev, urlInput]);
    setUrlInput('');
  };

  const handleRemoveImageIndex = (idx) => {
    setImageList(prev => prev.filter((_, i) => i !== idx));
  };

  // Product CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) return;

    const mainImage = imageList.length > 0 ? imageList[0] : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
    const finalPayload = {
      ...productForm,
      price: Number(productForm.price),
      image: mainImage,
      images: imageList.length > 0 ? imageList : [mainImage]
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload)
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload)
        });
        if (res.ok) {
          const newProd = await res.json();
          setProducts(prev => [newProd, ...prev]);
        }
      }
    } catch (err) {
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...finalPayload } : p));
      } else {
        setProducts(prev => [{ id: 'p_' + Date.now(), ...finalPayload }, ...prev]);
      }
    }

    setIsAddModalOpen(false);
    setEditingProduct(null);
    setImageList([]);
    setUrlInput('');
    setProductForm({
      title: '',
      category: 'ማልያዎች (Jerseys)',
      price: '',
      description: '',
      inStock: true
    });
    fetchStats();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
      fetchStats();
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
    } catch (err) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    fetchStats();
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botSettings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleTestTelegramMsg = async () => {
    setTestMsgStatus('Sending test message...');
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setTestMsgStatus('✅ Test message sent successfully!');
      } else {
        setTestMsgStatus(`⚠️ ${data.message || data.error || 'Logged in simulator'}`);
      }
    } catch (err) {
      setTestMsgStatus('⚠️ Logged in simulator');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div className="admin-header-wrap">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield style={{ color: 'var(--accent-gold)' }} />
            <span>{t.adminTitle}</span>
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            📍 {storeSettings?.storeAddress || 'ጀሞ 1 ብሎክ 157'} | 📞 {storeSettings?.storePhone || '0911305530'}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setImageList([]); setUrlInput(''); setIsAddModalOpen(true); }}>
          <Plus size={18} />
          <span>{t.addProduct}</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="admin-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.totalRevenue}</div>
            <div className="stat-value">{stats.totalRevenue.toLocaleString()} ETB</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ShoppingBag size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.totalOrders}</div>
            <div className="stat-value">{stats.totalOrders || orders.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Package size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.registeredProducts}</div>
            <div className="stat-value">{products.length}</div>
          </div>
        </div>
      </div>

      {/* Sleek Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} />
          <span>{t.tabProducts} ({products.length})</span>
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={16} />
          <span>{t.tabOrders} ({orders.length})</span>
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'telegram' ? 'active' : ''}`}
          onClick={() => setActiveTab('telegram')}
        >
          <Send size={16} />
          <span>{t.tabTelegram}</span>
        </button>
      </div>

      {/* TAB 1: Products */}
      {activeTab === 'products' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.tableImage}</th>
                <th>{t.tableTitle}</th>
                <th>{t.tableCategory}</th>
                <th>{t.tablePrice}</th>
                <th>{t.tableStatus}</th>
                <th>{t.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No products added yet. Click <b>"{t.addProduct}"</b> above to add items with photos.
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img 
                          src={p.image || (p.images && p.images[0])} 
                          alt={p.title} 
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} 
                        />
                        {p.images && p.images.length > 1 && (
                          <span style={{ fontSize: '0.72rem', background: 'var(--accent-gold)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                            +{p.images.length - 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</td>
                    <td><span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border-subtle)' }}>{p.category}</span></td>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>{p.price.toLocaleString()} ETB</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: p.inStock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: p.inStock ? 'var(--success)' : 'var(--danger)' }}>
                        {p.inStock ? t.inStock : t.outOfStock}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn" 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.82rem', 
                            fontWeight: 700,
                            background: 'rgba(0, 184, 148, 0.18)', 
                            color: 'var(--accent-gold)', 
                            border: '1px solid rgba(0, 184, 148, 0.4)' 
                          }}
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm(p);
                            setImageList(p.images || [p.image]);
                            setIsAddModalOpen(true);
                          }}
                          title="Edit Product / እቃውን አስተካክል"
                        >
                          <Edit size={16} style={{ color: 'var(--accent-gold)' }} />
                          <span>አስተካክል</span>
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 10px', fontSize: '0.82rem', fontWeight: 600 }}
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Delete Product / እቃውን ሰርዝ"
                        >
                          <Trash2 size={16} />
                          <span>ሰርዝ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Orders */}
      {activeTab === 'orders' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      {o.customerEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>}
                    </td>
                    <td><code>{o.phone}</code></td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {o.items?.map((it, i) => (
                        <div key={i}>• {it.title} (x{it.quantity})</div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 800 }}>{o.totalAmount?.toLocaleString()} ETB</td>
                    <td>
                      <select 
                        className="form-select"
                        value={o.status}
                        onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Processing">⚙️ Processing</option>
                        <option value="Shipped">🚚 Shipped</option>
                        <option value="Completed">✅ Completed</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Telegram Bot & Store Settings */}
      {activeTab === 'telegram' && (
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} style={{ color: 'var(--accent-gold)' }} />
            <span>🤖 የሱቅ መረጃዎች እና የቦት ቅንብሮች (Store Info & Telegram Config)</span>
          </h3>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
            {/* Store Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>🏪 የሱቁ ስም (Store Name)</label>
              <input
                type="text"
                className="form-input"
                placeholder="ማሺ ገበያ (Mashi Gebeya)"
                value={botSettings.storeName || ''}
                onChange={(e) => setBotSettings({ ...botSettings, storeName: e.target.value })}
              />
            </div>

            {/* Store Phone Number */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>📞 የሱቁ ስልክ ቁጥር (Store Phone Number)</label>
              <input
                type="text"
                className="form-input"
                placeholder="0911305530"
                value={botSettings.storePhone || ''}
                onChange={(e) => setBotSettings({ ...botSettings, storePhone: e.target.value })}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                * በዌብሳይቱ እና በቴሌግራም መልእክት ላይ የሚወጣው የሱቁ ስልክ ቁጥር
              </div>
            </div>

            {/* Store Address */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>📍 የሱቁ አድራሻ (Store Address)</label>
              <input
                type="text"
                className="form-input"
                placeholder="ጀሞ 1 ብሎክ 157"
                value={botSettings.storeAddress || ''}
                onChange={(e) => setBotSettings({ ...botSettings, storeAddress: e.target.value })}
              />
            </div>

            {/* Google Maps Link */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>🗺️ የካርታ ሊንክ (Google Maps Location URL)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://maps.app.goo.gl/qu1soae2p3Xeydiq9"
                value={botSettings.storeMapUrl || ''}
                onChange={(e) => setBotSettings({ ...botSettings, storeMapUrl: e.target.value })}
              />
            </div>

            {/* Telegram Bot Token */}
            <div className="form-group" style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>🔑 Telegram Bot Token (TELEGRAM_BOT_TOKEN)</label>
              <input
                type="text"
                className="form-input"
                placeholder="7123456789:AAFg..."
                value={botSettings.botToken || ''}
                onChange={(e) => setBotSettings({ ...botSettings, botToken: e.target.value })}
              />
            </div>

            {/* Admin Telegram Chat ID */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>💬 Admin Telegram Chat ID (TELEGRAM_ADMIN_CHAT_ID)</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456789"
                value={botSettings.adminChatId || ''}
                onChange={(e) => setBotSettings({ ...botSettings, adminChatId: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', fontWeight: 700 }}>
                <span>💾 መረጃዎችን አስቀምጥ (Save Settings)</span>
              </button>

              <button type="button" className="btn btn-telegram" onClick={handleTestTelegramMsg}>
                <Send size={16} />
                <span>የቦት ፍተሻ (Test Notification)</span>
              </button>
            </div>

            {testMsgStatus && (
              <div style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                {testMsgStatus}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Add / Edit Product Modal with Multi-Image Support (1, 2, 3+ photos) */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} style={{ color: 'var(--accent-gold)' }} />
              <span>{editingProduct ? t.editProduct : t.addProduct}</span>
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">{t.productTitleLabel}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Real Madrid Home Kit"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.categoryLabel}</label>
                <select
                  className="form-select"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="ማልያዎች (Jerseys)">⚽ ማልያዎች (Jerseys)</option>
                  <option value="ቱታዎችና ጃኬቶች (Tracksuits)">🧥 ቱታዎችና ጃኬቶች (Tracksuits)</option>
                  <option value="ጫማዎች (Shoes)">👟 ጫማዎች (Shoes)</option>
                  <option value="ሽቶዎችና የውበት እቃዎች (Perfumes & Care)">🧴 ሽቶዎችና የውበት እቃዎች (Perfumes & Care)</option>
                  <option value="ቸኮሌቶችና መክሰሶች (Chocolates & Treats)">🍫 ቸኮሌቶችና መክሰሶች (Chocolates & Treats)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.priceLabel}</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  placeholder="2500"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />
              </div>

              {/* Multi-Image Upload Selection: File Upload vs URL Link */}
              <div className="form-group">
                <label className="form-label">Product Images (Upload 1, 2, 3+ Photos)</label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button 
                    type="button"
                    className={`btn ${imageSourceTab === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => setImageSourceTab('file')}
                  >
                    <Upload size={14} />
                    <span>{t.imageFileTab}</span>
                  </button>

                  <button 
                    type="button"
                    className={`btn ${imageSourceTab === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => setImageSourceTab('url')}
                  >
                    <LinkIcon size={14} />
                    <span>{t.imageUrlTab}</span>
                  </button>
                </div>

                {imageSourceTab === 'file' ? (
                  <div style={{ border: '2px dashed var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg-surface)' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      id="product-multi-file-input"
                      onChange={handleMultipleFilesUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="product-multi-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={30} style={{ color: 'var(--accent-gold)' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        ምስሎችን ከኮምፒተርዎ ይምረጡ (Select Multiple Images)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        You can select 2, 3, or more photos at once!
                      </span>
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddUrlImage}>
                      Add
                    </button>
                  </div>
                )}

                {/* Thumbnail Preview Row for Selected Images */}
                {imageList.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Selected Photos ({imageList.length}):
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {imageList.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '70px', height: '70px' }}>
                          <img 
                            src={img} 
                            alt={`Preview ${idx}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageIndex(idx)}
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              background: 'var(--danger)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t.descLabel}</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Product description..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                <span>{t.saveProductBtn}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
