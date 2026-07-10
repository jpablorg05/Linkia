import React, { useState, useEffect } from 'react';
import { Search, MapPin, Zap, ArrowLeft, Clock, ShieldCheck, MessageCircle, Star, Smartphone, Home, Shirt, Wrench, ShoppingCart, Store, ChevronRight, X, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
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
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tecnología y Móviles');
  const [radius, setRadius] = useState(3);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [checkoutOffer, setCheckoutOffer] = useState(null);
  const [checkoutMethod, setCheckoutMethod] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [partnerInfo, setPartnerInfo] = useState(null);
  
  const { addSearch, user, socket, activeSearch, setActiveSearch, buyerOffers, setBuyerOffers, catalogProducts } = useAppContext();
  const navigate = useNavigate();

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

  const featuredStores = [
    { id: 2, name: 'Tech Store Plus', rating: '4.9', type: 'Electrónica' },
    { id: 3, name: 'Moda Universal', rating: '4.8', type: 'Ropa y Accesorios' },
    { id: 4, name: 'Ferretería El Constructor', rating: '4.9', type: 'Herramientas' },
    { id: 5, name: 'Hogar Confort', rating: '4.7', type: 'Muebles' },
  ];

  // ==============================
  // VISTA: DASHBOARD PRINCIPAL
  // ==============================
  if (!activeSearch) {
    return (
      <div className="animate-slide-up" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* HERO CAROUSEL */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow-md)', transition: 'all 0.5s ease' }}>
          
          {/* Dynamic Background Effects */}
          <div style={{ position: 'absolute', top: -50, right: currentSlide === 0 ? -50 : (currentSlide === 1 ? '50%' : '10%'), width: 300, height: 300, background: currentSlide === 1 ? '#10b981' : 'var(--primary)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', transition: 'all 1s ease' }}></div>
          <div style={{ position: 'absolute', bottom: -50, left: currentSlide === 2 ? -50 : (currentSlide === 0 ? '10%' : '50%'), width: 300, height: 300, background: currentSlide === 2 ? '#f59e0b' : '#8b5cf6', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', transition: 'all 1s ease' }}></div>
          
          <div style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3.2rem', fontWeight: '900', color: 'white', marginBottom: '1rem', letterSpacing: '-1px', zIndex: 1, animation: 'fadeIn 0.5s ease-out' }} key={`title-${currentSlide}`}>
              {currentSlide === 0 && 'El Mercado Inteligente'}
              {currentSlide === 1 && 'Envíos Gratis Hoy 🚚'}
              {currentSlide === 2 && 'Compra con Confianza 🛡️'}
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', marginBottom: '3rem', zIndex: 1, animation: 'fadeIn 0.7s ease-out' }} key={`desc-${currentSlide}`}>
              {currentSlide === 0 && 'Conecta directamente con cientos de mayoristas y tiendas. Consigue el mejor precio sin intermediarios.'}
              {currentSlide === 1 && 'Aprovecha delivery sin costo en cientos de productos seleccionados de Tecnología y Hogar.'}
              {currentSlide === 2 && 'Todas nuestras tiendas oficiales están verificadas. Garantía y soporte directo del proveedor.'}
            </p>
          </div>

          {/* Carousel Indicators */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', zIndex: 1 }}>
            {[0, 1, 2].map(idx => (
              <div key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: currentSlide === idx ? '24px' : '8px', height: '8px', borderRadius: '4px', background: currentSlide === idx ? 'var(--primary)' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s ease', cursor: 'pointer' }}></div>
            ))}
          </div>

          {/* MAIN RADAR SEARCH */}
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '750px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ flex: 1, background: 'transparent', color: 'white', border: 'none', outline: 'none', padding: '0.5rem', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }}>
                <option value="Tecnología y Móviles" style={{color: 'var(--text-main)'}}>📱 Tecnología y Móviles</option>
                <option value="Hogar y Muebles" style={{color: 'var(--text-main)'}}>🏠 Hogar y Muebles</option>
                <option value="Moda y Calzado" style={{color: 'var(--text-main)'}}>👕 Moda y Calzado</option>
                <option value="Ferretería y Construcción" style={{color: 'var(--text-main)'}}>🔧 Ferretería y Construcción</option>
              </select>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
              
              <button type="button" onClick={() => setShowMapModal(true)} style={{ flex: 1, background: 'transparent', color: 'white', border: 'none', outline: 'none', padding: '0.5rem', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: '500' }}>
                <MapPin size={18} color="var(--primary)" /> Radio: {radius} km
              </button>
            </div>

            <div style={{ position: 'relative', flex: 1, display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Search size={22} color="var(--primary)" />
                  <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }}></div>
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: iPhone 15 Pro Max, Zapatos Nike..." 
                  style={{ width: '100%', padding: '1.4rem 1.4rem 1.4rem 4.5rem', fontSize: '1.15rem', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.08)', color: 'white', outline: 'none', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0 2.5rem', fontSize: '1.1rem', borderRadius: '16px', boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' }}>
                Buscar <Zap size={20} />
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', zIndex: 1, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={18} color="#10b981" /> Compras Protegidas</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} color="var(--primary)" /> Respuestas Rápidas</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={18} color="#f59e0b" /> Vendedores Verificados</span>
          </div>
        </div>

        {/* QUICK CATEGORIES (Horizontal Slider) */}
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1rem' }}>Explorar Categorías</h2>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {categories.map((cat, idx) => (
              <div key={idx} onClick={() => handleCategoryClick(cat.name)} className="card-panel" style={{ minWidth: '160px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'center', borderRadius: '20px' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '1.2rem', borderRadius: '50%', color: 'var(--primary)', transition: 'all 0.3s ease' }}>
                  {cat.icon}
                </div>
                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TENDENCIAS EN TU ZONA */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="#f59e0b" fill="#f59e0b" /> Tendencias cerca de ti
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {['PlayStation 5 Slim', 'Smart TV Samsung 65"', 'Aire Acondicionado 12000 BTU', 'Zapatos Nike Air Max'].map((trend, idx) => (
              <div key={idx} onClick={() => setQuery(trend)} className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', borderRadius: '16px' }}>
                <div style={{ background: 'var(--bg-main)', padding: '0.6rem', borderRadius: '10px', color: 'var(--text-muted)' }}>
                  <TrendingUp size={18} />
                </div>
                <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{trend}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TIENDAS OFICIALES */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store color="var(--primary)" /> Tiendas Oficiales
            </h2>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Ver todas <ChevronRight size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {featuredStores.map(store => (
              <div key={store.id} onClick={() => navigate(`/store/${store.id}`)} className="card-panel hover-scale" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'var(--bg-main)' }}></div>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', zIndex: 1, border: '4px solid var(--bg-panel)', marginBottom: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  {store.name.charAt(0)}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{store.name}</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{store.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <Star size={12} fill="#d97706" /> {store.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OFERTAS CON ENVÍO INMEDIATO (Del Catálogo Fijo) */}
        {catalogProducts && catalogProducts.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap color="#f59e0b" fill="#f59e0b" /> Envíos Inmediatos (Full)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {catalogProducts.slice(0, 4).map(product => (
                <div key={product.id} className="card-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ height: '140px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '12px', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                      <ShoppingCart size={30} color="var(--primary)" />
                    </div>
                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#10b981', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                      STOCK
                    </span>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{product.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.desc}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)' }}>${product.price}</span>
                      <button onClick={() => navigate('/payment/mock', { state: { price: product.price } })} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL DEL MAPA RADAR */}
        {showMapModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <div className="card-panel animate-slide-up" style={{ width: '90%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-panel)' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: 0 }}>Configurar Área de Búsqueda</h3>
              
              <div style={{ position: 'relative', width: '100%', height: '250px', background: 'var(--border-color)', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Mock Map Background */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Radar Circle */}
                <div style={{ width: `${Math.max(50, radius * 8)}px`, height: `${Math.max(50, radius * 8)}px`, background: 'rgba(56, 189, 248, 0.2)', border: '2px solid var(--primary)', borderRadius: '50%', position: 'absolute', transition: 'all 0.3s' }}></div>
                <div className="radar-ping" style={{ width: `${Math.max(50, radius * 8)}px`, height: `${Math.max(50, radius * 8)}px`, background: 'var(--primary)', borderRadius: '50%', position: 'absolute', opacity: 0.2 }}></div>
                
                <div style={{ width: 20, height: 20, background: 'var(--primary)', borderRadius: '50%', position: 'relative', zIndex: 1, boxShadow: '0 0 15px var(--primary)' }}></div>
                <div style={{ position: 'absolute', bottom: 10, background: 'var(--bg-main)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  Mi Ubicación Actual
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Radio de búsqueda</label>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{radius} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={radius} 
                  onChange={(e) => setRadius(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span>Caminando (1km)</span>
                  <span>Ciudad (50km)</span>
                </div>
              </div>

              <button onClick={() => setShowMapModal(false)} className="btn-primary" style={{ padding: '1rem', width: '100%' }}>
                Confirmar Ubicación
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==============================
  // VISTA: RADAR ACTIVO (BUSCANDO)
  // ==============================
  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      <button 
        onClick={() => { setActiveSearch(null); setQuery(''); setBuyerOffers([]); }} 
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
      `}</style>
    </div>
  );
}
