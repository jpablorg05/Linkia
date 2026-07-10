import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Store, User, CheckCircle, Paperclip, X, Truck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

export default function ChatPage() {
  const { id } = useParams(); // partnerId
  const partnerId = parseInt(id);
  const navigate = useNavigate();
  const { user, socket } = useAppContext();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sellerRating, setSellerRating] = useState(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerItems, setOfferItems] = useState([{ id: 1, description: '', price: '' }]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  
  const [checkoutOffer, setCheckoutOffer] = useState(null);
  const [checkoutMethod, setCheckoutMethod] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryCostInputs, setDeliveryCostInputs] = useState({});
  const [partnerInfo, setPartnerInfo] = useState(null);
  
  const parseOrderData = (itemString) => {
    if (!itemString) return { items: '', deliveryInfo: null };
    const parts = itemString.split('|||DELIVERY_INFO|||');
    let items = parts[0];
    let deliveryInfo = null;
    if (parts.length > 1) {
      try { deliveryInfo = JSON.parse(parts[1]); } catch(e) {}
    }
    return { items, deliveryInfo };
  };

  const renderCleanItems = (itemString) => {
    const { items, deliveryInfo } = parseOrderData(itemString);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>
          {items.split(' + ').map((it, idx) => (
            <div key={idx} style={{ padding: '0.2rem 0' }}>• {it}</div>
          ))}
        </div>
        {deliveryInfo && (
          <div style={{ marginTop: '0.5rem', background: 'var(--bg-main)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '0.4rem' }}>
              <Truck size={14} /> Información de Delivery
            </div>
            <div style={{ color: 'var(--text-muted)' }}>📍 {deliveryInfo.address}</div>
            <div style={{ color: 'var(--text-muted)' }}>📞 {deliveryInfo.phone}</div>
            {deliveryInfo.note && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>"{deliveryInfo.note}"</div>}
          </div>
        )}
      </div>
    );
  };
  
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    // Cargar historial de mensajes
    api.get(`/messages/${partnerId}`).then(res => {
      setMessages(res.data);
    }).catch(err => console.error('Error fetching messages:', err));

    // Cargar info pública del partner
    api.get(`/users/${partnerId}`).then(res => {
      setPartnerInfo(res.data);
    }).catch(() => {});

    // Si es comprador, cargar rating del vendedor
    if (user.role === 'buyer') {
      api.get(`/sellers/${partnerId}/reviews`).then(res => {
        setSellerRating(res.data.average);
      }).catch(err => console.error(err));
    }
  }, [user.role, partnerId]);

  useEffect(() => {
    // Escuchar mensajes entrantes
    if (socket) {
      socket.on('receive_message', (msg) => {
        if (msg.senderId === partnerId || msg.receiverId === partnerId) {
          setMessages(prev => {
            const exists = prev.findIndex(m => m.id === msg.id || (msg.tempId && m.id === msg.tempId));
            if (exists >= 0) {
              const copy = [...prev];
              copy[exists] = msg;
              return copy;
            }
            return [...prev, msg];
          });
        }
      });
      
      socket.on('message_sent_ack', ({ tempId, realMsg }) => {
        setMessages(prev => {
          const exists = prev.findIndex(m => m.id === tempId);
          if (exists >= 0) {
            const copy = [...prev];
            copy[exists] = realMsg;
            return copy;
          }
          return prev;
        });
      });

      return () => {
        socket.off('receive_message');
        socket.off('message_sent_ack');
      };
    }
  }, [socket, partnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const tempId = Date.now().toString();
    const newMsg = {
      id: tempId,
      tempId,
      text: inputText,
      senderId: user.id,
      receiverId: partnerId,
      createdAt: new Date()
    };

    // Optimistic UI
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (socket) {
      socket.emit('send_message', newMsg);
    }
  };

  const handleAcceptOffer = async (offer) => {
    setLoading(true);
    try {
      let finalItem = offer.description;
      if (offer.deliveryInfo) {
         finalItem += `|||DELIVERY_INFO|||${JSON.stringify(offer.deliveryInfo)}`;
      }
      
      const res = await api.post('/orders', {
        item: finalItem,
        price: parseFloat(offer.price),
        sellerId: partnerId
      });
      // Redirigir al pago con el ID de la orden generada y el precio exacto
      navigate(`/payment/${res.data.id}`, { state: { price: parseFloat(offer.price) } });
    } catch (err) {
      alert('Error al procesar el pedido');
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId, msgId) => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'Pagado' });
      
      const newMsg = messages.find(m => m.id === msgId);
      if (newMsg) {
        const updatedMsg = { ...newMsg, text: newMsg.text.replace('[PAGO_ENVIADO]', '[PAGO_VERIFICADO]') };
        setMessages(prev => prev.map(m => m.id === msgId ? updatedMsg : m));
        if (socket) socket.emit('update_message', updatedMsg);
      }
    } catch (err) {
      alert('Error al verificar el pago');
    }
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    const validItems = offerItems.filter(i => i.description.trim() !== '' && i.price !== '');
    if (validItems.length === 0) return;

    const totalPrice = validItems.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
    const combinedDescription = validItems.map(i => `${i.description} ($${parseFloat(i.price).toFixed(2)})`).join(' + ');

    const tempId = Date.now().toString();
    const offerData = JSON.stringify({ price: totalPrice, description: combinedDescription, items: validItems });
    const newMsg = {
      id: editingMessageId || tempId,
      tempId: editingMessageId ? null : tempId,
      text: `[OFERTA] ${offerData}`,
      senderId: user.id,
      receiverId: partnerId,
      createdAt: new Date()
    };

    setMessages(prev => {
      const exists = prev.findIndex(m => m.id === newMsg.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = newMsg;
        return copy;
      }
      return [...prev, newMsg];
    });

    if (socket) {
      if (editingMessageId) {
        socket.emit('update_message', newMsg);
      } else {
        socket.emit('send_message', newMsg);
      }
    }
    
    setShowOfferForm(false);
    setOfferItems([{ id: 1, description: '', price: '' }]);
    setEditingMessageId(null);
  };

  const requestDeliveryQuote = () => {
    if (checkoutMethod === 'delivery' && !deliveryAddress.trim()) {
      alert("Por favor ingresa tu dirección");
      return;
    }

    if (checkoutMethod === 'pickup') {
      handleAcceptOffer({ description: checkoutOffer.description, price: checkoutOffer.price });
      setCheckoutOffer(null);
      return;
    }

    const newMsg = {
      id: Date.now().toString(),
      text: `[SOLICITUD_DELIVERY] ${JSON.stringify({ ...checkoutOffer, address: deliveryAddress, phone: deliveryPhone, note: deliveryNote })}`,
      senderId: user.id,
      receiverId: partnerId,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    if (socket) socket.emit('send_message', newMsg);
    setCheckoutOffer(null);
    setDeliveryAddress('');
    setDeliveryPhone('');
    setDeliveryNote('');
  };

  const handleQuoteDelivery = (reqData) => {
    const costStr = deliveryCostInputs[reqData.id];
    if (!costStr) return;
    const cost = parseFloat(costStr);
    if (cost < 0) return;

    const newItems = reqData.items ? [...reqData.items, { description: 'Delivery', price: cost }] : [{description: 'Repuestos', price: reqData.price}, {description: 'Delivery', price: cost}];
    const combinedDesc = newItems.map(i => `${i.description} ($${parseFloat(i.price).toFixed(2)})`).join(' + ');
    const newTotal = reqData.price + cost;

    const newMsg = {
      id: Date.now().toString(),
      text: `[OFERTA] ${JSON.stringify({ price: newTotal, description: combinedDesc, items: newItems, deliveryInfo: { address: reqData.address, phone: reqData.phone, note: reqData.note } })}`,
      senderId: user.id,
      receiverId: partnerId,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    if (socket) socket.emit('send_message', newMsg);
    setDeliveryCostInputs(prev => ({ ...prev, [reqData.id]: '' }));
  };

  const addOfferItem = () => {
    setOfferItems([...offerItems, { id: Date.now(), description: '', price: '' }]);
  };

  const removeOfferItem = (id) => {
    if (offerItems.length > 1) {
      setOfferItems(offerItems.filter(i => i.id !== id));
    }
  };

  const updateOfferItem = (id, field, value) => {
    setOfferItems(offerItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleEditOffer = (offer, messageId) => {
    if (offer.items && offer.items.length > 0) {
      setOfferItems(offer.items);
    } else {
      setOfferItems([{ id: Date.now(), description: offer.description, price: offer.price }]);
    }
    setEditingMessageId(messageId);
    setShowOfferForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newMsg = {
        id: Date.now().toString(),
        text: `[IMAGEN] ${res.data.imageUrl}`,
        senderId: user.id,
        receiverId: partnerId,
        createdAt: new Date()
      };

      setMessages(prev => [...prev, newMsg]);
      if (socket) socket.emit('send_message', newMsg);
    } catch (err) {
      alert('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const partnerName = user.role === 'buyer' ? 'Vendedor' : 'Comprador';

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      
      {/* Header */}
      <div className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e3e6e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.role === 'buyer' ? <Store size={20} color='var(--text-muted)' /> : <User size={20} color='var(--text-muted)' />}
          </div>
          <div>
            <h3 
              onClick={() => user.role === 'buyer' && navigate(`/store/${partnerId}`)}
              style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: user.role === 'buyer' ? 'pointer' : 'default', textDecoration: user.role === 'buyer' ? 'underline' : 'none', color: 'var(--text-main)' }}
              title={user.role === 'buyer' ? "Visitar Vitrina Pública" : ""}
            >
              {partnerName} (ID: {partnerId})
              {user.role === 'buyer' && sellerRating !== null && (
                <span style={{ fontSize: '0.85rem', background: '#fffcf2', border: '1px solid #f3d078', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  ⭐ {sellerRating.toFixed(1)}
                </span>
              )}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#007185' }}>En línea</span>
          </div>
        </div>
      </div>

      {/* Seller Offer Form */}
      {user.role === 'seller' && showOfferForm && (
        <div style={{ background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '600' }}>Armar Cotización</h4>
            <span style={{ fontWeight: '700', fontSize: '1.3rem', color: 'var(--primary)' }}>
              ${offerItems.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0).toFixed(2)}
            </span>
          </div>
          
          <form onSubmit={handleSendOffer} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {offerItems.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ flex: 2, position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder={`Artículo ${index + 1} (Ej. Bujías)`} 
                    value={item.description} 
                    onChange={e => updateOfferItem(item.id, 'description', e.target.value)}
                    className="input-field" 
                    style={{ width: '100%', marginBottom: 0, padding: '0.7rem 1rem', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}
                    required
                  />
                </div>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#6b7280', fontSize: '0.9rem' }}>$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={item.price} 
                    onChange={e => updateOfferItem(item.id, 'price', e.target.value)}
                    className="input-field" 
                    style={{ width: '100%', marginBottom: 0, padding: '0.7rem 1rem 0.7rem 1.8rem', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}
                    required
                  />
                </div>
                {offerItems.length > 1 && (
                  <button type="button" onClick={() => removeOfferItem(item.id)} style={{ padding: '0.7rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                    <span style={{ fontWeight: 'bold' }}>✕</span>
                  </button>
                )}
              </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.2rem' }}>
              <button type="button" onClick={addOfferItem} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0' }}>
                + Añadir ítem
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
              <button type="button" onClick={() => { setShowOfferForm(false); setEditingMessageId(null); }} className="btn-secondary" style={{ flex: 1, borderRadius: '8px', padding: '0.8rem' }}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ flex: 2, borderRadius: '8px', padding: '0.8rem', fontWeight: '600' }}>{editingMessageId ? 'Actualizar Cotización' : 'Enviar Cotización'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Messages */}
      <div className="card-panel" style={{ flex: 1, borderRadius: 0, borderTop: 'none', borderBottom: 'none', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-main)' }}>
        {messages.map(msg => {
          const isMe = msg.senderId === user.id;
          const isOffer = msg.text.startsWith('[OFERTA]');
          const isSystem = msg.text.startsWith('[SISTEMA]');
          const isImage = msg.text.startsWith('[IMAGEN]');
          const isPaymentSent = msg.text.startsWith('[PAGO_ENVIADO]');
          const isPaymentVerified = msg.text.startsWith('[PAGO_VERIFICADO]');

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }}>
              
              {isSystem ? (
                msg.text.includes('declinado') || msg.text.includes('cancelado') ? (
                  <div style={{ 
                    background: 'var(--bg-panel)', 
                    borderRadius: '16px', 
                    padding: '2rem', 
                    margin: '1rem auto',
                    maxWidth: '400px',
                    textAlign: 'center',
                    border: '1px solid #fee2e2',
                    boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%'
                  }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={32} color="#ef4444" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cotización Declinada</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{msg.text.replace('[SISTEMA] ', '')}</p>
                    </div>
                    <button 
                      onClick={() => navigate('/')} 
                      className="btn-secondary" 
                      style={{ padding: '0.8rem 2rem', borderRadius: '24px', fontWeight: '600', color: 'var(--text-muted)', border: '1px solid var(--border-color)', marginTop: '0.5rem', cursor: 'pointer' }}
                    >
                      Volver al Inicio
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', borderLeft: '3px solid #cbd5e1', padding: '0.8rem 1rem', borderRadius: '4px', fontStyle: 'italic', fontSize: '0.85rem', width: '100%', textAlign: 'center', margin: '0.5rem 0' }}>
                    {msg.text.replace('[SISTEMA] ', '').replace(/\|\|\|DELIVERY_INFO\|\|\|\{.*?\}/g, '')}
                  </div>
                )
              ) : isPaymentSent || isPaymentVerified ? (
                (() => {
                  const data = JSON.parse(msg.text.replace('[PAGO_ENVIADO] ', '').replace('[PAGO_VERIFICADO] ', ''));
                  return (
                    <div style={{ 
                      background: 'var(--bg-panel)', 
                      borderRadius: '24px', 
                      minWidth: '280px', 
                      maxWidth: '320px',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)', 
                      overflow: 'hidden',
                      border: '1px solid #f1f5f9',
                      margin: '1rem 0'
                    }}>
                      <div style={{ background: isPaymentVerified ? '#22c55e' : '#f59e0b', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle size={24} color="white" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '-0.3px' }}>
                          {isPaymentVerified ? 'Pago Verificado' : 'Reporte de Pago'}
                        </h4>
                      </div>
                      
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.2rem' }}>Orden</span>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>#{data.orderId}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.2rem' }}>Referencia</span>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{data.reference || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                          {renderCleanItems(data.item)}
                        </div>
                        
                        {data.imageUrl && (
                          <div 
                            style={{ marginBottom: '1.5rem', borderRadius: '16px', overflow: 'hidden', border: '2px solid #f1f5f9', cursor: 'zoom-in', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                            onClick={() => setFullScreenImage(data.imageUrl)}
                          >
                            <img src={data.imageUrl} alt="Comprobante de Pago" style={{ width: '100%', display: 'block', maxHeight: '180px', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                            <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>Ver imagen</div>
                          </div>
                        )}

                        <div style={{ background: 'var(--bg-main)', padding: '1rem 1.2rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', border: '1px dashed var(--border-color)' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Pagado</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                            ${parseFloat(data.amount).toFixed(2)}
                          </span>
                        </div>

                        {user.role === 'seller' ? (
                          <button 
                            onClick={() => handleVerifyPayment(data.orderId, msg.id)} 
                            disabled={isPaymentVerified}
                            style={{ 
                              width: '100%', 
                              background: isPaymentVerified ? '#f0fdf4' : 'var(--text-main)', 
                              color: isPaymentVerified ? '#166534' : 'white', 
                              border: isPaymentVerified ? '1px solid #bbf7d0' : 'none', 
                              borderRadius: '16px', 
                              padding: '1rem', 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              cursor: isPaymentVerified ? 'default' : 'pointer',
                              boxShadow: isPaymentVerified ? 'none' : '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
                              transition: 'all 0.2s',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {isPaymentVerified ? <><CheckCircle size={18} /> Verificado</> : 'Aprobar Pago'}
                          </button>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '1rem', background: isPaymentVerified ? '#f0fdf4' : '#fffbeb', borderRadius: '16px', color: isPaymentVerified ? '#166534' : '#d97706', fontSize: '0.9rem', fontWeight: '600', border: `1px solid ${isPaymentVerified ? '#bbf7d0' : '#fde68a'}` }}>
                            {isPaymentVerified ? '¡El vendedor ha confirmado tu pago!' : 'Esperando confirmación del vendedor...'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()
              ) : isOffer ? (
                (() => {
                  const offer = JSON.parse(msg.text.replace('[OFERTA] ', ''));
                  return (
                    <div style={{ 
                      background: 'var(--bg-panel)', 
                      borderRadius: '20px', 
                      minWidth: '280px', 
                      maxWidth: '320px',
                      boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0,0,0,0.03)', 
                      overflow: 'hidden',
                      border: '1px solid #f1f5f9',
                      margin: '0.5rem 0'
                    }}>
                      <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle size={14} color="white" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '700', letterSpacing: '-0.3px' }}>Cotización</h4>
                      </div>
                      
                      <div style={{ padding: '1.5rem' }}>
                        {offer.items && offer.items.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            {offer.items.map((i, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span style={{ flex: 1, paddingRight: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.description}</span>
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>${parseFloat(i.price).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>{offer.description}</p>
                        )}

                        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1.2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.2rem' }}>Total a pagar</span>
                          <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px', lineHeight: 1 }}>
                            ${offer.price.toFixed(2)}
                          </span>
                        </div>

                        {user.role === 'buyer' ? (
                          <button 
                            onClick={() => {
                              const hasDelivery = offer.items && offer.items.some(i => i.description.toLowerCase() === 'delivery');
                              if (hasDelivery && !offer.deliveryInfo) {
                                setCheckoutOffer({ ...offer, needsInfoOnly: true });
                                setCheckoutMethod('delivery');
                              } else if (hasDelivery) {
                                handleAcceptOffer(offer);
                              } else {
                                setCheckoutOffer(offer);
                              }
                            }} 
                            disabled={loading} 
                            style={{ 
                              width: '100%', 
                              background: 'var(--text-main)', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '12px', 
                              padding: '1rem', 
                              fontWeight: '600', 
                              fontSize: '0.95rem',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                              transition: 'transform 0.1s'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            {loading ? 'Procesando...' : (offer.items && offer.items.some(i => i.description.toLowerCase() === 'delivery') ? 'Pagar ahora' : 'Procesar Compra')}
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500' }}>Esperando al cliente...</span>
                            <button 
                              onClick={() => handleEditOffer(offer, msg.id)}
                              style={{ 
                                background: 'var(--bg-main)', 
                                border: '1px solid var(--border-color)', 
                                color: 'var(--text-muted)', 
                                padding: '0.8rem 1rem', 
                                borderRadius: '12px', 
                                cursor: 'pointer', 
                                fontSize: '0.85rem', 
                                width: '100%', 
                                fontWeight: '600', 
                                transition: 'all 0.2s' 
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                              Modificar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()
              ) : msg.text.startsWith('[SOLICITUD_DELIVERY]') ? (
                (() => {
                  const reqData = JSON.parse(msg.text.replace('[SOLICITUD_DELIVERY] ', ''));
                  const safeReqData = { ...reqData, id: reqData.id || msg.id };
                  return (
                    <div style={{ background: 'var(--bg-main)', borderRadius: '16px', padding: '1.2rem', margin: '0.5rem 0', width: '100%', maxWidth: '320px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-main)', fontSize: '1rem' }}>Solicitud de Delivery</h4>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>El cliente solicita envío a:</p>
                      <div style={{ background: 'var(--bg-panel)', padding: '0.8rem', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-main)', fontWeight: '500', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div><span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>Dirección:</span> {reqData.address}</div>
                        <div><span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>Teléfono:</span> {reqData.phone || 'N/A'}</div>
                        {reqData.note && <div><span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>Nota:</span> <i>"{reqData.note}"</i></div>}
                      </div>
                      
                      {user.role === 'seller' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Costo de Envío ($):</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            style={{ marginBottom: '0.5rem' }}
                            value={deliveryCostInputs[safeReqData.id] || ''}
                            onChange={e => setDeliveryCostInputs(prev => ({...prev, [safeReqData.id]: e.target.value}))}
                            placeholder="Ej. 5.00"
                          />
                          <button onClick={() => handleQuoteDelivery(safeReqData)} className="btn-primary" style={{ width: '100%', borderRadius: '8px', padding: '0.8rem' }}>
                            Enviar Cotización Total
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#d97706', fontSize: '0.85rem', fontWeight: '500', background: '#fffbeb', padding: '0.8rem', borderRadius: '8px' }}>
                          Esperando que el vendedor cotice el envío...
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : isImage ? (
                <div style={{ margin: '0.5rem 0', maxWidth: '70%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={msg.text.replace('[IMAGEN] ', '')} alt="Adjunto" style={{ width: '100%', display: 'block' }} />
                </div>
              ) : (
                <div style={{ 
                  background: isMe ? 'var(--primary)' : '#ffffff', 
                  color: isMe ? '#ffffff' : 'var(--text-main)',
                  border: isMe ? 'none' : '1px solid var(--border-color)',
                  padding: '0.8rem 1.2rem', 
                  borderRadius: '18px', 
                  borderBottomRightRadius: isMe ? '4px' : '18px',
                  borderBottomLeftRadius: isMe ? '18px' : '4px',
                  maxWidth: '75%',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  margin: '0.2rem 0'
                }}>
                  <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: '1.4' }}>{msg.text}</p>
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="card-panel" style={{ padding: '1rem', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', background: 'var(--bg-main)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          
          <label style={{ cursor: uploadingImage ? 'wait' : 'pointer', padding: '0.5rem', color: 'var(--text-muted)', opacity: uploadingImage ? 0.5 : 1 }}>
            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
            <Paperclip size={20} />
          </label>

          {user.role === 'seller' && (
            <button type="button" onClick={() => setShowOfferForm(!showOfferForm)} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
              Cotizar
            </button>
          )}

          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="input-field"
            style={{ flex: 1, marginBottom: 0, borderRadius: '20px' }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      </div>

      {/* Modal de Imagen a Pantalla Completa */}
      {fullScreenImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setFullScreenImage(null)}>
          <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setFullScreenImage(null)}>
            <X size={28} />
          </button>
          <img src={fullScreenImage} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Checkout Modal (Comprador decidiendo si Delivery o Retiro) */}
      {checkoutOffer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setCheckoutOffer(null)}>
          <div style={{ background: 'var(--bg-panel)', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '2rem' }} onClick={e => e.stopPropagation()} className="animate-slide-up">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 1.5rem 0' }}>Opciones de Entrega</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {!checkoutOffer.needsInfoOnly ? (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `2px solid ${checkoutMethod === 'pickup' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: checkoutMethod === 'pickup' ? 'var(--bg-main)' : '#fff' }} onClick={() => setCheckoutMethod('pickup')}>
                    <input type="radio" checked={checkoutMethod === 'pickup'} onChange={() => setCheckoutMethod('pickup')} style={{ width: 18, height: 18 }} />
                    <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem' }}>Retiro en Tienda</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `2px solid ${checkoutMethod === 'delivery' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: checkoutMethod === 'delivery' ? 'var(--bg-main)' : '#fff' }} onClick={() => setCheckoutMethod('delivery')}>
                    <input type="radio" checked={checkoutMethod === 'delivery'} onChange={() => setCheckoutMethod('delivery')} style={{ width: 18, height: 18 }} />
                    <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem' }}>Envío a Domicilio</span>
                  </label>
                </>
              ) : (
                <div style={{ padding: '1.2rem', background: '#e0f2fe', borderRadius: '12px', color: '#0369a1', fontWeight: '600', textAlign: 'center', border: '1px solid #bae6fd' }}>
                  El vendedor incluyó Delivery. Por favor, completa tus datos de envío para finalizar.
                </div>
              )}
            </div>

            {checkoutMethod === 'pickup' && partnerInfo?.address && (
              <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', marginBottom: '2rem', border: '1px dashed var(--border-color)', animation: 'fadeIn 0.3s' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>📍 Dirección de Retiro:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)', display: 'block', lineHeight: '1.4' }}>{partnerInfo.address}</span>
              </div>
            )}

            {checkoutMethod === 'delivery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Dirección de Envío</label>
                  <button 
                    onClick={() => { setDeliveryAddress(user.address || ''); setDeliveryPhone(user.phone || ''); }} 
                    style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.1)', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Usar mis datos
                  </button>
                </div>
                <textarea 
                  placeholder="Ej: Av. Principal 123, Edificio 4, Apto 2..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', resize: 'none', height: '70px', fontSize: '0.95rem', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                />
                
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Teléfono de Contacto</label>
                <input 
                  type="text"
                  placeholder="Ej: 0414-1234567"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '0.95rem', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                />

                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Nota para la entrega (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ej: Llamar al llegar, escribir por WhatsApp..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '0.95rem', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                />

                {!checkoutOffer.needsInfoOnly && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '16px', fontSize: '0.7rem', fontWeight: 'bold' }}>i</span>
                    El vendedor te enviará el costo del delivery para que lo apruebes.
                  </p>
                )}
              </div>
            )}

            <button 
              onClick={() => {
                if (checkoutOffer.needsInfoOnly) {
                  if (!deliveryAddress.trim()) { alert("Por favor ingresa tu dirección"); return; }
                  const offerWithInfo = { ...checkoutOffer, deliveryInfo: { address: deliveryAddress, phone: deliveryPhone, note: deliveryNote } };
                  handleAcceptOffer(offerWithInfo);
                  setCheckoutOffer(null);
                } else {
                  requestDeliveryQuote();
                }
              }} 
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.05rem' }}
            >
              {checkoutOffer.needsInfoOnly ? 'Finalizar Compra' : (checkoutMethod === 'pickup' ? 'Proceder al Pago' : 'Solicitar Cotización de Envío')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
