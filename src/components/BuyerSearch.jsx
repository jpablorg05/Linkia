import React, { useState } from 'react';
import { Search, MapPin, Zap } from 'lucide-react';

export default function BuyerSearch({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', paddingTop: '2rem' }}>
      
      <div style={{ marginBottom: '2rem', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          No busques más. <br/>
          <span className="text-gradient">Deja que te encuentren.</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.6' }}>
          Dinos qué pieza, herramienta o servicio necesitas. Enviaremos una alerta a los proveedores disponibles y recibirás ofertas en minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ width: '100%', maxWidth: '700px', display: 'flex', padding: '0.5rem', borderRadius: '9999px', alignItems: 'center', gap: '0.5rem' }}>
        
        <div style={{ padding: '0 1rem', color: 'var(--text-muted)' }}>
          <Search size={24} />
        </div>
        
        <input 
          type="text" 
          placeholder="Ej: Alternador para Toyota Corolla 2018..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', outline: 'none', padding: '1rem 0' }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem', color: 'var(--text-muted)' }}>
          <MapPin size={20} style={{ marginRight: '0.5rem' }}/>
          <span style={{ fontSize: '0.9rem' }}>Mi Zona</span>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', marginLeft: '1rem' }}>
          <Zap size={20} /> Solicitar
        </button>

      </form>

      {/* Suggested Searches */}
      <div style={{ marginTop: '3rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>Búsquedas populares</p>
        <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          {['Baterías 12V', 'Pastillas de freno', 'Neumáticos 205/55R16', 'Llave de impacto', 'Aceite sintético'].map((item) => (
            <button 
              key={item} 
              onClick={() => onSearch(item)}
              className="glass-panel" 
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '9999px', color: 'var(--text-main)', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
