import React from 'react';
import { Eye, Phone } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  t 
}) {
  const mainImage = product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="product-card" onClick={() => onSelectProduct(product)} style={{ cursor: 'pointer' }}>
      <div className="product-image-wrap">
        <img 
          src={mainImage} 
          alt={product.title} 
          className="product-image"
          loading="lazy"
        />
        <div className="product-badge">
          {product.category}
        </div>
      </div>

      <div className="product-body">
        <div className="product-category">{product.category}</div>
        <h3 className="product-title">{product.title}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        <div className="product-footer">
          <div className="product-price">
            {product.price.toLocaleString()} <span>ETB</span>
          </div>

          <button 
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
          >
            <Eye size={14} />
            <span>ተመልከት</span>
          </button>
        </div>
      </div>
    </div>
  );
}
