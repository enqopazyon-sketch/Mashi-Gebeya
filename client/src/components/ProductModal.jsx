import React, { useState, useEffect } from 'react';
import { X, Send, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function ProductModal({ 
  product, 
  onClose, 
  onDirectTelegramOrder,
  storeSettings,
  t 
}) {
  const [activeImage, setActiveImage] = useState('');

  const phone = storeSettings?.storePhone || '0911305530';
  const address = storeSettings?.storeAddress || 'ጀሞ 1 ብሎክ 157';
  const mapUrl = storeSettings?.storeMapUrl || 'https://maps.app.goo.gl/qu1soae2p3Xeydiq9';

  useEffect(() => {
    if (product) {
      const initialImg = product.image || (product.images && product.images[0]) || '';
      setActiveImage(initialImg);
    }
  }, [product]);

  if (!product) return null;

  const imageList = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: 0, overflow: 'hidden' }}>
        <button className="close-btn" onClick={onClose} style={{ top: '12px', right: '12px', zIndex: 10 }}>
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Left: Product Image & Gallery Thumbnails */}
          <div style={{ padding: '16px', background: '#d4e7dd', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
            <div style={{ height: '280px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: '#ffffff' }}>
              <img 
                src={activeImage || imageList[0]} 
                alt={product.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="product-badge">
                {product.category}
              </div>
            </div>

            {/* Thumbnail Row for Multi-Image (2, 3+ photos) */}
            {imageList.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeImage === img ? '2px solid var(--accent-gold)' : '1px solid rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      opacity: activeImage === img ? 1 : 0.7,
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      padding: 0
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Call/Order Buttons */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div className="product-category">{product.category}</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', lineHeight: 1.3 }}>
                {product.title}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="product-price" style={{ fontSize: '1.5rem' }}>
                {product.price.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ETB</span>
            </div>

            {/* Store Location & Call Info Box */}
            <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
                <MapPin size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>{address}</span>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)' }}>
                  <ExternalLink size={13} />
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Phone size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>ለቀጥታ ትዕዛዝና ጥያቄ፡ <b>{phone}</b></span>
              </div>
            </div>

            {product.description && (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {product.description}
              </p>
            )}

            {/* Action Buttons: Direct Phone Call & Direct Telegram Order */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              {/* Direct Phone Call Button */}
              <a 
                href={`tel:${phone}`} 
                className="btn btn-secondary" 
                style={{ width: '100%', background: '#008968', color: '#fff', border: 'none', padding: '12px' }}
              >
                <Phone size={16} />
                <span>ቀጥታ ደውለው ለማዘዝ ({phone})</span>
              </a>

              <button 
                className="btn btn-primary" 
                onClick={() => onDirectTelegramOrder(product, 1)}
                style={{ width: '100%', padding: '12px' }}
              >
                <Send size={16} />
                <span>በቴሌግራም እዘዝ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
