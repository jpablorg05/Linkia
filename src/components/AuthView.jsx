import React, { useState } from 'react';
import { PackageSearch, ArrowRight, ShieldCheck, UserPlus, Store } from 'lucide-react';

export default function AuthView({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState('buyer'); // 'buyer' o 'seller'

  const handleAuth = (e) => {
    e.preventDefault();
    onLogin(accountType);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)' }}>
      
      {/* Auth Header - Clean Amazon Style */}
      <header style={{ borderBottom: '1px solid #d5d9d9', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#131921' }}>
          <PackageSearch size={32} />
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>Linkia</h1>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '2rem 1rem' }}>
        
        {/* Main Auth Container */}
        <div style={{ width: '100%', maxWidth: isLogin ? '350px' : '600px' }}>
          
          <div className="card-panel" style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 400 }}>
              {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>

            {/* Selector de cuenta para Registro */}
            {!isLogin && (
              <div style={{ marginBottom: '2rem' }}>
                <label className="input-label" style={{ marginBottom: '0.8rem' }}>¿Cómo deseas usar Linkia?</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label 
                    style={{ 
                      flex: 1, 
                      padding: '1rem', 
                      border: accountType === 'buyer' ? '2px solid #e77600' : '1px solid #d5d9d9', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      background: accountType === 'buyer' ? '#fdf8f4' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="accountType" 
                      checked={accountType === 'buyer'} 
                      onChange={() => setAccountType('buyer')} 
                      style={{ accentColor: '#e77600' }}
                    />
                    <UserPlus size={20} color={accountType === 'buyer' ? '#e77600' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: accountType === 'buyer' ? '700' : '500', fontSize: '0.9rem' }}>Comprar repuestos</span>
                  </label>
                  
                  <label 
                    style={{ 
                      flex: 1, 
                      padding: '1rem', 
                      border: accountType === 'seller' ? '2px solid #e77600' : '1px solid #d5d9d9', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      background: accountType === 'seller' ? '#fdf8f4' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="accountType" 
                      checked={accountType === 'seller'} 
                      onChange={() => setAccountType('seller')} 
                      style={{ accentColor: '#e77600' }}
                    />
                    <Store size={20} color={accountType === 'seller' ? '#e77600' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: accountType === 'seller' ? '700' : '500', fontSize: '0.9rem' }}>Vender como Empresa</span>
                  </label>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth}>
              
              {/* Campos comunes de Login */}
              {isLogin ? (
                <>
                  <div>
                    <label className="input-label">Dirección de e-mail o número de teléfono</label>
                    <input type="email" required className="input-field" autoFocus />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label className="input-label">Contraseña</label>
                      <a href="#" style={{ fontSize: '0.8rem' }}>¿Olvidaste tu contraseña?</a>
                    </div>
                    <input type="password" required className="input-field" />
                  </div>
                </>
              ) : (
                /* Formularios de Registro (Buyer vs Seller) */
                <div style={{ display: 'grid', gridTemplateColumns: accountType === 'seller' ? '1fr 1fr' : '1fr', gap: '0 1rem' }}>
                  
                  {accountType === 'buyer' ? (
                    <>
                      <div>
                        <label className="input-label">Tu nombre y apellido</label>
                        <input type="text" required placeholder="Ej: Carlos Martínez" className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Correo electrónico</label>
                        <input type="email" required className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Contraseña</label>
                        <input type="password" required placeholder="Al menos 6 caracteres" className="input-field" />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '-0.8rem', marginBottom: '1rem' }}>
                          ℹ️ La contraseña debe tener al menos 6 caracteres.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Vendedor - Columna Izquierda */}
                      <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShieldCheck size={18} color="#007185" /> Información Legal y de Contacto
                        </h3>
                      </div>
                      
                      <div>
                        <label className="input-label">Razón Social / Nombre Comercial</label>
                        <input type="text" required placeholder="Ej: Repuestos XYZ C.A." className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">RIF / RUT / Tax ID</label>
                        <input type="text" required placeholder="Documento de identidad fiscal" className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Correo Corporativo</label>
                        <input type="email" required className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Teléfono Comercial</label>
                        <input type="tel" required placeholder="+1 234 567 8900" className="input-field" />
                      </div>

                      <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem' }}>Detalles de la Operación</h3>
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Categorías Principales</label>
                        <input type="text" required placeholder="Ej: Baterías, Aceites, Herramientas pesadas" className="input-field" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Dirección Física</label>
                        <input type="text" required placeholder="Av. Principal, Edificio Central, Local 4" className="input-field" />
                      </div>
                      
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="input-label">Contraseña de acceso</label>
                        <input type="password" required className="input-field" />
                      </div>
                    </>
                  )}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.7rem', fontSize: '1rem', marginTop: '0.5rem', boxShadow: '0 2px 5px rgba(213,217,217,0.5)' }}>
                {isLogin ? 'Iniciar sesión' : (accountType === 'seller' ? 'Crear cuenta de empresa' : 'Crea tu cuenta de Linkia')}
              </button>

              <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                Al {isLogin ? 'iniciar sesión' : 'crear una cuenta'}, aceptas las <a href="#">Condiciones de Uso</a> y el <a href="#">Aviso de Privacidad</a> de Linkia.
              </div>

            </form>
          </div>

          {/* Separador y botón de alternancia */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#767676', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#d5d9d9' }}></div>
              <span style={{ padding: '0 10px' }}>{isLogin ? '¿Eres nuevo en Linkia?' : '¿Ya tienes una cuenta?'}</span>
              <div style={{ flex: 1, height: '1px', background: '#d5d9d9' }}></div>
            </div>
            
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="btn-secondary" 
              style={{ width: '100%', padding: '0.7rem', background: 'var(--bg-main)' }}
            >
              {isLogin ? 'Crea tu cuenta de Linkia' : 'Inicia sesión'}
            </button>
          </div>

        </div>
      </div>

      <footer style={{ borderTop: '1px solid #eee', padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: '#fdfdfd' }}>
        <p>© 2026 Linkia Inc. o sus afiliados.</p>
      </footer>
    </div>
  );
}
