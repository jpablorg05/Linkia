import React, { useState } from 'react';
import { PackageSearch, ShieldCheck, User, Store, Mail, Lock, Building2, Hash, Phone, Tag, MapPin, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState('buyer'); // 'buyer' o 'seller'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', rif: '', categories: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAppContext();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loggedUser;
      if (isLogin) {
        loggedUser = await login({ email: formData.email, password: formData.password });
      } else {
        loggedUser = await register(accountType, formData);
      }
      const actualRole = loggedUser?.role || accountType;
      navigate(actualRole === 'buyer' ? '/search' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-main)' }}>
      
      {/* LADO IZQUIERDO: Branding (Oculto en móviles) */}
      <div className="auth-branding" style={{ flex: 1, display: 'none', '@media (minWidth: 768px)': { display: 'flex' }, background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', position: 'relative', overflow: 'hidden', padding: '4rem', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
        
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-15%', left: '-15%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }}></div>

        <div style={{ zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '4rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <PackageSearch size={32} color="#fff" />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>Linkia</h1>
          </div>

          <div className="animate-slide-up">
            <h2 style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
              {isLogin ? 'Bienvenido de\nnuevo.' : 'Transforma tu\nforma de operar.'}
            </h2>
            <p style={{ fontSize: '1.2rem', opacity: 0.85, lineHeight: 1.6, maxWidth: '400px' }}>
              {isLogin 
                ? 'Accede a tu panel de control y continúa conectando empresas y clientes de forma inteligente.' 
                : 'Únete a la plataforma B2B/B2C más moderna. Escala tus ventas, gestiona tus clientes y optimiza tus procesos.'}
            </p>
          </div>
        </div>

        <div style={{ zIndex: 10, display: 'flex', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.2rem 0' }}>5k+</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>Empresas Activas</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.2rem 0' }}>1M+</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>Transacciones</p>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Formulario */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', position: 'relative' }}>
        
        {/* Cabecera Móvil (Solo visible en móviles) */}
        <div className="auth-mobile-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>
          <PackageSearch size={28} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Linkia</h1>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
              {isLogin ? 'Ingresa tus credenciales para acceder a tu cuenta.' : 'Completa tus datos para empezar en Linkia.'}
            </p>
          </div>

          {error && (
            <div className="animate-slide-up" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem 1.2rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <ShieldCheck size={20} />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>
                Tipo de Cuenta
              </label>
              
              {/* Segmented Control */}
              <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <button 
                  type="button"
                  onClick={() => setAccountType('buyer')}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: accountType === 'buyer' ? 'var(--bg-panel)' : 'transparent', color: accountType === 'buyer' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: accountType === 'buyer' ? '700' : '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: accountType === 'buyer' ? 'var(--shadow-sm)' : 'none' }}
                >
                  <User size={18} /> Comprador
                </button>
                <button 
                  type="button"
                  onClick={() => setAccountType('seller')}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: accountType === 'seller' ? 'var(--bg-panel)' : 'transparent', color: accountType === 'seller' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: accountType === 'seller' ? '700' : '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: accountType === 'seller' ? 'var(--shadow-sm)' : 'none' }}
                >
                  <Store size={18} /> Empresa
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {isLogin ? (
              <>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> Correo Electrónico</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="ejemplo@correo.com" autoFocus />
                </div>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}><Lock size={14} /> Contraseña</label>
                    <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>¿Olvidaste tu contraseña?</a>
                  </div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" style={{ marginBottom: 0, marginTop: '0.5rem' }} placeholder="••••••••" />
                </div>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: accountType === 'seller' ? '1fr 1fr' : '1fr', gap: '1.2rem 1rem' }}>
                {accountType === 'buyer' ? (
                  <>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> Nombre Completo</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="Juan Pérez" />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> Correo Electrónico</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="juan@correo.com" />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={14} /> Contraseña</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="••••••••" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Building2 size={14} /> Razón Social / Comercial</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="Mi Empresa C.A." />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Hash size={14} /> RIF / RUT</label>
                      <input type="text" name="rif" value={formData.rif} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="J-12345678-9" />
                    </div>
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={14} /> Teléfono Comercial</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="+58 414 123 4567" />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> Correo Corporativo</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="contacto@miempresa.com" />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Tag size={14} /> Categorías Principales</label>
                      <input type="text" name="categories" value={formData.categories} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="Ej: Tecnología, Moda, Hogar" />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> Dirección Física</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="Av. Principal, Edificio Central" />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={14} /> Contraseña de Acceso</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" style={{ marginBottom: 0 }} placeholder="••••••••" />
                    </div>
                  </>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '1rem', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Crear Cuenta')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya eres parte de Linkia?'}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'none' }}
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
              </button>
            </p>
          </div>

        </div>
      </div>
      
      {/* Estilos específicos para la vista Auth para Media Queries (Móvil) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .auth-branding { display: none !important; }
          .auth-mobile-header { display: flex !important; }
        }
        @media (min-width: 769px) {
          .auth-mobile-header { display: none !important; }
        }
      `}} />
    </div>
  );
}
