import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Send, ShieldCheck, Lock, AlertTriangle, Key, Phone, MapPin } from 'lucide-react';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onOrderSuccess, 
  currentUser,
  onOpenAuthModal,
  t 
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: 'ጀሞ 1 ብሎክ 157, አዲስ አበባ',
    notes: ''
  });

  const [step, setStep] = useState('form'); // 'form', 'confirm', 'success'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleteData, setOrderCompleteData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        customerName: currentUser.name || prev.customerName,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) {
      alert('እባክዎን ስምዎን እና ስልክ ቁጥርዎን ያስገቡ');
      return;
    }
    setStep('confirm');
  };

  const handleFinalConfirmOrder = async () => {
    setIsSubmitting(true);

    const fullOrderPayload = {
      ...formData,
      customerEmail: currentUser?.email || '',
      telegramUsername: currentUser?.telegramUsername || '',
      paymentMethod: 'Direct Call / Order Dispatch',
      items: cartItems
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOrderPayload)
      });

      const data = await response.json();
      if (response.ok) {
        setOrderCompleteData(data.order);
        setStep('success');
        onOrderSuccess();
      } else {
        alert(data.error || 'Failed to submit order');
        setStep('form');
      }
    } catch (err) {
      const mockOrder = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        customerName: formData.customerName,
        phone: formData.phone,
        totalAmount,
        date: new Date().toISOString()
      };
      setOrderCompleteData(mockOrder);
      setStep('success');
      onOrderSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* STEP 0: Mandatory Authentication Check */}
        {!currentUser ? (
          <div style={{ textAlign: 'center', padding: '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 184, 148, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={30} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t.requireLoginTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '420px' }}>
              {t.requireLoginDesc}
            </p>

            <button 
              className="btn btn-primary"
              style={{ padding: '12px 28px', marginTop: '8px' }}
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
            >
              <Key size={16} />
              <span>Log In / Register</span>
            </button>
          </div>
        ) : step === 'success' ? (
          /* STEP SUCCESS */
          <div style={{ textAlign: 'center', padding: '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {t.orderSuccessTitle}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {t.orderSuccessMsg.replace('{id}', orderCompleteData?.id || '')}
            </p>

            <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'left', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Summary:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '4px 0' }}>
                {totalAmount.toLocaleString()} ETB
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                📍 አድራሻ፡ ጀሞ 1 ብሎክ 157 | 📞 ስልክ፡ 0911305530
              </div>
            </div>

            <a 
              href="tel:0911305530" 
              className="btn btn-secondary"
              style={{ width: '100%', background: '#008968', color: '#fff', padding: '12px' }}
            >
              <Phone size={16} />
              <span>ለበለጠ መረጃ አሁኑኑ ይደውሉ (0911305530)</span>
            </a>

            <button 
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                setStep('form');
                setOrderCompleteData(null);
                onClose();
              }}
            >
              OK
            </button>
          </div>
        ) : step === 'confirm' ? (
          /* STEP CONFIRMATION DIALOG */
          <div style={{ textAlign: 'center', padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t.confirmOrderTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t.confirmOrderMsg}
            </p>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'left', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
              <div><b>Customer:</b> {formData.customerName} ({formData.phone})</div>
              <div><b>Account Email:</b> {currentUser?.email}</div>
              {currentUser?.telegramUsername && <div><b>Telegram:</b> {currentUser.telegramUsername}</div>}
              <div><b>Items Count:</b> {cartItems.length} items</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '6px' }}>
                Total: {totalAmount.toLocaleString()} ETB
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
              <button 
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setStep('form')}
              >
                {t.confirmNo}
              </button>

              <button 
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={isSubmitting}
                onClick={handleFinalConfirmOrder}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Submitting...' : t.confirmYes}</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 1: Form */
          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={24} style={{ color: 'var(--accent-gold)' }} />
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t.checkoutTitle}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.storeName}</div>
              </div>
            </div>

            {/* Direct Phone & Address Info */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
                <Phone size={15} style={{ color: 'var(--accent-gold)' }} />
                <span>ለቀጥታ ትዕዛዝና ጥያቄ፡ <a href="tel:0911305530" style={{ color: 'var(--accent-gold)' }}>0911305530</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <MapPin size={15} style={{ color: 'var(--accent-gold)' }} />
                <span>አድራሻ፡ ጀሞ 1 ብሎክ 157</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.fullName}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t.namePlaceholder}
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.phoneNumber}</label>
              <input
                type="tel"
                className="form-input"
                placeholder={t.phonePlaceholder}
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.deliveryAddress}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t.addressPlaceholder}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder={t.notesPlaceholder}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', margin: '16px 0', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.totalPrice}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {totalAmount.toLocaleString()} ETB
              </span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              <Send size={18} />
              <span>{t.proceedCheckout}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
