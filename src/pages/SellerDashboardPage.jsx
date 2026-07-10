import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Zap, TrendingUp, DollarSign, Package, Users, Sparkles, ArrowUpRight, Circle, ChevronRight, Clock, BarChart2, X, ImagePlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px' }}>
      
      {/* HEADER WITH GREETING AND STATUS TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px', marginBottom: '0.2rem', margin: 0 }}>
            {greeting()}, {user.name?.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Resumen de actividad · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Store Status Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--bg-panel)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: isStoreOpen ? '#10b981' : 'var(--text-muted)' }}>
              {isStoreOpen ? 'Tienda Abierta' : 'Tienda Cerrada'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {isStoreOpen ? 'Recibiendo solicitudes' : 'Pausado'}
            </span>
          </div>
          <button 
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            style={{ 
              width: '42px', height: '22px', borderRadius: '11px', 
              background: isStoreOpen ? '#10b981' : 'var(--border-color)',
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
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Publicar Producto', icon: <Package size={18} />, color: 'var(--primary)', action: () => setShowPublishModal(true) },
          { label: 'Gestionar Envíos', icon: <Send size={18} />, color: '#10b981', action: () => navigate('/orders') },
          { label: 'Centro de Mensajes', icon: <Circle size={18} />, color: '#8b5cf6', action: () => navigate('/inbox') },
          { label: 'Retiros del Día', icon: <Clock size={18} />, color: '#f59e0b', action: () => navigate('/orders') }
        ].map((action, idx) => (
          <div key={idx} onClick={action.action} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}>
            <div style={{ background: `rgba(${action.color === 'var(--primary)' ? '14, 165, 233' : action.color === '#10b981' ? '16, 185, 129' : action.color === '#8b5cf6' ? '139, 92, 246' : '245, 158, 11'}, 0.08)`, color: action.color, padding: '0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {action.icon}
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{action.label}</span>
          </div>
        ))}
      </div>

      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Ingresos', value: `$${totalSales.toLocaleString()}`, change: '+12%', positive: true, icon: <DollarSign size={16} /> },
          { label: 'Pendientes', value: pendingOrders, change: null, positive: false, icon: <Package size={16} />, clickable: true, onClick: () => navigate('/orders') },
          { label: 'Conversión', value: `${conversionRate}%`, change: '+3%', positive: true, icon: <TrendingUp size={16} /> },
          { label: 'Visitas', value: storefrontViews.toLocaleString(), change: '+45%', positive: true, icon: <Users size={16} /> },
        ].map((metric, i) => (
          <div 
            key={i} 
            onClick={metric.onClick}
            style={{ 
              background: 'var(--bg-panel)', 
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.2rem 1.5rem', 
              cursor: metric.clickable ? 'pointer' : 'default',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if (metric.clickable) e.currentTarget.style.background = 'var(--bg-main)'; }}
            onMouseLeave={e => { if (metric.clickable) e.currentTarget.style.background = 'var(--bg-panel)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
              {metric.icon}
              <span>{metric.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '950', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{metric.value}</span>
              {metric.change && (
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: metric.positive ? '#10b981' : '#ef4444' }}>{metric.change}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* VISUAL CHARTS (DYNAMIC) */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', background: 'var(--bg-panel)', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
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
                <div style={{ width: '100%', maxWidth: '24px', height: `${height}%`, background: isHighest ? 'var(--primary)' : 'rgba(14, 165, 233, 0.15)', borderRadius: '4px 4px 0 0', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{labels[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.2rem' }}>
        
        {/* RADAR - LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 2s infinite' }}></div>
              Oportunidades de Venta en Vivo
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{leads.filter(l => l.status === 'new').length} activas</span>
          </div>

          <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', overflow: 'hidden', minHeight: '380px' }}>
            
            {/* Lead List */}
            <div style={{ width: '260px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(0,0,0,0.02)' }}>
              {leads.map(lead => {
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
              style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1rem 1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}
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
          <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Clientes recientes</h3>
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

            {/* AI Suggestion */}
            <div style={{ padding: '0.8rem', background: 'rgba(14, 165, 233, 0.04)', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.1)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <Sparkles size={14} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Juan Pérez</span> no ha comprado en 2 días. Considera enviarle una oferta personalizada.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <button onClick={() => navigate('/catalog')} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.8rem', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}>
              Catálogo
            </button>
            <button onClick={() => navigate('/storefront')} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.8rem', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}>
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
      `}</style>

      {/* MODAL PUBLICAR PRODUCTO */}
      {showPublishModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card-panel animate-slide-up" style={{ width: '90%', maxWidth: '480px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative' }}>
            <button onClick={() => setShowPublishModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
            
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package color="var(--primary)" size={20} /> Publicar Nuevo Producto
            </h2>

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
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Image Upload */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', minHeight: '80px', border: '1px dashed var(--border-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', padding: '0.8rem' }}>
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
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                    {productImages.map((src, i) => (
                      <div key={i} style={{ position: 'relative', width: '45px', height: '45px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div 
                          onClick={(e) => { e.stopPropagation(); setProductImages(prev => prev.filter((_, idx) => idx !== i)); }}
                          style={{ position: 'absolute', top: 1, right: 1, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '1px', color: 'white', display: 'flex', cursor: 'pointer' }}>
                          <X size={10} />
                        </div>
                      </div>
                    ))}
                    {productImages.length < 5 && (
                      <div style={{ width: '45px', height: '45px', borderRadius: '6px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImagePlus size={16} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                    <ImagePlus size={16} />
                    <span>Subir fotos (Máx. 5)</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Nombre del producto</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ej: iPhone 15 Pro Max 256GB" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Precio ($)</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Categoría</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', height: '36px' }}>
                    <option value="Tecnología y Móviles">Tecnología y Móviles</option>
                    <option value="Ferretería y Construcción">Ferretería y Construcción</option>
                    <option value="Moda y Calzado">Moda y Calzado</option>
                    <option value="Hogar y Muebles">Hogar y Muebles</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Stock</label>
                  <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="1" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>% Descuento</label>
                  <input type="number" min="0" max="99" value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} placeholder="Ej: 15" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Descripción corta</label>
                <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows="2" placeholder="Describe los detalles de tu producto..." style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '0.85rem' }}></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.8rem', marginTop: '0.2rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Publicar Ahora
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
