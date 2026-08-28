import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onUnlockSuccess, t }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (password.trim() === 'mashi2026' || password.trim() === '1234') {
      setErrorMsg('');
      setPassword('');
      onUnlockSuccess();
    } else {
      setErrorMsg(t.invalidPassword);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '28px' }}>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.12)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t.adminLockTitle}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.adminLockDesc}
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">{t.enterPassword}</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '16px' }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <Key size={16} />
            <span>{t.loginBtn}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
