import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Search, MessageSquare, Star, ArrowUpRight, Filter, Shield, Download, User, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModuleHero from '../components/ModuleHero';

export default function CrmPage() {
  const { crmClients, user } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabel, setFilterLabel] = useState('all');
  const [viewingClient, setViewingClient] = useState(null);

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
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      <ModuleHero eyebrow="Empresa" title="Mis Clientes (CRM)" subtitle="Gestiona y fideliza a los compradores de tu tienda." iconName="crm" fullBleed={true}>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.7rem 1.1rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Ingresos Totales (CRM)</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#34d399' }}>
              ${crmClients.reduce((sum, client) => sum + client.totalSpent, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </ModuleHero>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 2rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%', height: 'calc(100vh - 200px)' }}>
        
        {/* TOP BAR */}
        <div className="card-panel" style={{ padding: '1.2rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { id: 'all', label: 'Todos los clientes' },
              { id: 'vip', label: '⭐ VIP' },
              { id: 'recurring', label: 'Recurrentes' },
              { id: 'new', label: 'Nuevos' }
            ].map(f => {
              const isActive = filterLabel === f.id;
              return (
                <button 
                  key={f.id}
                  onClick={() => { setFilterLabel(f.id); setViewingClient(null); }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '24px', border: 'none',
                    background: isActive ? 'var(--text-main)' : 'var(--bg-main)',
                    color: isActive ? 'var(--bg-panel)' : 'var(--text-muted)',
                    fontWeight: isActive ? '700' : '600', fontSize: '0.8rem',
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: '0.6rem', background: 'var(--bg-main)', borderRadius: '12px', padding: '0.6rem 1rem', alignItems: 'center', border: '1px solid var(--border-color)', minWidth: '280px', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, taller o contacto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* GRID DE CLIENTES */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredClients.length === 0 ? (
            <div className="card-panel flex-center" style={{ flexDirection: 'column', gap: '1rem', padding: '4rem 2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}><Users size={40} /></div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>No se encontraron clientes</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignContent: 'start', paddingBottom: '2rem' }}>
              {filteredClients.map(client => (
                <div 
                  key={client.id} 
                  className="card-panel" 
                  onClick={() => setViewingClient(client)}
                  style={{ 
                    padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem', 
                    border: '1px solid var(--border-color)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--border-color)', fontSize: '1.2rem' }}>
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>{client.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{client.id}</div>
                      </div>
                    </div>
                    {getLabelBadge(client.label)}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '0.8rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> {client.contact}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {client.phone}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Comprado</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>${client.totalSpent.toLocaleString()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Última Compra</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{client.lastPurchase}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SLIDE-OVER MODAL PARA DETALLES DEL CLIENTE */}
        {viewingClient && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} onClick={() => setViewingClient(null)}>
            <div className="card-panel animate-slide-left" style={{ width: '100%', maxWidth: '500px', height: '100%', margin: 0, borderRadius: '24px 0 0 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={e => e.stopPropagation()}>
              
              {/* Header Slide-Over */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--border-color)', fontSize: '2rem' }}>
                    {viewingClient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.3rem 0' }}>{viewingClient.name}</h2>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{viewingClient.id}</span>
                      {getLabelBadge(viewingClient.label)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewingClient(null)} style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.2rem', transition: 'background 0.2s' }}>✕</button>
              </div>

              {/* Body */}
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
                
                {/* Info Contacto */}
                <div>
                  <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 'bold' }}>Información de Contacto</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-main)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <User size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Persona de Contacto</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-main)' }}>{viewingClient.contact}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <Mail size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correo Electrónico</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-main)' }}>{viewingClient.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <Phone size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teléfono</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-main)' }}>{viewingClient.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div>
                  <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 'bold' }}>Historial de Compras</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-main)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <DollarSign size={20} color="#10b981" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Total Gastado</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>${viewingClient.totalSpent.toLocaleString()}</span>
                    </div>
                    <div style={{ background: 'var(--bg-main)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <Calendar size={20} color="var(--primary)" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Última Compra</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{viewingClient.lastPurchase}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)', display: 'flex', gap: '1rem' }}>
                <button onClick={() => navigate(`/chat/${viewingClient.id}`)} className="btn-primary" style={{ flex: 1, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', borderRadius: '10px' }}>
                  <MessageSquare size={18} /> Iniciar Chat
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
