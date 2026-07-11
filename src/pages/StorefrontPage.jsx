import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Store, ShieldCheck, Clock, MapPin, Star, Package, MessageSquare, ArrowLeft, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ModuleHero from '../components/ModuleHero';

export default function StorefrontPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sellerProfile, user, setBuyerOrders } = useAppContext();
  
  // In a real app, we would fetch the specific seller profile by 'id'
  // using an API call. For now, we simulate using the context.
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const getProductImage = (product, activeIdx = 0, isThumb = false) => {
    let imagesArr = [];
    if (product.images) {
      try {
        imagesArr = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      } catch(e) {}
    }
    
    let imgUrl = (imagesArr && imagesArr.length > 0) ? imagesArr[activeIdx] : product.image;
    
    if (!imgUrl || imgUrl.startsWith('blob:')) {
      const label = isThumb ? `${product.name} ${activeIdx + 1}` : product.name;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=0D8ABC&color=fff&size=400`;
    }
    return imgUrl;
  };

  useEffect(() => {
    // Simulando una carga de red
    setTimeout(() => {
      setProfile(sellerProfile);
      setLoading(false);
    }, 500);
  }, [sellerProfile, id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Error al obtener productos en storefront:", err);
      }
    };
    fetchProducts();
  }, [id]);

  const handleBuyProduct = async (product) => {
    try {
      const api = (await import('../services/api')).default;
      const res = await api.post('/orders', {
        item: product.name,
        price: product.price,
        sellerId: id || 2
      });
      navigate(`/payment/${res.data.id}`, { state: { price: product.price } });
    } catch (error) {
      alert('Error procesando pedido directo');
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}><div className="radar-pulse" style={{ width: 40, height: 40, background: 'var(--primary)' }} /></div>;
  }

  if (!profile) {
    return <div className="flex-center" style={{ height: '50vh' }}>No se encontró la tienda.</div>;
  }

  const isImmersive = user && ['buyer', 'seller'].includes(user.role);

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ModuleHero 
        eyebrow="Tienda Autorizada"
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {profile.storeName}
            <ShieldCheck size={28} color="var(--success)" title="Tienda Verificada" />
          </span>
        }
        subtitle={profile.slogan}
        iconName="default"
        fullBleed={isImmersive}
      >
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn-primary" onClick={() => navigate(`/chat/${id}`)}>
            <MessageSquare size={18} /> Contactar Empresa
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      </ModuleHero>

      <div style={{ flex: 1, padding: isImmersive ? '0 2rem 2rem' : '2rem', maxWidth: isImmersive ? 1200 : 'none', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Grid de Información */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Columna Principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card-panel" style={{ padding: '2rem', background: 'var(--bg-panel)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store size={20} color="var(--primary)" /> Sobre Nosotros
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem' }}>
              {profile.description}
            </p>
          </div>

          {/* Catálogo de Productos */}
          {products && products.length > 0 && (
            <div className="card-panel" style={{ padding: '2rem', background: 'var(--bg-panel)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} color="var(--primary)" /> Productos Destacados
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {products.map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => { setSelectedProduct(product); setActiveImageIdx(0); }}
                    style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {product.discount > 0 && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.75rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🔥 {product.discount}% OFF
                      </div>
                    )}
                    <div style={{ position: 'relative' }}>
                      <img src={getProductImage(product)} alt={product.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      {product.discount > 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px', background: 'linear-gradient(to top, rgba(239, 68, 68, 0.4), transparent)' }}></div>
                      )}
                    </div>
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{product.name}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {product.discount > 0 && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: '500' }}>
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: product.discount > 0 ? '#ef4444' : 'var(--primary)' }}>
                            ${product.discount > 0 ? (product.price * (1 - product.discount/100)).toFixed(2) : product.price.toFixed(2)}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock: {product.stock}</span>
                      </div>
                      {user?.role === 'buyer' && (
                        <button onClick={(e) => { e.stopPropagation(); handleBuyProduct(product); }} className="btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center' }}>
                          Comprar Ahora
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card-panel" style={{ padding: '2rem', background: 'var(--bg-panel)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} color="#f3d078" fill="#f3d078" /> Reseñas Destacadas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Mock Reviews */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.3rem', color: '#f3d078', marginBottom: '0.3rem' }}>
                  <Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" />
                </div>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.3rem' }}>Excelente servicio, repuesto original.</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Por Carlos G. - Hace 2 días</span>
              </div>
              <div>
                <div style={{ display: 'flex', gap: '0.3rem', color: '#f3d078', marginBottom: '0.3rem' }}>
                  <Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} />
                </div>
                <p style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.3rem' }}>Llegó rápido y bien empacado.</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Por María L. - Hace 1 semana</span>
              </div>
            </div>
          </div>

        </div>

        {/* Columna Lateral (Sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '12px' }}>
                <MapPin size={24} />
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Ubicación</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>Ciudad Central</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--accent)', color: 'white', padding: '0.8rem', borderRadius: '12px' }}>
                <Clock size={24} />
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Horario de Atención</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>{profile.businessHours}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--success)', color: 'white', padding: '0.8rem', borderRadius: '12px' }}>
                <Package size={24} />
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Políticas de Devolución</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>{profile.returnPolicy}</span>
              </div>
            </div>
          </div>

          <div className="card-panel" style={{ padding: '1.5rem', background: 'var(--bg-panel)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1' }}>
              4.8<span style={{ fontSize: '1.5rem', color: '#f3d078' }}>★</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Basado en 150 ventas exitosas a través de Linkia.</p>
          </div>

        </div>

      </div>

      {/* DETALLE DEL PRODUCTO MODAL */}
      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card-panel animate-slide-up" style={{ width: '100%', maxWidth: '800px', background: 'var(--bg-panel)', borderRadius: '24px', padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.2fr 1fr', position: 'relative', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            
            {/* Close Button */}
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', zIndex: 20, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-main)'}>
              <X size={18} />
            </button>

            {/* Left side: Images */}
            <div style={{ background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1rem', borderRight: '1px solid var(--border-color)', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '320px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', background: 'var(--bg-panel)' }}>
                <img 
                  src={getProductImage(selectedProduct, activeImageIdx)} 
                  alt={selectedProduct.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {selectedProduct.discount > 0 && (
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ef4444', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    🔥 {selectedProduct.discount}% OFF
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {((selectedProduct.images && typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images)?.length > 1) && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {(typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images).map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveImageIdx(idx)}
                      style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: activeImageIdx === idx ? '2px solid var(--primary)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.15s ease', opacity: activeImageIdx === idx ? 1 : 0.7 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => { if (activeImageIdx !== idx) e.currentTarget.style.opacity = 0.7; }}
                    >
                      <img src={getProductImage(selectedProduct, idx, true)} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Info */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Producto Destacado</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '850', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.2 }}>{selectedProduct.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', color: '#f3d078' }}>
                  <Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" /><Star size={16} fill="#f3d078" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.2rem' }}>(5.0 / 5)</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Descripción del Artículo</label>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  {selectedProduct.desc || 'No hay una descripción detallada disponible para este producto.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
                <div>
                  {selectedProduct.discount > 0 && (
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through', display: 'block', fontWeight: '500' }}>
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                  )}
                  <span style={{ fontSize: '2.2rem', fontWeight: '900', color: selectedProduct.discount > 0 ? '#ef4444' : 'var(--primary)', lineHeight: 1 }}>
                    ${selectedProduct.discount > 0 ? (selectedProduct.price * (1 - selectedProduct.discount/100)).toFixed(2) : selectedProduct.price.toFixed(2)}
                  </span>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: selectedProduct.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {selectedProduct.stock > 0 ? '✓ En Stock' : '✗ Agotado'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedProduct.stock} unidades disponibles</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: 'auto' }}>
                {user?.role === 'buyer' ? (
                  <>
                    <button 
                      onClick={() => { handleBuyProduct(selectedProduct); setSelectedProduct(null); }} 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
                    >
                      Comprar Ahora Directo
                    </button>
                    <button 
                      onClick={() => { navigate(`/chat/${id || 2}`); setSelectedProduct(null); }} 
                      className="btn-secondary" 
                      style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                    >
                      <MessageSquare size={18} /> Chatear con la Empresa
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.8rem', background: 'var(--bg-main)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Visualización en Modo Vendedor
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
      </div>
    </div>
  );
}
