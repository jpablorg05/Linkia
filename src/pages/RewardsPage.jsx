import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Award, Gift, TrendingUp, Unlock, CheckCircle2 } from 'lucide-react';
import ModuleHero from '../components/ModuleHero';

export default function RewardsPage() {
  const { loyaltyPoints, setLoyaltyPoints } = useAppContext();
  const [redeemed, setRedeemed] = useState([]);

  // Mock Rewards Catalog
  const rewards = [
    { id: 1, title: 'Envío Gratis Nacional', points: 300, icon: <Gift size={32} color="#10b981" />, description: 'Válido para un paquete de hasta 5kg por Zoom o MRW.' },
    { id: 2, title: 'Cupón de 10% Descuento', points: 500, icon: <TrendingUp size={32} color="#f59e0b" />, description: 'Aplícalo en tu próxima compra en cualquier categoría.' },
    { id: 3, title: 'Suscripción Premium 1 Mes', points: 1200, icon: <Award size={32} color="var(--primary)" />, description: 'Envíos gratis ilimitados y ofertas exclusivas.' }
  ];

  const handleRedeem = (reward) => {
    if (loyaltyPoints >= reward.points) {
      setLoyaltyPoints(loyaltyPoints - reward.points);
      setRedeemed([...redeemed, reward.id]);
    } else {
      alert('No tienes suficientes puntos para canjear este premio.');
    }
  };

  const getTierInfo = () => {
    if (loyaltyPoints < 500) return { name: 'BRONCE', color: '#cd7f32', next: 500 };
    if (loyaltyPoints < 1500) return { name: 'PLATA', color: '#c0c0c0', next: 1500 };
    return { name: 'ORO', color: '#ffd700', next: 5000 };
  };

  const tier = getTierInfo();
  const progress = Math.min(100, (loyaltyPoints / tier.next) * 100);

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Header */}
      <ModuleHero
        title="Club Linkia"
        eyebrow="Mi cuenta"
        subtitle="Compra, acumula puntos y desbloquea beneficios exclusivos."
        iconName="rewards"
        fullBleed={true}
      >
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center', display: 'inline-block' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Disponible</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f3d078', lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loyaltyPoints} <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>pts</span>
          </div>
        </div>
      </ModuleHero>

      {/* Contenedor del contenido principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem' }}>
        {/* Nivel Progress */}
        <div className="card-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--bg-panel)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.2rem' }}>Nivel {tier.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>Faltan {tier.next - loyaltyPoints} pts para el siguiente nivel</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: 'var(--bg-main)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, var(--primary) 0%, ${tier.color} 100%)`, transition: 'width 0.5s ease-in-out' }}></div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Catálogo de Recompensas</h2>
        
        {/* Rewards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {rewards.map(reward => {
            const isRedeemed = redeemed.includes(reward.id);
            const canAfford = loyaltyPoints >= reward.points;

            return (
              <div key={reward.id} className="card-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
                    {reward.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{reward.title}</h3>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.1rem' }}>{reward.points} pts</div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', flex: 1 }}>{reward.description}</p>

                {isRedeemed ? (
                  <button className="btn-secondary" disabled style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} /> Canjeado
                  </button>
                ) : (
                  <button 
                    onClick={() => handleRedeem(reward)} 
                    disabled={!canAfford}
                    className={canAfford ? 'btn-primary' : 'btn-secondary'} 
                    style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: canAfford ? 1 : 0.5 }}
                  >
                    {canAfford ? <Unlock size={18} /> : null}
                    {canAfford ? 'Canjear Premio' : 'Puntos Insuficientes'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
