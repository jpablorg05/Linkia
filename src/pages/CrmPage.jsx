import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Search, MessageSquare, Star, ArrowUpRight, Filter, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CrmPage() {
  const { crmClients, user } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabel, setFilterLabel] = useState('all');

  // Acceso solo para Admin o Ventas
  if (user?.subRole === 'logistics') {
    return (
      <div className="flex-center" style={{ height: '50vh', flexDirection: 'column', color: 'var(--text-muted)' }}>
        <Shield size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h2>Acceso Denegado</h2>
        <p>El personal de logística no tiene acceso al directorio de clientes.</p>
      </div>
    );
  }

  const getLabelBadge = (label) => {
    switch(label) {
      case 'vip': return <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Star size={12} fill="#f59e0b" /> VIP</span>;
      case 'recurring': return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Recurrente</span>;
      case 'new': return <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Nuevo</span>;
      default: return null;
    }
  };

  const filteredClients = crmClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLabel === 'all' || client.label === filterLabel;
    return matchesSearch && matchesFilter;
  });
  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users color="var(--primary)" size={24} /> Mis Clientes (CRM)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>Gestiona y fideliza a los compradores de tu tienda.</p>
        </div>
        
        <div style={{ background: 'var(--bg-panel)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Ingresos Totales (CRM)</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--success)' }}>
            ${crmClients.reduce((sum, client) => sum + client.totalSpent, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', gap: '0.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.5rem 0.8rem', alignItems: 'center' }}>
          <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por taller, cliente o contacto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 0.8rem', height: '38px' }}>
          <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>⚡</span>
          <select 
            value={filterLabel} 
            onChange={(e) => setFilterLabel(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="all">Todos los clientes</option>
            <option value="vip">Solo VIP</option>
            <option value="recurring">Recurrentes</option>
            <option value="new">Nuevos</option>
          </select>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-panel)', overflow: 'hidden' }}>
        {/* Header de la lista */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 120px', padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <div>Cliente / Taller</div>
          <div>Contacto</div>
          <div>Categoría</div>
          <div>Total Comprado</div>
          <div>Última Compra</div>
          <div style={{ textAlign: 'right' }}>Acciones</div>
        </div>

        {/* Filas */}
        {filteredClients.map(client => (
          <div key={client.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 120px', padding: '1rem 1.2rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            
            {/* Cliente */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                {client.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.88rem' }}>{client.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{client.id}</div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <div style={{ color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: '500' }}>{client.contact}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.phone}</div>
            </div>

            {/* Categoría */}
            <div>{getLabelBadge(client.label)}</div>

            {/* Total */}
            <div>
              <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1rem' }}>${client.totalSpent.toLocaleString()}</div>
            </div>

            {/* Última Compra */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.lastPurchase}</div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
              <button onClick={() => navigate(`/chat/${client.id}`)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', borderRadius: '6px' }}>
                <MessageSquare size={14} /> Chat
              </button>
              <button className="btn-primary" style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', width: '28px', height: '28px' }}>
                <ArrowUpRight size={14} />
              </button>
            </div>

          </div>
        ))}

        {filteredClients.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No se encontraron clientes con esos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
