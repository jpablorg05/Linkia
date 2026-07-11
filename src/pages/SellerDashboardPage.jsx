import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Zap, TrendingUp, DollarSign, Package, Users, Sparkles, ArrowUpRight, Circle, ChevronRight, Clock, BarChart2, X, ImagePlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModuleHero from '../components/ModuleHero';

// Elimina oportunidades duplicadas: una sola por comprador+producto mientras siga "activa" (new).
const dedupeLeads = (leads) => {
  const seen = new Set();
  return leads.filter(l => {
    const key = l.status === 'new' ? `${l.buyerId}|${l.item}` : `id|${l.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function SellerDashboardPage() {
  const { sellerLeads, socket, user, crmClients, buyerOrders, setCatalogProducts } = useAppContext();
  const [leads, setLeads] = useState(sellerLeads);
  const [selectedLead, setSelectedLead] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteCondition, setQuoteCondition] = useState('Nuevo');
  const [quoteDelivery, setQuoteDelivery] = useState('Mismo día');
  const [now, setNow] = useState(new Date());
  const [chartFilter, setChartFilter] = useState('7d');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '10', discount: '0', category: 'Tecnología y Móviles', description: '' });
  const [productImages, setProductImages] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Sincronizar nuevas oportunidades en tiempo real desde el Context
    setLeads(prev => {
      const newLeads = sellerLeads.filter(sl => !prev.find(pl => pl.id === sl.id));
      if (newLeads.length > 0) {
        return [...newLeads, ...prev];
      }
      return prev;
    });
  }, [sellerLeads]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingTime = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - now;
    if (diff <= 0) return 'Expirado';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const handleSmartQuote = (e) => {
    e.preventDefault();
    setQuotePrice('850.00');
    setQuoteMessage('Disponible en stock, nuevo sellado. Envío inmediato al confirmar.');
  };

  const handleSendQuote = (e) => {
    e.preventDefault();
    if (!quotePrice || !selectedLead.buyerId) {
      alert("No se puede enviar oferta porque la solicitud no tiene un comprador válido.");
      return;
    }

    const offerData = JSON.stringify({ 
      price: parseFloat(quotePrice), 
      condition: quoteCondition,
      delivery: quoteDelivery,
      description: selectedLead.item + (quoteMessage ? ` - ${quoteMessage}` : '') 
    });
    
    const newMsg = {
      text: `[OFERTA] ${offerData}`,
      senderId: user.id,
      receiverId: selectedLead.buyerId
    };

    if (socket) {
      socket.emit('send_message', newMsg);
    }

    setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: 'replied' } : l));
    navigate(`/chat/${selectedLead.buyerId}`);
  };

  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Mock KPIs
  const totalSales = 12450;
  const pendingOrders = buyerOrders?.filter(o => o.status === 'pending_verification' || o.status === 'Pagado').length || 3;
  const storefrontViews = 1420;
  const conversionRate = 68;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      <ModuleHero
        eyebrow="Panel de empresa"
        title={`${greeting()}, ${user.name?.split(' ')[0]}`}
        subtitle={`Resumen de actividad · ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        iconName="default"
        fullBleed={true}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isStoreOpen ? '#34d399' : 'rgba(255,255,255,0.6)' }}>
              {isStoreOpen ? 'Tienda Abierta' : 'Tienda Cerrada'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
              {isStoreOpen ? 'Recibiendo solicitudes' : 'Pausado'}
            </span>
          </div>
          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            style={{
              width: '42px', height: '22px', borderRadius: '11px',
              background: isStoreOpen ? '#34d399' : 'rgba(255,255,255,0.25)',
              position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '2px', left: isStoreOpen ? '22px' : '2px',
              transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}></div>
          </button>
        </div>
      </ModuleHero>

      <div style={{ padding: '0 2rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* QUICK ACTIONS — tarjetas solapadas sobre el hero */}
      <div className="hero-svc-cards" style={{ marginTop: '-3.2rem', position: 'relative', zIndex: 5 }}>
        {[
          { title: 'Publicar Producto', desc: 'Sube un producto a tu catálogo en segundos.', icon: <Package size={22} />, hi: true, action: () => setShowPublishModal(true) },
          { title: 'Gestionar Envíos', desc: 'Revisa y despacha tus pedidos activos.', icon: <Send size={22} />, action: () => navigate('/orders') },
          { title: 'Centro de Mensajes', desc: 'Responde a tus clientes al instante.', icon: <Circle size={22} />, action: () => navigate('/inbox') },
          { title: 'Retiros del Día', desc: 'Pagos y comprobantes por verificar.', icon: <Clock size={22} />, action: () => navigate('/orders') }
        ].map((a, idx) => (
          <div key={idx} onClick={a.action} className={`hero-svc-card${a.hi ? ' hero-svc-hi' : ''}`}>
            <div className="hsc-ic" style={{ color: a.hi ? '#fff' : 'var(--primary)', background: a.hi ? 'rgba(255,255,255,0.18)' : 'rgba(14,165,233,0.1)' }}>{a.icon}</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0.8rem 0 0.3rem', color: a.hi ? '#fff' : 'var(--text-main)' }}>{a.title}</h3>
            <p style={{ fontSize: '0.82rem', margin: 0, lineHeight: 1.45, color: a.hi ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}>{a.desc}</p>
            <span style={{ marginTop: 'auto', paddingTop: '0.9rem', fontSize: '0.8rem', fontWeight: '700', color: a.hi ? '#fff' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Abrir <ChevronRight size={14} />
            </span>
          </div>
        ))}
      </div>

      {/* METRICS — BENTO GRID */}
      <div className="bento-grid">

        {/* Ingresos — ancho, con sparkline */}
        <div className="card-panel bento-span2" style={{ padding: '1.3rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>
            <DollarSign size={14} /> Ingresos del mes
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>${totalSales.toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '100px' }}>▲ 12%</span>
          </div>
          <svg viewBox="0 0 320 46" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '46px', marginTop: '0.9rem' }}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--primary)" stopOpacity="0.45" />
                <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,36 L45,32 L90,34 L130,23 L175,27 L215,15 L260,19 L320,7" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,36 L45,32 L90,34 L130,23 L175,27 L215,15 L260,19 L320,7 L320,46 L0,46 Z" fill="url(#incGrad)" />
            <circle cx="320" cy="7" r="3.5" fill="var(--accent)" />
          </svg>
        </div>

        {/* Insight IA — ancho, destacado */}
        <div className="card-panel bento-span2" style={{ padding: '1.3rem 1.5rem', background: 'linear-gradient(135deg, rgba(14,165,233,0.14), rgba(45,212,191,0.08)), var(--bg-panel)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>
            <Sparkles size={14} /> Insight IA
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: '600', margin: '0.6rem 0 0', lineHeight: 1.4 }}>
            {crmClients?.[0]?.name || 'Juan Pérez'} no compra hace 2 días. Envíale una oferta para recuperarlo.
          </p>
          <button onClick={() => navigate('/crm')} style={{ marginTop: 'auto', alignSelf: 'flex-start', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', background: 'rgba(14,165,233,0.12)', border: 'none', padding: '5px 12px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Send size={12} /> Enviar oferta −10%
          </button>
        </div>

        {/* Pendientes */}
        <div className="card-panel" onClick={() => navigate('/orders')} style={{ padding: '1.2rem 1.4rem', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>
            <Package size={14} /> Pendientes
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-1px', marginTop: '0.4rem', fontVariantNumeric: 'tabular-nums' }}>{pendingOrders}</div>
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '2px 8px', borderRadius: '100px' }}>Por verificar</span>
        </div>

        {/* Conversión */}
        <div className="card-panel" style={{ padding: '1.2rem 1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>
            <TrendingUp size={14} /> Conversión
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-1px', marginTop: '0.4rem', fontVariantNumeric: 'tabular-nums' }}>{conversionRate}%</div>
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '100px' }}>▲ 3%</span>
        </div>

        {/* Visitas */}
        <div className="card-panel" style={{ padding: '1.2rem 1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>
            <Users size={14} /> Visitas
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-1px', marginTop: '0.4rem', fontVariantNumeric: 'tabular-nums' }}>{storefrontViews.toLocaleString()}</div>
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '100px' }}>▲ 45%</span>
        </div>

        {/* Mi Vitrina — acceso rápido */}
        <div className="card-panel" onClick={() => navigate('/storefront')} style={{ padding: '1.2rem 1.4rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.4rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={18} />
          </div>
          <span style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)' }}>Mi Vitrina</span>
        </div>

      </div>

      {/* VISUAL CHARTS (DYNAMIC) */}
      <div className="glass-soft" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <BarChart2 size={16} color="var(--primary)" /> Rendimiento de la tienda
          </h3>
          <select 
            value={chartFilter} 
            onChange={(e) => setChartFilter(e.target.value)} 
            style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.3rem 0.6rem', fontSize: '0.78rem', outline: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="1m">Este mes</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', height: '140px', marginTop: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed var(--border-color)' }}>
          {(chartFilter === '7d' ? [40, 65, 45, 80, 55, 90, 75] : [30, 45, 20, 60, 50, 40, 80, 65, 75, 55, 95, 85]).map((height, idx) => {
            const labels = chartFilter === '7d' 
              ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
              : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const isHighest = height >= 90;
            return (
              <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '100%', maxWidth: '26px', height: `${height}%`, background: isHighest ? 'linear-gradient(180deg, var(--accent), var(--primary))' : 'rgba(14, 165, 233, 0.15)', borderRadius: '7px 7px 3px 3px', boxShadow: isHighest ? '0 4px 14px -2px rgba(14,165,233,0.5)' : 'none', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{labels[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.2rem' }}>
        
        {/* RADAR - LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 2s infinite' }}></div>
              Oportunidades de Venta en Vivo
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{dedupeLeads(leads).filter(l => l.status === 'new').length} activas</span>
          </div>

          <div className="glass-soft dash-leads-panel" style={{ display: 'flex', overflow: 'hidden', minHeight: '380px' }}>

            {/* Lead List */}
            <div className="dash-leads-list" style={{ width: '260px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(0,0,0,0.02)' }}>
              {dedupeLeads(leads).map(lead => {
                const isSelected = selectedLead?.id === lead.id;
                const isExpired = getRemainingTime(lead.expiresAt) === 'Expirado';
                return (
                  <div 
                    key={lead.id} 
                    style={{ 
                      padding: '1rem', 
                      cursor: lead.status === 'new' ? 'pointer' : 'default',
                      background: isSelected ? 'var(--bg-main)' : 'var(--bg-panel)',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onClick={() => lead.status === 'new' && setSelectedLead(lead)}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.4rem' }}>{lead.item}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                          {lead.user.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lead.zone || 'Global'}</span>
                      </div>

                      {lead.status === 'replied' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#10b981', fontSize: '0.68rem', fontWeight: 'bold' }}>
                          <CheckCircle size={10} /> Respondido
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: 'bold', color: isExpired ? '#ef4444' : '#f59e0b' }}>
                          {getRemainingTime(lead.expiresAt) && <Clock size={10} />}
                          {getRemainingTime(lead.expiresAt) || 'Activo'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quote Panel */}
            <div style={{ flex: 1, padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
              {!selectedLead ? (
                <div className="flex-center" style={{ flexDirection: 'column', height: '100%', color: 'var(--text-muted)', textAlign: 'center', gap: '0.5rem' }}>
                  <Zap size={24} style={{ opacity: 0.2 }} />
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>Selecciona una solicitud para enviar cotización instantánea</p>
                </div>
              ) : selectedLead.status === 'replied' ? (
                <div className="flex-center" style={{ flexDirection: 'column', height: '100%', gap: '0.8rem', textAlign: 'center' }}>
                  <CheckCircle size={32} color="#10b981" />
                  <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>¡Cotización Enviada!</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>El comprador ya recibió tu oferta y puede escribirte en el chat.</p>
                  <button onClick={() => navigate(`/chat/${selectedLead.buyerId}`)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>Abrir Conversación →</button>
                </div>
              ) : (
                <form onSubmit={handleSendQuote} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
                  
                  <div style={{ padding: '0.8rem 1rem', background: 'var(--bg-main)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Artículo solicitado</span>
                      <p style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0.15rem 0 0 0' }}>{selectedLead.item}</p>
                    </div>
                    {selectedLead.expiresAt && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Expiración</span>
                        <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: getRemainingTime(selectedLead.expiresAt) === 'Expirado' ? '#ef4444' : '#f59e0b', marginTop: '0.15rem' }}>
                          {getRemainingTime(selectedLead.expiresAt)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Precio de Venta (USD)</label>
                      <button type="button" onClick={handleSmartQuote} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Sparkles size={12} /> Auto-completar IA
                      </button>
                    </div>
                    <input 
                      type="number" 
                      value={quotePrice} 
                      onChange={e => setQuotePrice(e.target.value)} 
                      placeholder="0.00" 
                      required 
                      disabled={selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Estado</label>
                      <select value={quoteCondition} onChange={e => setQuoteCondition(e.target.value)} disabled={selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.8rem' }}>
                        <option value="Nuevo">Nuevo</option>
                        <option value="Usado">Usado</option>
                        <option value="Reacondicionado">Reacondicionado</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Disponibilidad</label>
                      <select value={quoteDelivery} onChange={e => setQuoteDelivery(e.target.value)} disabled={selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.8rem' }}>
                        <option value="Mismo día">Mismo día</option>
                        <option value="1 a 2 días">1 a 2 días</option>
                        <option value="3 a 5 días">3 a 5 días</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Nota para el comprador</label>
                    <textarea 
                      value={quoteMessage} 
                      onChange={e => setQuoteMessage(e.target.value)}
                      placeholder="Agrega una nota, detalles de envío, etc..." 
                      rows={2}
                      disabled={selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', resize: 'none', fontSize: '0.85rem', outline: 'none', flex: 1 }}
                    />
                  </div>
                  
                  <button type="submit" disabled={selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now} style={{ padding: '0.7rem', fontSize: '0.85rem', fontWeight: 'bold', background: selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now ? 'var(--border-color)' : 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: '8px', cursor: selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', transition: 'opacity 0.2s' }}>
                    {selectedLead.expiresAt && new Date(selectedLead.expiresAt) <= now ? 'Cotización Expirada' : 'Enviar Oferta Directa'} <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR - RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Pending */}
          {pendingOrders > 0 && (
            <div
              onClick={() => navigate('/orders')}
              className="card-panel"
              style={{ padding: '1rem 1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: 'var(--text-main)' }}>{pendingOrders} por verificar</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comprobantes de pago</div>
                </div>
              </div>
              <ArrowUpRight size={14} color="var(--text-muted)" />
            </div>
          )}

          {/* Recent Clients */}
          <div className="glass-soft" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Clientes recientes</h3>
              <button onClick={() => navigate('/crm')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 'bold' }}>
                Ver todos <ChevronRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {crmClients.slice(0,3).map(client => (
                <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>
                      {client.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{client.lastPurchase}</div>
                    </div>
                  </div>
                  {client.label === 'vip' && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>VIP</span>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <button onClick={() => navigate('/catalog')} className="card-panel" style={{ padding: '0.8rem', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: '600' }}>
              Catálogo
            </button>
            <button onClick={() => navigate('/storefront')} className="card-panel" style={{ padding: '0.8rem', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: '600' }}>
              Mi Vitrina
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .bento-grid .bento-span2 { grid-column: span 2; }
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
          .bento-grid .bento-span2 { grid-column: span 2; }
        }
        @media (max-width: 520px) {
          .bento-grid { grid-template-columns: 1fr; }
          .bento-grid .bento-span2 { grid-column: span 1; }
        }
        /* Glass para paneles grandes (sin la elevación de .card-panel) */
        .glass-soft {
          background: var(--bg-panel);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-sm);
        }
        /* Tarjetas de servicio solapadas (estilo hero) */
        .hero-svc-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .hero-svc-card {
          background: var(--bg-panel);
          backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-color); border-radius: 16px;
          box-shadow: var(--shadow-md); padding: 1.3rem 1.2rem;
          display: flex; flex-direction: column; min-height: 180px; cursor: pointer;
          transition: var(--transition-smooth);
        }
        .hero-svc-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md), var(--shadow-glow); }
        .hero-svc-hi {
          background: linear-gradient(150deg, #00a3e0, #0079b0);
          border-color: transparent;
          box-shadow: 0 20px 40px -12px rgba(0,163,224,0.5);
        }
        .hsc-ic { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 950px) { .hero-svc-cards { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .hero-svc-cards { grid-template-columns: 1fr; } .hero-svc-card { min-height: 0; } }
        /* Responsive: apilar leads + sidebar y el panel de leads en móvil/tablet */
        @media (max-width: 860px) {
          .dash-main-grid { grid-template-columns: 1fr !important; }
          .dash-leads-panel { flex-direction: column !important; }
          .dash-leads-list {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-color) !important;
            max-height: 220px;
          }
        }
      `}</style>

      {/* MODAL CENTRADO PUBLICAR PRODUCTO */}
      {showPublishModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }} onClick={() => setShowPublishModal(false)}>
          <div className="card-panel animate-slide-up" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', margin: 0, borderRadius: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            
            {/* Header Modal Centrado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel)', position: 'sticky', top: 0, zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package color="var(--primary)" size={20} /> Publicar Producto
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>Añade un nuevo artículo a tu catálogo global</span>
              </div>
              <button onClick={() => setShowPublishModal(false)} style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.2rem', transition: 'background 0.2s' }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <form onSubmit={async (e) => {
                e.preventDefault();
                
                // Añadir al catálogo global
                const newProductEntry = {
                  name: newProduct.name,
                  desc: newProduct.description,
                  price: parseFloat(newProduct.price),
                  stock: parseInt(newProduct.stock) || 1,
                  discount: parseInt(newProduct.discount) || 0,
                  category: newProduct.category,
                  image: productImages.length > 0 ? productImages[0] : null,
                  images: productImages
                };
                
                try {
                  const res = await api.post('/products', newProductEntry);
                  setCatalogProducts(prev => [res.data, ...prev]);
                  setShowPublishModal(false);
                  alert(`¡El producto "${newProduct.name}" ha sido publicado con éxito en tu catálogo!`);
                  setNewProduct({ name: '', price: '', stock: '10', discount: '0', category: 'Tecnología y Móviles', description: '' });
                  setProductImages([]);
                  navigate('/catalog'); // Llevar al usuario al catálogo para que vea su producto
                } catch (err) {
                  alert('Error al publicar el producto en el servidor');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                
                {/* Image Upload */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Imágenes del Producto</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: '100%', minHeight: '100px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', background: 'var(--bg-main)', padding: '1rem', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={async (e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files);
                          const uploadedUrls = [];
                          for (const file of files) {
                            const formData = new FormData();
                            formData.append('image', file);
                            try {
                              const uploadRes = await api.post('/upload', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              uploadedUrls.push(`http://localhost:3000${uploadRes.data.url}`);
                            } catch (err) {
                              console.error("Error al subir archivo", err);
                              alert("Error al subir imagen al servidor");
                            }
                          }
                          setProductImages(prev => [...prev, ...uploadedUrls].slice(0, 5));
                        }
                      }} 
                    />
                    
                    {productImages.length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                        {productImages.map((src, i) => (
                          <div key={i} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div 
                              onClick={(e) => { e.stopPropagation(); setProductImages(prev => prev.filter((_, idx) => idx !== i)); }}
                              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '2px', color: 'white', display: 'flex', cursor: 'pointer' }}>
                              <X size={12} />
                            </div>
                          </div>
                        ))}
                        {productImages.length < 5 && (
                          <div style={{ width: '56px', height: '56px', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <ImagePlus size={18} opacity={0.5} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImagePlus size={20} />
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.2rem' }}>Añadir Fotos</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sube hasta 5 imágenes (PNG, JPG)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Nombre del producto</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ej: iPhone 15 Pro Max 256GB" style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Precio ($)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>$</span>
                      <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" style={{ padding: '0.8rem 1rem 0.8rem 2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem', width: '100%', fontWeight: 'bold' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Categoría</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%', cursor: 'pointer' }}>
                      <option value="Tecnología y Móviles">Tecnología y Móviles</option>
                      <option value="Ferretería y Construcción">Ferretería y Construcción</option>
                      <option value="Moda y Calzado">Moda y Calzado</option>
                      <option value="Hogar y Muebles">Hogar y Muebles</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Stock Inicial</label>
                    <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="10" style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>% Descuento</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input type="number" min="0" max="99" value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} placeholder="0" style={{ padding: '0.8rem 2rem 0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }} />
                      <span style={{ position: 'absolute', right: '1rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>%</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Descripción de la Oferta</label>
                  <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows="4" placeholder="Describe los detalles de tu producto..." style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '0.9rem', flex: 1 }}></textarea>
                </div>

                <div style={{ padding: '1rem 0 0 0', marginTop: 'auto' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '1rem', fontWeight: 'bold', width: '100%', borderRadius: '12px', boxShadow: '0 8px 20px -6px rgba(14, 165, 233, 0.4)' }}>
                    Publicar Producto Ahora
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      </div>

    </div>
  );
}
