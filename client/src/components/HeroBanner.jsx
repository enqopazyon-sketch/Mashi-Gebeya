import React from 'react';
import { MapPin, Phone, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function HeroBanner({ storeSettings, t }) {
  const address = storeSettings?.storeAddress || 'ጀሞ 1 ብሎክ 157';
  const phone = storeSettings?.storePhone || '0911305530';
  const mapUrl = storeSettings?.storeMapUrl || 'https://maps.app.goo.gl/qu1soae2p3Xeydiq9';

  return (
    <div className="hero-banner">
      <div className="hero-badge">
        <Sparkles size={14} />
        <span>{t.heroBadge}</span>
      </div>

      <h1 className="hero-title">
        {t.heroTitle}
      </h1>

      <p className="hero-subtitle">
        {t.heroDesc}
      </p>

      <div className="hero-meta">
        <div className="hero-meta-item">
          <MapPin size={16} style={{ color: 'var(--accent-gold)' }} />
          <span>{address}</span>
          <a 
            href={mapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-gold)', marginLeft: '6px', display: 'inline-flex', alignItems: 'center' }}
          >
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="hero-meta-item">
          <Phone size={16} style={{ color: 'var(--accent-gold)' }} />
          <span>{phone}</span>
        </div>

        <div className="hero-meta-item">
          <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
          <span>{t.fastDelivery}</span>
        </div>
      </div>
    </div>
  );
}
