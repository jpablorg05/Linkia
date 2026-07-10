import React, { useState } from 'react';
import { Target, Send, CheckCircle } from 'lucide-react';

export default function SellerDashboard() {
  const [leads, setLeads] = useState([
    { id: 101, user: 'Carlos M.', item: 'Batería 12V 700 Amp', time: 'Hace 2 min', status: 'new' },
    { id: 102, user: 'Ana R.', item: 'Pastillas de freno delanteras', time: 'Hace 5 min', status: 'new' },
    { id: 103, user: 'Taller XYZ', item: 'Filtro de aceite', time: 'Hace 1 hora', status: 'replied' },
  ]);

  const [selectedLead, setSelectedLead] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');

  const handleSendQuote = (e) => {
    e.preventDefault();
    if (!quotePrice) return;

    setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: 'replied' } : l));
    setSelectedLead(null);
    setQuotePrice('');
    setQuoteMessage('');
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', gap: '2rem' }}>
      
      {/* Leads List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target color="var(--primary)" /> Solicitudes en tu zona
        </h2>

        {leads.map(lead => (
          <div 
            key={lead.id} 
            className="glass-panel"
            style={{ 
              padding: '1.5rem', 
              cursor: 'pointer', 
              border: selectedLead?.id === lead.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              transition: 'var(--transition-smooth)'
            }}
            onClick={() => lead.status === 'new' && setSelectedLead(lead)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{lead.item}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lead.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprador: {lead.user}</span>
              {lead.status === 'new' ? (
                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>NUEVO</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent)', fontSize: '0.8rem' }}>
                  <CheckCircle size={14} /> Oferta enviada
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quote Form Panel */}
      <div style={{ flex: 1 }}>
        {selectedLead ? (
          <div className="glass-panel animate-slide-up" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Enviar cotización</h3>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Solicitud:</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedLead.item}</p>
            </div>

            <form onSubmit={handleSendQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Precio Ofrecido ($)</label>
                <input 
                  type="number" 
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="Ej: 45.00"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem', outline: 'none' }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mensaje / Detalles (Opcional)</label>
                <textarea 
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder="Ej: Marca Bosch, nueva en caja."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem', minHeight: '100px', resize: 'vertical', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                <Send size={18} /> Enviar Oferta
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-panel flex-center" style={{ height: '300px', flexDirection: 'column', color: 'var(--text-muted)', position: 'sticky', top: '100px' }}>
            <Target size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Selecciona una solicitud nueva para responder</p>
          </div>
        )}
      </div>

    </div>
  );
}
