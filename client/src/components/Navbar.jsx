import React, { useState } from 'react';
import { ShoppingBag, Search, Shield, Sun, Moon, Globe, LogOut, Key, Menu, X, Phone, MapPin } from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  isAdminView, 
  setIsAdminView,
  theme,
  toggleTheme,
  lang,
  setLang,
  currentUser,
  onLogout,
  onOpenAuthModal,
  storeSettings,
  t
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const phone = storeSettings?.storePhone || '0911305530';
  const address = storeSettings?.storeAddress || 'ጀሞ 1 ብሎክ 157';

  return (
    <>
      <header className="navbar">
        <div className="navbar-content">
          {/* Mobile Menu Button (Positioned Far Left on Mobile) */}
          <button 
            className="btn btn-secondary mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ padding: '8px 10px' }}
            title="Open Menu"
          >
            <Menu size={20} />
          </button>

          {/* Brand Logo (Left on PC, Center/Left on Mobile) */}
          <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setIsAdminView(false); }}>
            <div className="brand-icon">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span>{t.storeName}</span>
              <div style={{ fontSize: '0.65rem', color: '#ffb703', fontWeight: 600, letterSpacing: '1px' }}>
                MASHI GEBEYA
              </div>
            </div>
          </a>

          {/* Search Box (Centered on PC, Bottom Row on Mobile) */}
          {!isAdminView && (
            <div className="search-box">
              <Search className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons (Right Side) */}
          <div className="nav-actions">
            {/* Desktop Action Controls */}
            <div className="desktop-nav-controls">
              {/* Language Switcher */}
              <button 
                className="btn btn-secondary" 
                onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                title="Switch Language"
              >
                <Globe size={15} style={{ color: '#ffb703' }} />
                <span>{lang === 'en' ? '🇪🇹 AM' : '🇬🇧 EN'}</span>
              </button>

              {/* Sign In / Logged in Dashboard controls */}
              {currentUser ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className={`btn ${isAdminView ? 'btn-telegram' : 'btn-primary'}`}
                    onClick={() => setIsAdminView(!isAdminView)}
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    <Shield size={16} />
                    <span>{isAdminView ? t.backToStore : 'Control Center'}</span>
                  </button>

                  <button 
                    className="btn btn-danger"
                    onClick={onLogout}
                    style={{ padding: '8px 10px' }}
                    title={t.logout}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={onOpenAuthModal}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Key size={15} />
                  <span>{t.authLoginTitle}</span>
                </button>
              )}
            </div>

            {/* Theme Switcher (Visible on both PC & Mobile) */}
            <button 
              className="btn btn-secondary theme-toggle-btn" 
              onClick={toggleTheme}
              style={{ padding: '8px 10px' }}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} style={{ color: '#ffb703' }} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="modal-overlay" onClick={() => setIsMobileMenuOpen(false)} style={{ zIndex: 300, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: '85%', 
              maxWidth: '320px', 
              height: '100vh', 
              background: 'var(--bg-surface-elevated)', 
              boxShadow: '10px 0 30px rgba(0,0,0,0.3)', 
              padding: '24px 18px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px',
              animation: 'slideRight 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div className="brand-logo" style={{ color: 'var(--text-primary)' }}>
                <div className="brand-icon">
                  <ShoppingBag size={20} />
                </div>
                <span>{t.storeName}</span>
              </div>

              <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'static' }}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions List inside Mobile Drawer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setLang(lang === 'en' ? 'am' : 'en'); setIsMobileMenuOpen(false); }}
                style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                <Globe size={18} style={{ color: 'var(--accent-gold)' }} />
                <span>Language: <b>{lang === 'en' ? 'Amharic (አማርኛ)' : 'English (እንግሊዘኛ)'}</b></span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} style={{ color: 'var(--accent-gold)' }} />}
                <span>Theme: <b>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</b></span>
              </button>

              {currentUser ? (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={() => { setIsAdminView(true); setIsMobileMenuOpen(false); }}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <Shield size={18} />
                    <span>Control Center (Dashboard)</span>
                  </button>

                  <button 
                    className="btn btn-danger"
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <LogOut size={18} />
                    <span>{t.logout}</span>
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={() => { onOpenAuthModal(); setIsMobileMenuOpen(false); }}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Key size={18} />
                  <span>{t.authLoginTitle}</span>
                </button>
              )}
            </div>

            {/* Store Direct Info */}
            <div style={{ marginTop: 'auto', background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Phone size={15} style={{ color: 'var(--accent-gold)' }} />
                <span>{phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <MapPin size={15} style={{ color: 'var(--accent-gold)' }} />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
