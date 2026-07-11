import React, { useState, useEffect } from 'react';
import { Search, MapPin, Zap, ArrowLeft, Clock, ShieldCheck, MessageCircle, Star, Smartphone, Home, Shirt, Wrench, ShoppingCart, Store, ChevronRight, X, TrendingUp, PackageSearch, Bell, User, LogOut, Moon, Sun, ShoppingBag, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import api from '../services/api';

const categoryKeywords = {
  'Tecnología y Móviles': ['iphone', 'samsung', 'laptop', 'pc', 'celular', 'telefono', 'teléfono', 'pantalla', 'cargador', 'usb', 'televisor', 'tv', 'auriculares', 'audifonos', 'macbook', 'tablet'],
  'Hogar y Muebles': ['silla', 'mesa', 'cama', 'sofa', 'sofá', 'mueble', 'comedor', 'nevera', 'licuadora', 'lavadora', 'colchon', 'lampara', 'escritorio'],
  'Moda y Calzado': ['zapato', 'zapatos', 'nike', 'adidas', 'camisa', 'pantalon', 'pantalón', 'vestido', 'chaqueta', 'franela', 'botas', 'reloj', 'lentes', 'gorra', 'ropa'],
  'Ferretería y Construcción': ['taladro', 'martillo', 'destornillador', 'cemento', 'pintura', 'tubo', 'llave', 'clavo', 'madera', 'lija', 'sierra', 'herramienta']
};

const autoDetectCategory = (query) => {
  const lowerQuery = query.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      return category;
    }
  }
  return null;
};

export default function SearchPage() {
  const { addSearch, user, socket, activeSearch, setActiveSearch, buyerOffers, setBuyerOffers, catalogProducts, loyaltyPoints, buyerOrders, logout, notifications, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const initQuery = location.state?.query || '';
  const initCategory = location.state?.category || '';

  const [query, setQuery] = useState(initQuery);
  const [selectedCategory, setSelectedCategory] = useState(initCategory || 'Tecnología y Móviles');
  const [radius, setRadius] = useState(3);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [checkoutOffer, setCheckoutOffer] = useState(null);
  const [checkoutMethod, setCheckoutMethod] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [partnerInfo, setPartnerInfo] = useState(null);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if ((initQuery || initCategory) && !activeSearch) {
      const q = initQuery || initCategory;
      const cat = autoDetectCategory(q) || initCategory || 'Tecnología y Móviles';
      setSelectedCategory(cat);
      setActiveSearch(q);
      addSearch(q, cat, `${radius}km`);
    }
  }, [initQuery, initCategory]);

  useEffect(() => {
    if (socket && user && activeSearch) {
      const handleNewMessage = (msg) => {
        if (msg.receiverId === user.id && msg.text.startsWith('[OFERTA]')) {
          try {
            const offerData = JSON.parse(msg.text.replace('[OFERTA] ', ''));
            setBuyerOffers(prev => {
              if (prev.find(o => o.id === msg.senderId)) return prev;
              return [...prev, {
                id: msg.senderId,
                sellerName: `Vendedor ID: ${msg.senderId}`,
                price: offerData.price,
                condition: offerData.condition || 'Acordado',
                delivery: offerData.delivery || 'Acordar con vendedor',
                rating: 'N/A',
                message: offerData.description
              }];
            });
          } catch (e) {
            console.error('Error parseando oferta', e);
          }
        }
      };
      
      socket.on('receive_message', handleNewMessage);
      return () => socket.off('receive_message', handleNewMessage);
    }
  }, [socket, user, activeSearch]);

  useEffect(() => {
    if (checkoutOffer) {
      const fetchPartnerInfo = async () => {
        try {
          const res = await api.get(`/users/${checkoutOffer.id}`);
          setPartnerInfo(res.data);
        } catch (e) {
          console.error("Error fetching partner info", e);
        }
      };
      fetchPartnerInfo();
    } else {
      setPartnerInfo(null);
    }
  }, [checkoutOffer]);

  useEffect(() => {
    if (!activeSearch) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      let finalCategory = selectedCategory;
      const detected = autoDetectCategory(query);
      if (detected && detected !== selectedCategory) {
        finalCategory = detected;
        setSelectedCategory(detected);
      }

      setBuyerOffers([]); 
      setActiveSearch(query);
      const expiresAt = new Date(Date.now() + 30 * 60000).toISOString(); // 30 minutos por defecto
      addSearch(query, finalCategory, `${radius}km`, expiresAt);
    }
  };

  const handleCategoryClick = (category) => {
    setQuery(category);
    setSelectedCategory(category);
    setBuyerOffers([]); 
    setActiveSearch(category);
    const expiresAt = new Date(Date.now() + 30 * 60000).toISOString(); // 30 minutos por defecto
    addSearch(category, category, `${radius}km`, expiresAt);
  };

  const handleOpenChat = (offer) => {
    navigate(`/chat/${offer.id}`);
  };

  const handleAcceptOffer = async (offer) => {
    try {
      let finalItem = activeSearch;
      if (checkoutMethod === 'delivery' && deliveryAddress) {
        finalItem += `|||DELIVERY_INFO|||${JSON.stringify({ address: deliveryAddress, phone: deliveryPhone, note: deliveryNote })}`;
      }
      const res = await api.post('/orders', {
        item: finalItem,
        price: offer.price,
        sellerId: offer.id
      });
      navigate(`/payment/${res.data.id}`, { state: { price: offer.price } });
    } catch (err) {
      console.error(err);
      alert('Error procesando compra');
    }
  };

  const requestDeliveryQuote = () => {
    if (checkoutMethod === 'delivery' && !deliveryAddress.trim()) {
      alert("Por favor ingresa tu dirección");
      return;
    }

    if (checkoutMethod === 'pickup') {
      handleAcceptOffer(checkoutOffer);
      setCheckoutOffer(null);
      return;
    }

    const newMsg = {
      id: Date.now().toString(),
      text: `[SOLICITUD_DELIVERY] ${JSON.stringify({ price: checkoutOffer.price, description: checkoutOffer.message, items: [], address: deliveryAddress, phone: deliveryPhone, note: deliveryNote })}`,
      senderId: user.id,
      receiverId: checkoutOffer.id,
      createdAt: new Date()
    };

    if (socket) socket.emit('send_message', newMsg);
    setCheckoutOffer(null);
    setDeliveryAddress('');
    setDeliveryPhone('');
    setDeliveryNote('');
    navigate(`/chat/${checkoutOffer.id}`);
  };

  const categories = [
    { name: 'Tecnología y Móviles', icon: <Smartphone size={28} /> },
    { name: 'Hogar y Muebles', icon: <Home size={28} /> },
    { name: 'Moda y Calzado', icon: <Shirt size={28} /> },
    { name: 'Ferretería y Construcción', icon: <Wrench size={28} /> }
  ];
  // Si no hay búsqueda activa ni parámetros iniciales, volver a inicio
  if (!activeSearch && !initQuery && !initCategory) {
    return <Navigate to="/" replace />;
  }

  // ==============================
  // VISTA: RADAR ACTIVO (BUSCANDO)
  // ==============================
  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem' }}>
      
      <button 
        onClick={() => { setActiveSearch(null); setBuyerOffers([]); navigate('/'); }} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem', padding: 0, width: 'fit-content' }}
      >
        <ArrowLeft size={20} /> Volver al Inicio
      </button>

      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(2,11,24,0.95) 100%)', borderRadius: '24px', padding: '3rem 2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0, 163, 224, 0.2)' }}>
        {/* Radar Background Effects */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: 'transparent', border: '1px solid rgba(0, 163, 224, 0.3)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'transparent', border: '1px solid rgba(0, 163, 224, 0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', animation: 'radarPulse 3s infinite ease-out' }}></div>

        <div style={{ width: 80, height: 80, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, boxShadow: '0 0 30px rgba(0, 163, 224, 0.6)', marginBottom: '1.5rem' }}>
          <Search size={36} color="white" />
        </div>
        
        <div style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem', fontWeight: '800' }}>
            Rastreando la mejor oferta para ti...
          </h2>
          <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {activeSearch}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Tu solicitud está viajando a una red de proveedores conectados en un radio de {radius}km. En breve recibirás las cotizaciones.
          </p>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap color="#f59e0b" fill="#f59e0b" size={20} /> Cotizaciones Recibidas ({buyerOffers.length})
        </h3>
        
        {buyerOffers.length === 0 ? (
          <div className="card-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', borderStyle: 'dashed' }}>
            <Clock size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Esperando a que las tiendas revisen su inventario...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {buyerOffers.map((offer, idx) => (
              <div key={idx} className="card-panel animate-slide-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--primary)', boxShadow: '0 4px 20px rgba(56, 189, 248, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>{offer.sellerName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      <ShieldCheck size={14} /> Tienda Verificada
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    ${offer.price}
                  </div>
                </div>
                
                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Condición: {offer.condition}</span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Entrega: {offer.delivery}</span>
                  </div>
                  "{offer.message}"
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button onClick={() => {
                    setBuyerOffers(prev => prev.filter(o => o.id !== offer.id));
                    if (socket && user) {
                      socket.emit('send_message', {
                        text: '[SISTEMA] El comprador ha declinado esta cotización.',
                        senderId: user.id,
                        receiverId: offer.id
                      });
                    }
                  }} className="btn-secondary hover-scale" style={{ padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444', borderColor: '#fca5a5', background: '#fef2f2' }} title="Descartar y ocultar">
                    <X size={18} />
                  </button>
                  <button onClick={() => handleOpenChat(offer)} className="btn-secondary hover-scale" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageCircle size={18} /> Chat
                  </button>
                  <button onClick={() => setCheckoutOffer(offer)} className="btn-primary hover-scale" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart size={18} /> Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      {checkoutOffer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="animate-slide-up" style={{ background: 'var(--bg-panel)', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '700' }}>Opciones de Entrega</h3>
              <button onClick={() => setCheckoutOffer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '16px' }}>
                <button 
                  onClick={() => setCheckoutMethod('delivery')}
                  style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: checkoutMethod === 'delivery' ? '#ffffff' : 'transparent', color: checkoutMethod === 'delivery' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: checkoutMethod === 'delivery' ? '700' : '500', boxShadow: checkoutMethod === 'delivery' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  Envío a Domicilio
                </button>
                <button 
                  onClick={() => setCheckoutMethod('pickup')}
                  style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: checkoutMethod === 'pickup' ? '#ffffff' : 'transparent', color: checkoutMethod === 'pickup' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: checkoutMethod === 'pickup' ? '700' : '500', boxShadow: checkoutMethod === 'pickup' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  Retiro en Tienda
                </button>
              </div>

              {checkoutMethod === 'delivery' ? (
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

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '16px', fontSize: '0.7rem', fontWeight: 'bold' }}>i</span>
                    El vendedor te enviará el costo del delivery para que lo apruebes.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-main)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>📍 Dirección de Retiro:</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {partnerInfo ? partnerInfo.address || 'Dirección no disponible' : 'Cargando...'}
                  </p>
                </div>
              )}

              <button 
                onClick={requestDeliveryQuote}
                style={{ width: '100%', background: 'var(--text-main)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s', marginTop: '0.5rem' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--text-main)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--text-main)'}
              >
                {checkoutMethod === 'pickup' ? 'Ir a Pagar' : 'Solicitar Costo de Envío'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .radar-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .hover-scale { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-scale:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }

        .svc-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
        .svc-card {
          background: var(--bg-panel);
          backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-color); border-radius: 16px;
          box-shadow: var(--shadow-md); padding: 1.5rem 1.4rem;
          display: flex; flex-direction: column; min-height: 210px; cursor: pointer;
          transition: var(--transition-smooth);
        }
        .svc-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md), var(--shadow-glow); }
        .svc-hi {
          background: linear-gradient(150deg, #00a3e0, #0079b0);
          border-color: transparent;
          box-shadow: 0 20px 40px -12px rgba(0,163,224,0.5);
        }
        @media (max-width: 950px) { .svc-cards { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) {
          .svc-cards { grid-template-columns: 1fr; }
          .svc-card { min-height: 0; }
          .pub-nav-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}
