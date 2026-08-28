import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, Send, AlertCircle, LogIn } from 'lucide-react';

export default function AdminAuthModal({ isOpen, onClose, onAuthSuccess, t }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Form fields initialized completely empty (No hardcoded credentials!)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg('');
    setLoading(true);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register' 
      ? { name, phone, telegramUsername, email, password } 
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        onAuthSuccess(data.user || { email, name: name || 'User', role: 'admin' });
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setTelegramUsername('');
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg('Connection error. Please check server or network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '28px' }}>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 184, 148, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {mode === 'register' ? t.authRegisterTitle : t.authLoginTitle}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.storeName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">{t.fullName}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.phoneNumber}</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.telegramUsername}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.telegramPlaceholder}
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">{t.emailLabel}</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="user@mashigebeya.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.passwordLabel}</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            <LogIn size={16} />
            <span>{loading ? 'Processing...' : (mode === 'register' ? t.registerSubmit : t.loginSubmit)}</span>
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg('');
              setEmail('');
              setPassword('');
            }}
          >
            {mode === 'login' ? t.switchRegister : t.switchLogin}
          </button>
        </div>
      </div>
    </div>
  );
}
