import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import TelegramSimulator from './components/TelegramSimulator';
import AdminDashboard from './components/AdminDashboard';
import AdminAuthModal from './components/AdminAuthModal';
import Footer from './components/Footer';
import { translations } from './data/i18n';
import { ShoppingBag } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [checkoutItems, setCheckoutItems] = useState([]);

  // Store Dynamic Settings (.env sync)
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'ማሺ ገበያ (Mashi Gebeya)',
    storePhone: '',
    storeAddress: '',
    storeMapUrl: ''
  });

  // Theme & Language defaults: English (en) and Light Theme (light)
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');

  // Auth & Admin state safely initialized
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mashi_admin_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (err) {
      localStorage.removeItem('mashi_admin_user');
      return null;
    }
  });
  
  const [isAdminView, setIsAdminView] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data || []);
      }
    } catch (err) {
      setProducts([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.storePhone || data.storeAddress) {
          setStoreSettings(prev => ({
            ...prev,
            ...data
          }));
        }
      }
    } catch (err) {}
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('mashi_admin_user', JSON.stringify(user));
    setIsAdminView(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mashi_admin_user');
    setIsAdminView(false);
  };

  const handleDirectTelegramOrder = (product, quantity = 1) => {
    setCheckoutItems([{ ...product, quantity }]);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        storeSettings={storeSettings}
        t={t}
      />

      <div className="app-container" style={{ flex: 1 }}>
        {isAdminView && currentUser ? (
          <AdminDashboard 
            products={products}
            setProducts={setProducts}
            initialOrders={[]}
            storeSettings={storeSettings}
            t={t}
          />
        ) : (
          <>
            <HeroBanner storeSettings={storeSettings} t={t} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {t.productsHeader}
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {filteredProducts.length} {t.itemsFound}
              </span>
            </div>

            <CategoryFilter 
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              t={t}
            />

            {filteredProducts.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginTop: '16px' }}>
                <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '12px', color: 'var(--accent-gold)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.noProducts}</h3>
                <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>{t.noProductsDesc}</p>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onSelectProduct={setSelectedProduct}
                    t={t}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer storeSettings={storeSettings} t={t} />

      {/* Modals */}
      <AdminAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        t={t}
      />

      <ProductModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onDirectTelegramOrder={handleDirectTelegramOrder}
        storeSettings={storeSettings}
        t={t}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={checkoutItems}
        onOrderSuccess={() => {
          setCheckoutItems([]);
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        storeSettings={storeSettings}
        t={t}
      />

      <TelegramSimulator 
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
