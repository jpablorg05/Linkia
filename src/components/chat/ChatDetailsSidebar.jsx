import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Star, MapPin, Mail, Phone, Package, Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import api from '../../services/api';

export default function ChatDetailsSidebar({ partnerId, activeItemName }) {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    if (!partnerId) return;
    setLoading(true);
    
    Promise.all([
      api.get(`/users/${partnerId}`).catch(() => ({ data: null })),
      user.role === 'buyer' 
        ? api.get(`/sellers/${partnerId}/reviews`).catch(() => ({ data: { average: 0 } }))
        : Promise.resolve({ data: { average: 0 } })
    ]).then(([userRes, ratingRes]) => {
      setPartnerInfo(userRes.data);
      if (user.role === 'buyer') {
        setRating(ratingRes.data.average);
      }
      setLoading(false);
    });
  }, [partnerId, user.role]);

  if (!partnerId) return null;

  return (
    <div style={{ 
      width: '300px', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border-color)',
      flexShrink: 0,
      overflowY: 'auto'
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Detalles</h2>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
      ) : partnerInfo ? (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.8rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden', border: '3px solid var(--bg-panel)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(partnerInfo.name)}&background=0D8ABC&color=fff&size=256&bold=true`} alt={partnerInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{partnerInfo.name}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', background: 'var(--bg-main)', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'inline-block', marginTop: '0.4rem' }}>
                {partnerInfo.role === 'seller' ? 'Vendedor' : 'Cliente'}
              </span>
            </div>

            {rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <Star size={16} fill="currentColor" />
                {rating.toFixed(1)} / 5.0
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Información</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span style={{ wordBreak: 'break-all' }}>{partnerInfo.email}</span>
            </div>
            
            {partnerInfo.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                <Phone size={16} color="var(--text-muted)" />
                <span>{partnerInfo.phone}</span>
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

          {/* Quick Actions / Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Actividad</h4>
            
            <div 
              onClick={() => setShowOrders(!showOrders)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: 'var(--bg-main)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }} 
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.05)'} 
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-main)'}
            >
              <Package size={18} color="var(--primary)" />
              <span style={{ fontWeight: '600', flex: 1 }}>Ver Pedidos</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{showOrders ? '▲' : '▼'}</span>
            </div>
            
            {showOrders && activeItemName && Array.isArray(activeItemName) && activeItemName.length > 0 && (
              <div style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '1rem', marginTop: '-0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Artículos solicitados:</span>
                {activeItemName.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-main)' }}>• {item.description}</span>
                    {item.price && <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>${parseFloat(item.price).toFixed(2)}</span>}
                  </div>
                ))}
              </div>
            )}

            {showOrders && (!activeItemName || activeItemName.length === 0) && (
              <div style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '1rem', marginTop: '-0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                No hay pedidos en este chat aún.
              </div>
            )}
            
          </div>

        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Usuario no encontrado</div>
      )}
    </div>
  );
}
