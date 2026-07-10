import React from 'react';
import { ArrowLeft, Clock, ShieldCheck, MessageCircle, Star } from 'lucide-react';

export default function BuyerDashboard({ searchTerm, offers, onOpenChat, onBack }) {
  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Buscando: {searchTerm}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {offers.length === 0 ? (
              <>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-glow 1.5s infinite' }}></span>
                Transmitiendo a vendedores en tu zona...
              </>
            ) : (
              <>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                {offers.length} oferta(s) recibida(s)
              </>
            )}
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {offers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>Buscando coincidencias</h3>
            <p>Los vendedores están revisando su inventario. Recibirás ofertas pronto.</p>
          </div>
        )}

        {offers.map((offer, idx) => (
          <div key={offer.id} className="glass-panel animate-slide-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', animationDelay: `${idx * 0.1}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {offer.sellerName}
                  <ShieldCheck size={16} color="var(--accent)" />
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fbbf24', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  <Star size={14} fill="#fbbf24" /> {offer.rating}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>${offer.price}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', flex: 1 }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <strong>Condición:</strong> {offer.condition}
              </p>
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic' }}>"{offer.message}"</p>
            </div>

            <button onClick={() => onOpenChat(offer)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <MessageCircle size={18} /> Iniciar Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
