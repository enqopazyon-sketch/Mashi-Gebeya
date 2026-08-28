import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onProceedCheckout,
  t
}) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: 0 }}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--accent-gold)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.cartTitle}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingBag size={56} style={{ opacity: 0.3, color: 'var(--accent-gold)' }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{t.emptyCart}</p>
            <p style={{ fontSize: '0.85rem' }}>{t.emptyCartDesc}</p>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} className="cart-item-img" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </h4>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                      {item.price.toLocaleString()} ETB
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '2px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '2px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        = {(item.price * item.quantity).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t.totalPrice}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {totalAmount.toLocaleString()} ETB
                </span>
              </div>

              <button 
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px' }}
                onClick={onProceedCheckout}
              >
                <span>{t.proceedCheckout}</span>
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={onClearCart}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center' }}
              >
                {t.clearCart}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
