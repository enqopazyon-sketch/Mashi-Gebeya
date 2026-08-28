import React from 'react';
import { ShoppingBag, MapPin, Phone, ExternalLink } from 'lucide-react';

export default function Footer({ storeSettings, t }) {
  const address = storeSettings?.storeAddress || 'ጀሞ 1 ብሎክ 157';
  const phone = storeSettings?.storePhone || '0911305530';
  const mapUrl = storeSettings?.storeMapUrl || 'https://maps.app.goo.gl/qu1soae2p3Xeydiq9';

  return (
    <footer className="app-footer">
      <div className="app-container" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          
          {/* Col 1: Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="brand-logo">
              <div className="brand-icon">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span>{t.storeName}</span>
                <div style={{ fontSize: '0.65rem', color: '#00e676', fontWeight: 600, letterSpacing: '1px' }}>
                  MASHI GEBEYA
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#e6f9f0', lineHeight: 1.5 }}>
              {t.heroDesc}
            </p>
          </div>

          {/* Col 2: Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Contact & Location</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#e6f9f0' }}>
              <MapPin size={16} style={{ color: '#00e676' }} />
              <span>{address}</span>
              <a 
                href={mapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#00e676' }}
              >
                <ExternalLink size={13} />
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#e6f9f0' }}>
              <Phone size={16} style={{ color: '#00e676' }} />
              <span>{phone}</span>
            </div>
          </div>

          {/* Col 3: Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Categories</h4>
            <div style={{ fontSize: '0.85rem', color: '#e6f9f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span>⚽ Jerseys</span>
              <span>🧥 Tracksuits & Jackets</span>
              <span>👟 Shoes & Sneakers</span>
              <span>🧴 Perfumes & Hygiene</span>
              <span>🍫 Chocolates & Confectionery</span>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#a3e6ca' }}>
          © {new Date().getFullYear()} {t.storeName}. All rights reserved. | 📍 {address}
        </div>
      </div>
    </footer>
  );
}
