import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, Truck, CheckCircle, Clock, Archive } from 'lucide-react';
import api from '../services/api';

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
  const [searchQuery, setSearchQuery] = useState('');

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

    // Pedido seleccionado (por defecto el primero si no hay uno seleccionado)
    const selectedOrder = viewingOrder || filteredOrders[0] || null;

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
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '0px', flex: 1, background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', height: 'calc(100vh - 200px)' }}>
        
        {/* COLUMNA IZQUIERDA: LISTADO */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
          {/* Header de listado */}
          <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.7rem', alignItems: 'center' }}>
              <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por ID, artículo o usuario..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.8rem' }} 
              />
            </div>
            
            {/* Tabs para vendedor */}
            {user.role === 'seller' && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '6px', 
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {tabs.map(tab => {
                  const count = getTabOrders(tab.id).length;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setViewingOrder(null); }}
                      style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: isActive ? 'var(--primary)' : 'var(--bg-panel)',
                        color: isActive ? 'white' : 'var(--text-main)',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        transition: 'all 0.15s',
                        boxShadow: isActive ? '0 4px 12px rgba(14,165,233,0.15)' : 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {React.cloneElement(tab.icon, { size: 14, color: isActive ? 'white' : 'var(--text-muted)' })}
                        <span>{tab.title}</span>
                      </div>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.05)', 
                        color: isActive ? 'white' : 'var(--text-muted)',
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        minWidth: '15px',
                        textAlign: 'center'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lista scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>No hay pedidos aquí.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                const { items } = parseOrderData(order.item);
                const partnerName = user.role === 'seller' ? (order.buyer?.name || 'Comprador') : (order.seller?.name || 'Empresa');
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => setViewingOrder(order)}
                    style={{
                      padding: '1.1rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(var(--primary-rgb, 13, 138, 188), 0.05)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'monospace' }}>#{order.id}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)' }}>{partnerName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{items}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)' }}>${parseFloat(order.price).toFixed(2)}</span>
                      <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: statusInfo.bg, color: statusInfo.color, fontWeight: 'bold' }}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: DETALLE COMPLETO */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-panel)' }}>
          {selectedOrder ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.8rem', flex: 1 }}>
              
              {/* Encabezado del Detalle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    {user.role === 'seller' ? 'Detalle de Venta' : 'Detalle de Compra'}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: '0.2rem 0 0 0', fontFamily: 'monospace' }}>PEDIDO #{selectedOrder.id}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 'bold',
                    padding: '0.25rem 0.6rem', borderRadius: '20px',
                    background: getStatusInfo(selectedOrder.status).bg,
                    color: getStatusInfo(selectedOrder.status).color,
                    border: '1px solid transparent'
                  }}>
                    {getStatusInfo(selectedOrder.status).text}
                  </span>
                </div>
              </div>

              {/* Timeline de Seguimiento */}
              {renderTrackingTimeline(selectedOrder.status)}

              {/* Grid de Información */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                
                {/* Panel Partner */}
                <div style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem', fontWeight: 'bold' }}>
                    {user.role === 'seller' ? 'Información del Comprador' : 'Información del Vendedor'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {user.role === 'seller' ? selectedOrder.buyer?.name : selectedOrder.seller?.name}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>📞 {parseOrderData(selectedOrder.item).deliveryInfo?.phone || (user.role === 'seller' ? selectedOrder.buyer?.phone : selectedOrder.seller?.phone) || 'No registrado'}</div>
                    <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>📍 {parseOrderData(selectedOrder.item).deliveryInfo?.address || (user.role === 'seller' ? selectedOrder.buyer?.address : selectedOrder.seller?.address) || 'Retiro en persona'}</div>
                    {parseOrderData(selectedOrder.item).deliveryInfo?.note && (
                      <div style={{ fontStyle: 'italic', color: '#92400e', background: '#fef3c7', padding: '0.3rem 0.6rem', borderRadius: '6px', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                        "{parseOrderData(selectedOrder.item).deliveryInfo.note}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel Pago */}
                <div style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem', fontWeight: 'bold' }}>Detalle de Pago</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Método</span>
                      <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{selectedOrder.paymentData?.method || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Referencia de Pago</span>
                      <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{selectedOrder.paymentData?.reference || 'N/A'}</strong>
                    </div>
                    {selectedOrder.paymentData?.imageUrl && (
                      <button 
                        onClick={() => setViewingCapture(selectedOrder)}
                        style={{ marginTop: '0.2rem', width: '100%', padding: '0.4rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                      >
                        Ver Capture de Pago
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Detalle de Artículos */}
              <div>
                <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem', fontWeight: 'bold' }}>Artículos</h3>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-main)', overflow: 'hidden' }}>
                  {(() => {
                    const { items: cleanItems } = parseOrderData(selectedOrder.item);
                    const itemsList = cleanItems.split(' + ');
                    return itemsList.map((it, idx) => {
                      const match = it.trim().match(/(.+)\s\(\$(\d+\.?\d*)\)/);
                      return (
                        <div key={idx} style={{ 
                          padding: '0.7rem 1.1rem', 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          borderBottom: idx < itemsList.length - 1 ? '1px solid var(--border-color)' : 'none',
                        }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                            {match ? match[1].trim() : it.trim()}
                          </span>
                          {match && (
                            <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-main)', fontFamily: 'monospace' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', borderRadius: '12px', padding: '1.2rem', border: '1px solid var(--border-color)', marginTop: '1.5rem', flexShrink: 0 }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Monto Total</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main)' }}>${parseFloat(selectedOrder.price).toFixed(2)}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {user.role === 'seller' ? (
                    <>
                      {selectedOrder.status === 'pending_verification' && (
                        <button 
                          onClick={() => setViewingCapture(selectedOrder)}
                          style={{ padding: '0.7rem 1.2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)' }}
                        >
                          Verificar y Aprobar Pago
                        </button>
                      )}
                      {selectedOrder.status === 'Pagado' && (
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'En Preparación')}
                          style={{ padding: '0.7rem 1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(13, 138, 188, 0.15)' }}
                        >
                          Preparar Pedido
                        </button>
                      )}
                      {selectedOrder.status === 'En Preparación' && (
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'Enviado')}
                          style={{ padding: '0.7rem 1.2rem', background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Despachar Envío
                        </button>
                      )}
                      {selectedOrder.status === 'Enviado' && (
                        <div style={{ color: 'var(--primary)', background: 'rgba(14,165,233,0.08)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Enviado · Esperando confirmación de entrega
                        </div>
                      )}
                      {selectedOrder.status === 'Entregado' && (
                        <div style={{ color: '#166534', background: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          ✓ Pedido Entregado y Recibido
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedOrder.status === 'Enviado' && (
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'Entregado')}
                          style={{ padding: '0.7rem 1.2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)' }}
                        >
                          ✓ Confirmar Recepción
                        </button>
                      )}
                      {selectedOrder.status === 'Entregado' && !selectedOrder.review && (
                        <button 
                          onClick={() => setReviewOrder(selectedOrder)} 
                          className="btn-primary" 
                          style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}
                        >
                          Calificar Vendedor
                        </button>
                      )}
                      {selectedOrder.review && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d97706', fontWeight: 'bold', fontSize: '0.8rem', background: '#fffbeb', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                          ⭐ {selectedOrder.review.rating} / 5 Calificado
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem', padding: '3rem' }}>
              <span style={{ fontSize: '3rem' }}>🧾</span>
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>Detalle del Pedido</h3>
              <p style={{ fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>Selecciona un pedido de la lista para ver su información y gestionar su estado.</p>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {user.role === 'buyer' ? 'Mis Pedidos' : 'Ventas y Despachos'}
      </h2>

      {orders.length === 0 ? (
        <div className="card-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)', flex: 1 }}>
          <Package size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No tienes pedidos activos</h3>
          <p>{user.role === 'buyer' ? 'Tus compras aparecerán aquí.' : 'Cuando un comprador acepte tu oferta, aparecerá aquí.'}</p>
        </div>
      ) : (
        renderOrdersDashboard()
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: 400, padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Calificar a {reviewOrder.seller?.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Pedido #{reviewOrder.id} - {reviewOrder.item}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  onClick={() => setRating(star)} 
                  style={{ cursor: 'pointer', fontSize: '2rem', color: star <= rating ? '#f3d078' : '#ddd' }}
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
