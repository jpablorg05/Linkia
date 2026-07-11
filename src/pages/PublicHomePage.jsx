import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { PackageSearch, Search, Zap, ShieldCheck, Clock, Star, Store, TrendingUp, Smartphone, Home, Shirt, Wrench, ShoppingCart, Moon, Sun, Send, Tag, LayoutGrid, ArrowRight, Bell, User, LogOut, ShoppingBag, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// ===== Paleta Williams Racing 2024 =====
const CYAN = '#00a3e0';
const NAVY = '#041e42';

const categories = [
  { name: 'Tecnología y Móviles', icon: <Smartphone size={26} /> },
  { name: 'Hogar y Muebles', icon: <Home size={26} /> },
  { name: 'Moda y Calzado', icon: <Shirt size={26} /> },
  { name: 'Ferretería y Construcción', icon: <Wrench size={26} /> },
];

const featuredStores = [
  { id: 2, name: 'Tech Store Plus', rating: '4.9', type: 'Electrónica' },
  { id: 3, name: 'Moda Universal', rating: '4.8', type: 'Ropa y Accesorios' },
  { id: 4, name: 'Ferretería El Constructor', rating: '4.9', type: 'Herramientas' },
  { id: 5, name: 'Hogar Confort', rating: '4.7', type: 'Muebles' },
];

const trends = ['PlayStation 5 Slim', 'Smart TV Samsung 65"', 'Aire Acondicionado 12000 BTU', 'Zapatos Nike Air Max'];

const steps = [
  { n: '01', icon: <Search size={20} />, title: 'Pide lo que buscas', desc: 'Describe el producto que necesitas y tu zona. No recorres estantes: tú pides.' },
  { n: '02', icon: <Zap size={20} />, title: 'Recibe ofertas', desc: 'Las tiendas cercanas compiten y te envían sus mejores cotizaciones al instante.' },
  { n: '03', icon: <ShoppingCart size={20} />, title: 'Elige y compra', desc: 'Comparas precio, condición y entrega. Aceptas la mejor y pagas protegido.' },
];

export default function PublicHomePage() {
  const { user, catalogProducts, theme, toggleTheme, logout, notifications, loyaltyPoints, buyerOrders } = useAppContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  const isSeller = user?.role === 'seller';

  const requireAuth = (payload) => {
    if (!user) navigate('/auth', payload ? { state: { intent: payload } } : undefined);
    else if (isSeller) navigate('/dashboard');
    else if (payload?.query) navigate('/search', { state: { query: payload.query } });
    else if (payload?.category) navigate('/search', { state: { category: payload.category } });
    else navigate('/orders');
  };
  const handleSearch = (e) => { e.preventDefault(); requireAuth(query.trim() ? { query: query.trim() } : null); };
  const scrollToHow = () => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const serviceCards = [
    { hi: true, title: 'Solicita un producto', desc: 'Escribe lo que necesitas y recibe ofertas de tiendas cercanas en minutos.', cta: 'Empezar', onClick: () => requireAuth() },
    { title: 'Tiendas oficiales', desc: 'Marcas verificadas con garantía y respuesta directa del proveedor.', cta: 'Ver más', onClick: () => requireAuth() },
    { title: 'Cómo funciona', desc: 'Pides, las tiendas compiten, tú eliges la mejor oferta y pagas protegido.', cta: 'Ver más', onClick: scrollToHow },
    { title: 'Vende en Linkia', desc: '¿Tienes un negocio? Recibe solicitudes de clientes y cotiza al instante.', cta: 'Ver más', onClick: () => navigate('/auth') },
  ];

  const publicNavLinks = [['Inicio', () => navigate('/')], ['Categorías', () => requireAuth()], ['Cómo funciona', scrollToHow], ['Tiendas', () => requireAuth()]];
  const buyerNavLinks = [['Tiendas', () => navigate('/store/2')], ['Club Linkia', () => navigate('/rewards')], ['Pedidos', () => navigate('/orders')], ['Historial', () => navigate('/history')], ['Chat', () => navigate('/inbox')]];
  
  const navLinks = user?.role === 'buyer' ? buyerNavLinks : publicNavLinks;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>

      {/* ============ HERO A PANTALLA COMPLETA ============ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(120deg, ${NAVY} 0%, #062a52 45%, #0a4d86 130%)`, color: '#fff' }}>
        {/* Textura + luces */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: -100, right: '6%', width: 420, height: 420, background: CYAN, filter: 'blur(140px)', opacity: 0.4, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: 40, left: '-4%', width: 360, height: 360, background: '#2dd4bf', filter: 'blur(150px)', opacity: 0.22, borderRadius: '50%' }} />

        {/* NAV translúcida sobre el hero */}
        <nav style={{ position: 'relative', zIndex: 3, maxWidth: '1240px', margin: '0 auto', padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <PackageSearch color={CYAN} size={26} />
            <span style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Linkia</span>
          </div>
          <div className="pub-nav-links" style={{ display: 'flex', gap: '1.6rem', margin: '0 auto' }}>
            {navLinks.map(([label, fn]) => (
              <button key={label} onClick={fn} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.82)', fontSize: '0.92rem', fontWeight: '500', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button onClick={toggleTheme} title="Tema" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isSeller ? (
              <button onClick={() => navigate('/dashboard')} style={{ background: CYAN, color: NAVY, border: 'none', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', padding: '0.55rem 1.1rem', borderRadius: '8px' }}>← Mi panel</button>
            ) : user?.role === 'buyer' ? (
              <>
                <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: 'none', background: 'rgba(14, 165, 233, 0.2)', padding: '0.3rem 0.7rem', borderRadius: '20px', color: '#38bdf8', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }} title="Tus pedidos">
                  <ShoppingBag size={14} /> {buyerOrders?.length || 0}
                </button>
                <button onClick={() => navigate('/rewards')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: 'none', background: 'rgba(245, 158, 11, 0.2)', padding: '0.3rem 0.7rem', borderRadius: '20px', color: '#fbbf24', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }} title="Club Linkia">
                  <Award size={14} /> {loyaltyPoints}
                </button>
                <button onClick={() => navigate('/history')} style={{ position: 'relative', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                  <Bell size={20} />
                  {notifications?.length > 0 && (
                    <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', fontSize: '0.6rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {notifications.length}
                    </span>
                  )}
                </button>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: '#fff' }} onClick={() => navigate('/profile')}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#00a3e0', color: '#041e42', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem', display: 'flex' }} title="Cerrar sesión">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/auth')} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 0.6rem' }}>Ingresa</button>
                <button onClick={() => navigate('/auth')} style={{ background: CYAN, color: NAVY, border: 'none', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', padding: '0.55rem 1.1rem', borderRadius: '8px' }}>Crea tu cuenta</button>
              </>
            )}
          </div>
        </nav>

        {/* Contenido del hero (texto a la izquierda) */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1240px', margin: '0 auto', padding: '3.5rem 1.5rem 8rem' }}>
          <div style={{ maxWidth: 640 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: CYAN }}>Bienvenido a Linkia</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: '700', letterSpacing: '-2px', lineHeight: 1.02, margin: '1rem 0 0' }}>
              No busques entre estantes.<br /><span style={{ color: CYAN }}>Pide</span>, y las tiendas te cotizan.
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.85)', margin: '1.2rem 0 0', maxWidth: 520 }}>
              El marketplace al revés: escribe lo que necesitas y recibe ofertas de vendedores cerca de ti.
            </p>

            {/* Buscador CTA */}
            <form onSubmit={handleSearch} style={{ marginTop: '2rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', maxWidth: 560 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                <Search size={20} color={CYAN} style={{ position: 'absolute', left: 15 }} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="¿Qué producto necesitas?" style={{ width: '100%', padding: '0.95rem 1rem 0.95rem 3rem', fontSize: '1rem', borderRadius: '12px', border: 'none', background: 'transparent', color: '#fff', outline: 'none' }} />
              </div>
              <button type="submit" style={{ background: CYAN, color: NAVY, border: 'none', fontWeight: '700', fontSize: '1rem', padding: '0 1.8rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Solicitar <Zap size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.8rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontWeight: '500' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShieldCheck size={16} color="#34d399" /> Compras protegidas</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} color={CYAN} /> Respuestas rápidas</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Star size={16} color="#fbbf24" /> Vendedores verificados</span>
            </div>
          </div>
        </div>

        {/* ONDA divisoria */}
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '90px', display: 'block' }}>
          <path d="M0,64 C240,120 480,8 720,40 C960,72 1200,116 1440,60 L1440,120 L0,120 Z" fill="var(--bg-main)" />
        </svg>
      </section>

      {/* ============ CONTENIDO ============ */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>

        {/* Tarjetas de servicios solapadas (1ª resaltada) */}
        <div className="svc-cards" style={{ marginTop: '-4rem', position: 'relative', zIndex: 5 }}>
          {serviceCards.map((c) => (
            <div key={c.title} onClick={c.onClick} className={`svc-card${c.hi ? ' svc-hi' : ''}`}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: c.hi ? '#fff' : 'var(--text-main)' }}>{c.title}</h3>
              <p style={{ fontSize: '0.88rem', margin: '0.7rem 0 1.2rem', lineHeight: 1.5, color: c.hi ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}>{c.desc}</p>
              <button style={{ marginTop: 'auto', alignSelf: 'flex-start', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.35rem', background: c.hi ? '#fff' : CYAN, color: c.hi ? NAVY : '#fff' }}>
                {c.cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Categorías */}
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.2rem' }}>Explorar categorías</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {categories.map((cat) => (
              <div key={cat.name} onClick={() => requireAuth({ category: cat.name })} className="soft-card hoverable" style={{ padding: '1.6rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ background: 'rgba(0,163,224,0.1)', padding: '1.1rem', borderRadius: '50%', color: CYAN }}>{cat.icon}</div>
                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.92rem' }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" style={{ marginTop: '2.5rem', scrollMarginTop: '80px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.2rem' }}>¿Cómo funciona?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {steps.map((s) => (
              <div key={s.n} className="soft-card" style={{ padding: '1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(0,163,224,0.12)', color: CYAN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                  <span style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--border-color)', letterSpacing: '-1px' }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', margin: '0.9rem 0 0.3rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tendencias */}
        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="#f59e0b" fill="#f59e0b" size={22} /> Tendencias cerca de ti
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {trends.map((t) => (
              <div key={t} onClick={() => requireAuth({ query: t })} className="soft-card hoverable" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                <div style={{ background: 'var(--bg-main)', padding: '0.6rem', borderRadius: '10px', color: 'var(--text-muted)' }}><TrendingUp size={18} /></div>
                <span style={{ fontWeight: '500', fontSize: '0.92rem', color: 'var(--text-main)' }}>{t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tiendas oficiales */}
        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store color={CYAN} size={22} /> Tiendas oficiales
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
            {featuredStores.map((store) => (
              <div key={store.id} onClick={() => requireAuth()} className="soft-card hoverable" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ width: 62, height: 62, borderRadius: '50%', background: CYAN, color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', fontWeight: '700', marginBottom: '0.9rem' }}>
                  {store.name.charAt(0)}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.2rem' }}>{store.name}</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>{store.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                  <Star size={12} fill="#d97706" /> {store.rating}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Productos destacados */}
        {catalogProducts && catalogProducts.length > 0 && (
          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag color="#8b5cf6" size={22} /> Productos destacados
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.2rem' }}>
              {catalogProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="soft-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 130, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingCart size={30} color={CYAN} />}
                  </div>
                  <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{p.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>${Number(p.price).toFixed(2)}</span>
                      <button onClick={() => requireAuth({ query: p.name })} style={{ background: CYAN, color: NAVY, border: 'none', fontWeight: '700', padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>Comprar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA final */}
        {!user && (
          <section className="soft-card" style={{ marginTop: '2.5rem', padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: `linear-gradient(120deg, ${NAVY}, #0a3a6b)`, border: 'none' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '600', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Crea tu cuenta y empieza a pedir</h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', margin: 0, maxWidth: 460 }}>Es gratis. En segundos tendrás tiendas compitiendo por darte el mejor precio.</p>
            <button onClick={() => navigate('/auth')} style={{ background: CYAN, color: NAVY, border: 'none', fontWeight: '700', padding: '0.8rem 1.6rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>Crear cuenta <Send size={16} /></button>
          </section>
        )}

        <footer style={{ padding: '2rem 0 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          Linkia · El marketplace donde tú pides y las tiendas compiten.
        </footer>
      </div>

      <style>{`
        .soft-card {
          background: var(--bg-panel);
          backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-color); border-radius: 14px; box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }
        .hoverable:hover { transform: translateY(-4px); box-shadow: var(--shadow-md), var(--shadow-glow); border-color: rgba(0,163,224,0.4); }

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
          background: linear-gradient(150deg, ${CYAN}, #0079b0);
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
