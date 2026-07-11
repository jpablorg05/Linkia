import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Package, Truck, CheckCircle, Clock, Archive, Search, Inbox, FileText } from 'lucide-react';
import api from '../services/api';
import ModuleHero from '../components/ModuleHero';

export default function OrdersPage() {
  const { user, socket } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal para reseña
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [viewingCapture, setViewingCapture] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending_verification');
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (error) {
        console.error("Error obteniendo pedidos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleOrderStatusUpdated = ({ orderId, status }) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        setViewingOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
      };
      
      socket.on('order_status_updated', handleOrderStatusUpdated);
      return () => {
        socket.off('order_status_updated', handleOrderStatusUpdated);
      };
    }
  }, [socket]);

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        rating,
        comment,
        orderId: reviewOrder.id,
        sellerId: reviewOrder.sellerId
      });
      alert('Reseña guardada exitosamente');
      setReviewOrder(null);
      // Actualizamos UI local
      setOrders(orders.map(o => o.id === reviewOrder.id ? { ...o, review: { rating } } : o));
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar la reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert('Error actualizando pedido');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando pedidos...</div>;

  const parseOrderData = (itemString) => {
    const parts = itemString.split('|||DELIVERY_INFO|||');
    let items = parts[0];
    let deliveryInfo = null;
    if (parts.length > 1) {
      try { deliveryInfo = JSON.parse(parts[1]); } catch(e) {}
    }
    return { items, deliveryInfo };
  };

  const renderOrderItems = (itemString) => {
    const { items: cleanItems } = parseOrderData(itemString);
    const items = cleanItems.split(' + ');
    if (items.length === 1) return <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{cleanItems}</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {items.map((it, idx) => {
          const match = it.match(/(.+)\s\(\$(\d+\.\d+)\)/);
          if (match) {
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '0.5rem' }}>• {match[1]}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>${match[2]}</span>
              </div>
            );
          }
          return <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>• {it}</div>;
        })}
      </div>
    );
  };

  const renderOrdersDashboard = () => {
    const renderTrackingTimeline = (status) => {
      const steps = [
        { key: 'pending_verification', label: 'Pago Reportado' },
        { key: 'Pagado', label: 'Pago Aprobado' },
        { key: 'En Preparación', label: 'Preparación' },
        { key: 'Enviado', label: 'En Camino' },
        { key: 'Entregado', label: 'Entregado' }
      ];
      
      const getStepIndex = (s) => {
        if (s === 'Pendiente') return 0;
        if (s === 'pending_verification') return 0;
        if (s === 'Pagado') return 1;
        if (s === 'En Preparación') return 2;
        if (s === 'Enviado') return 3;
        if (s === 'Entregado') return 4;
        return 0;
      };

      const currentIdx = getStepIndex(status);

      return (
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Seguimiento de Entrega</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginTop: '0.3rem', padding: '0 0.5rem' }}>
            <div style={{ position: 'absolute', top: '10px', left: '1.5rem', right: '1.5rem', height: '2px', background: 'var(--border-color)', zIndex: 1 }} />
            <div style={{ 
              position: 'absolute', top: '10px', left: '1.5rem', 
              width: `${(currentIdx / (steps.length - 1)) * 88}%`, 
              height: '2px', background: 'var(--primary)', zIndex: 2,
              transition: 'width 0.3s ease'
            }} />

            {steps.map((step, idx) => {
              const isActive = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '50px' }}>
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', 
                    background: isCurrent ? 'var(--primary)' : isActive ? 'var(--primary)' : 'var(--bg-panel)',
                    border: isActive ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.65rem', fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    boxShadow: isCurrent ? '0 0 10px rgba(14,165,233,0.3)' : 'none'
                  }}>
                    {isActive ? '✓' : ''}
                  </div>
                  <span style={{ 
                    fontSize: '0.6rem', fontWeight: isActive ? 'bold' : 'normal', 
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)', 
                    marginTop: '0.4rem', textAlign: 'center', whiteSpace: 'nowrap' 
                  }}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // Para vendedores, filtramos por pestañas con etiquetas compactas
    const tabs = user.role === 'seller' ? [
      { id: 'pending_verification', title: 'Validar', icon: <Archive size={14} /> },
      { id: 'Pagado', title: 'Pagados', icon: <CheckCircle size={14} /> },
      { id: 'En Preparación', title: 'Preparación', icon: <Package size={14} /> },
      { id: 'Enviado', title: 'En Camino', icon: <Truck size={14} /> }
    ] : [];

    const getTabOrders = (tabId) => {
      if (user.role === 'buyer') return orders;
      return orders.filter(o => 
        (o.status === tabId) || 
        (tabId === 'Pagado' && o.status !== 'En Preparación' && o.status !== 'Enviado' && o.status !== 'pending_verification' && o.status !== 'Pendiente')
      );
    };

    const currentTabOrders = getTabOrders(activeTab);

    // Filtrar por búsqueda
    const filteredOrders = currentTabOrders.filter(o => {
      const { items } = parseOrderData(o.item);
      const partnerName = user.role === 'seller' ? (o.buyer?.name || '') : (o.seller?.name || '');
      const orderIdStr = `#${o.id}`;
      return (
        partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        items.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderIdStr.includes(searchQuery)
      );
    });

    // Pedido seleccionado (ahora solo si se hace clic para abrir el modal slide-over)
    const selectedOrder = viewingOrder;

    const getStatusInfo = (status) => {
      switch (status) {
        case 'pending_verification':
          return { text: 'Validando Pago', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', icon: <Clock size={14} /> };
        case 'Pagado':
          return { text: 'Pago Aprobado', color: '#166534', bg: 'rgba(22, 101, 52, 0.08)', icon: <CheckCircle size={14} /> };
        case 'En Preparación':
          return { text: 'En Preparación', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.08)', icon: <Package size={14} /> };
        case 'Enviado':
          return { text: 'En Camino', color: '#4338ca', bg: 'rgba(67, 56, 202, 0.08)', icon: <Truck size={14} /> };
        case 'Entregado':
          return { text: 'Entregado', color: '#166534', bg: 'rgba(22, 101, 52, 0.08)', icon: <CheckCircle size={14} /> };
        default:
          return { text: status, color: 'var(--text-muted)', bg: 'rgba(71, 85, 105, 0.08)', icon: <CheckCircle size={14} /> };
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, height: 'calc(100vh - 200px)' }}>
        
        {/* TOP BAR: SEARCH & TABS */}
        <div className="card-panel" style={{ padding: '1.2rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Tabs */}
          {user.role === 'seller' && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {tabs.map(tab => {
                const count = getTabOrders(tab.id).length;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setViewingOrder(null); }}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '24px', border: 'none',
                      background: isActive ? 'var(--text-main)' : 'var(--bg-main)',
                      color: isActive ? 'var(--bg-panel)' : 'var(--text-muted)',
                      fontWeight: isActive ? '700' : '600', fontSize: '0.8rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                  >
                    {React.cloneElement(tab.icon, { size: 16, color: isActive ? 'var(--bg-panel)' : 'var(--text-muted)' })}
                    <span>{tab.title}</span>
                    {count > 0 && (
                      <span style={{ fontSize: '0.7rem', background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', padding: '0.1rem 0.4rem', borderRadius: '12px' }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search */}
          <div style={{ display: 'flex', gap: '0.6rem', background: 'var(--bg-main)', borderRadius: '12px', padding: '0.6rem 1rem', alignItems: 'center', border: '1px solid var(--border-color)', minWidth: '280px', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" placeholder="Buscar ID o usuario..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.85rem' }} 
            />
          </div>
        </div>

        {/* ORDER GRID */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredOrders.length === 0 ? (
            <div className="card-panel flex-center" style={{ flexDirection: 'column', gap: '1rem', padding: '4rem 2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}><Inbox size={40} /></div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>No hay pedidos en esta sección</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignContent: 'start', paddingBottom: '2rem' }}>
              {filteredOrders.map(order => {
                const { items } = parseOrderData(order.item);
                const partnerName = user.role === 'seller' ? (order.buyer?.name || 'Comprador') : (order.seller?.name || 'Empresa');
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div 
                    key={order.id} 
                    className="card-panel" 
                    onClick={() => setViewingOrder(order)} 
                    style={{ 
                      padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem', 
                      border: '1px solid var(--border-color)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'monospace', background: 'rgba(var(--primary-rgb, 13, 138, 188), 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>#{order.id}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{partnerName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{items}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>${parseFloat(order.price).toFixed(2)}</span>
                          {order.review && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#d97706', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                              ⭐ {order.review.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: statusInfo.bg, color: statusInfo.color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SLIDE-OVER MODAL FOR DETAILS */}
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', transition: 'all 0.3s' }} onClick={() => setViewingOrder(null)}>
            <div className="card-panel animate-slide-left" style={{ width: '100%', maxWidth: '580px', height: '100%', margin: 0, borderRadius: '24px 0 0 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-panel)', boxShadow: '-10px 0 40px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
              
              {/* Header Slide-Over */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '2.5rem 3rem 1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', margin: '0', letterSpacing: '-0.5px' }}>Pedido #{selectedOrder.id}</h2>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem', fontWeight: '500' }}>
                    {user.role === 'seller' ? 'Venta a ' + selectedOrder.buyer?.name : 'Compra a ' + selectedOrder.seller?.name}
                  </span>
                </div>
                <button onClick={() => setViewingOrder(null)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.2rem', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>✕</button>
              </div>

              <div style={{ padding: '2rem 3rem 4rem', display: 'flex', flexDirection: 'column', gap: '3rem', flex: 1 }}>
                
                {/* Timeline de Seguimiento */}
                <div style={{ background: 'transparent' }}>
                  {renderTrackingTimeline(selectedOrder.status)}
                </div>

                {/* Grid de Información */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  
                  {/* Panel Entrega */}
                  <div>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem', fontWeight: '600' }}>
                      Datos de Entrega
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        {user.role === 'seller' ? selectedOrder.buyer?.name : selectedOrder.seller?.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{opacity: 0.6}}>📞</span> {parseOrderData(selectedOrder.item).deliveryInfo?.phone || (user.role === 'seller' ? selectedOrder.buyer?.phone : selectedOrder.seller?.phone) || 'No registrado'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', lineHeight: '1.4' }}>
                        <span style={{opacity: 0.6}}>📍</span> 
                        <span>{parseOrderData(selectedOrder.item).deliveryInfo?.address || (user.role === 'seller' ? selectedOrder.buyer?.address : selectedOrder.seller?.address) || 'Retiro en persona'}</span>
                      </div>
                      {parseOrderData(selectedOrder.item).deliveryInfo?.note && (
                        <div style={{ color: 'var(--text-muted)', paddingLeft: '1.8rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                          "{parseOrderData(selectedOrder.item).deliveryInfo.note}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel Pago */}
                  <div>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem', fontWeight: '600' }}>Detalle de Pago</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Método</span>
                        <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{selectedOrder.paymentData?.method || 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Referencia</span>
                        <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{selectedOrder.paymentData?.reference || 'N/A'}</strong>
                      </div>
                      {selectedOrder.paymentData?.imageUrl && (
                        <button 
                          onClick={() => setViewingCapture(selectedOrder)}
                          style={{ marginTop: '0.5rem', width: 'max-content', padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '24px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                        >
                          Ver Comprobante
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Detalle de Artículos */}
                <div>
                  <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem', fontWeight: '600' }}>Resumen de la Orden</h3>
                  <div style={{ background: 'var(--bg-main)', borderRadius: '16px', padding: '1.5rem' }}>
                    {(() => {
                      const { items: cleanItems } = parseOrderData(selectedOrder.item);
                      const itemsList = cleanItems.split(' + ');
                      return itemsList.map((it, idx) => {
                        const match = it.trim().match(/(.+)\s\(\$(\d+\.?\d*)\)/);
                        return (
                          <div key={idx} style={{ 
                            padding: '1rem 0', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: idx < itemsList.length - 1 ? '1px dashed var(--border-color)' : 'none',
                          }}>
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '500' }}>
                              {match ? match[1].trim() : it.trim()}
                            </span>
                            {match && (
                              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                ${parseFloat(match[2]).toFixed(2)}
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Panel de Control y Total */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Monto Total</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1.5px' }}>${parseFloat(selectedOrder.price).toFixed(2)}</span>
                  </div>
                  
                  <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {user.role === 'seller' ? (
                      <>
                        {selectedOrder.status === 'pending_verification' && (
                          <button 
                            onClick={() => setViewingCapture(selectedOrder)}
                            style={{ padding: '0.8rem 1.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '24px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.2)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            Verificar y Aprobar Pago
                          </button>
                        )}
                        {selectedOrder.status === 'Pagado' && (
                          <button 
                            onClick={() => updateOrderStatus(selectedOrder.id, 'En Preparación')}
                            style={{ padding: '0.8rem 1.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '24px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.2)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            Preparar Pedido
                          </button>
                        )}
                        {selectedOrder.status === 'En Preparación' && (
                          <button 
                            onClick={() => updateOrderStatus(selectedOrder.id, 'Enviado')}
                            style={{ padding: '0.8rem 1.8rem', background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '24px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            Despachar Envío
                          </button>
                        )}
                        {selectedOrder.status === 'Enviado' && (
                          <div style={{ color: 'var(--primary)', background: 'rgba(14,165,233,0.08)', padding: '0.8rem 1.5rem', borderRadius: '24px', fontSize: '0.9rem', fontWeight: '700' }}>
                            Esperando confirmación de entrega
                          </div>
                        )}
                        {selectedOrder.status === 'Entregado' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end' }}>
                            <div style={{ color: '#059669', background: '#d1fae5', padding: '0.8rem 1.5rem', borderRadius: '24px', fontSize: '0.9rem', fontWeight: '700' }}>
                              ✓ Pedido Completado
                            </div>
                            {selectedOrder.review && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', color: '#d97706', background: '#fef3c7', padding: '0.8rem 1.5rem', borderRadius: '16px', border: '1px solid #fde68a' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                  ⭐ {selectedOrder.review.rating} / 5 Recibido
                                </div>
                                {selectedOrder.review.comment && (
                                  <div style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic', maxWidth: '300px', textAlign: 'right' }}>
                                    "{selectedOrder.review.comment}"
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedOrder.status === 'Enviado' && (
                          <button 
                            onClick={() => updateOrderStatus(selectedOrder.id, 'Entregado')}
                            style={{ padding: '0.8rem 1.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '24px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            ✓ Confirmar Recepción
                          </button>
                        )}
                        {selectedOrder.status === 'Entregado' && !selectedOrder.review && (
                          <button 
                            onClick={() => {
                               setViewingOrder(null); 
                               setReviewOrder(selectedOrder);
                            }} 
                            style={{ padding: '0.8rem 1.8rem', background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '24px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            Calificar Vendedor
                          </button>
                        )}
                        {selectedOrder.review && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', color: '#d97706', background: '#fef3c7', padding: '0.8rem 1.5rem', borderRadius: '16px', border: '1px solid #fde68a' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                              ⭐ {selectedOrder.review.rating} / 5 Calificado
                            </div>
                            {selectedOrder.review.comment && (
                              <div style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic', maxWidth: '300px', textAlign: 'right' }}>
                                "{selectedOrder.review.comment}"
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const isImmersive = ['buyer', 'seller'].includes(user.role);

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)' }}>
      <ModuleHero
        eyebrow={user.role === 'buyer' ? 'Mi cuenta' : 'Empresa'}
        title={user.role === 'buyer' ? 'Mis Pedidos' : 'Ventas y Despachos'}
        subtitle={user.role === 'buyer' ? 'Sigue el estado de tus compras.' : 'Gestiona, verifica y despacha tus pedidos.'}
        iconName="orders"
        fullBleed={isImmersive}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isImmersive ? '0 2rem 2rem' : 0, maxWidth: isImmersive ? 1200 : 'none', margin: '0 auto', width: '100%' }}>
        {orders.length === 0 ? (
          <div className="card-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)', flex: 1 }}>
            <Package size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3>No tienes pedidos activos</h3>
            <p>{user.role === 'buyer' ? 'Tus compras aparecerán aquí.' : 'Cuando un comprador acepte tu oferta, aparecerá aquí.'}</p>
          </div>
        ) : (
          renderOrdersDashboard()
        )}
      </div>

      {/* Review Modal */}
      {reviewOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: 400, padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Calificar a {reviewOrder.seller?.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Pedido #{reviewOrder.id} - {parseOrderData(reviewOrder.item).items}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  onClick={() => setRating(star)} 
                  style={{ cursor: 'pointer', fontSize: '2.5rem', color: star <= rating ? '#f3d078' : '#ddd', transition: 'color 0.2s' }}
                  onMouseEnter={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="¿Qué tal estuvo el repuesto y la atención?"
              className="input-field"
              style={{ minHeight: '80px', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => setReviewOrder(null)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={submitReview} disabled={submittingReview} className="btn-primary" style={{ flex: 1 }}>
                {submittingReview ? 'Guardando...' : 'Enviar'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COMPROBANTE DE PAGO */}
      {viewingCapture && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setViewingCapture(null)}>
          <div style={{ background: 'var(--bg-panel)', borderRadius: '24px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()} className="animate-slide-up">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Comprobante de Pago</h3>
              <button onClick={() => setViewingCapture(null)} style={{ background: 'var(--bg-main)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Referencia</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewingCapture?.paymentData?.reference || 'N/A'}</div>
                </div>
                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Método</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)', textTransform: 'uppercase' }}>{viewingCapture?.paymentData?.method || 'N/A'}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.8rem' }}>Capture Adjunto</div>
                {viewingCapture?.paymentData?.imageUrl ? (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                    <img src={viewingCapture.paymentData.imageUrl} alt="Comprobante" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', padding: '3rem 1rem', background: 'var(--bg-main)', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                    El comprador no subió <br/> imagen de comprobante
                  </div>
                )}
              </div>
              
              {user.role === 'seller' && viewingCapture.status === 'pending_verification' && (
                <button onClick={() => { updateOrderStatus(viewingCapture.id, 'Pagado'); setViewingCapture(null); }} style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  Aprobar Pago
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
