import React from 'react';
import { Package, ShoppingBag, Users, BarChart2, UsersRound, LayoutGrid, Award, History, MessageSquare, User } from 'lucide-react';

const CYAN = '#00a3e0';
const NAVY = '#041e42';

const ICONS = {
  catalog: <Package size={22} />,
  orders: <ShoppingBag size={22} />,
  crm: <Users size={22} />,
  stats: <BarChart2 size={22} />,
  team: <UsersRound size={22} />,
  rewards: <Award size={22} />,
  history: <History size={22} />,
  chat: <MessageSquare size={22} />,
  profile: <User size={22} />,
  default: <LayoutGrid size={22} />,
};

/**
 * Hero reutilizable para los módulos de empresa.
 * Banner inmersivo navy→cian con textura, una ilustración a la derecha
 * (la "foto") y una onda divisoria. Se adapta a claro/oscuro vía var(--bg-main).
 */
export default function ModuleHero({ eyebrow, title, subtitle, iconName, children, fullBleed = false }) {
  const icon = ICONS[iconName] || ICONS.default;
  return (
    <div style={{ 
      position: 'relative', 
      overflow: 'hidden', 
      borderRadius: fullBleed ? '0' : '20px 20px 0 0', 
      background: `linear-gradient(120deg, ${NAVY} 0%, #062a52 45%, #0a4d86 130%)`, 
      color: '#fff', 
      padding: fullBleed ? 'calc(1.9rem + 56px) 2rem 4.4rem' : '1.9rem 1.9rem 4.4rem', 
      marginBottom: fullBleed ? '0' : '1.25rem' 
    }}>
      {/* Textura + luz */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: -100, right: '18%', width: 300, height: 300, background: CYAN, filter: 'blur(130px)', opacity: 0.38, borderRadius: '50%' }} />

      <div style={{ maxWidth: fullBleed ? '1200px' : 'none', margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Texto */}
        <div style={{ minWidth: 240, flex: 1 }}>
          {eyebrow && <span style={{ fontSize: '0.72rem', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: CYAN }}>{eyebrow}</span>}
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: '600', letterSpacing: '-1px', margin: '0.35rem 0 0' }}>{title}</h1>
          {subtitle && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', margin: '0.4rem 0 0', maxWidth: 460 }}>{subtitle}</p>}
          {children && <div style={{ marginTop: '1.1rem' }}>{children}</div>}
        </div>

        {/* Ilustración (la "foto") */}
        <div className="module-hero-art" style={{ position: 'relative', width: 200, height: 130, flexShrink: 0 }}>
          {/* Tarjeta flotante trasera */}
          <div style={{ position: 'absolute', top: 8, right: 10, width: 150, height: 104, borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', transform: 'rotate(-8deg)' }} />
          {/* Tarjeta principal glass */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 156, height: 112, borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', boxShadow: '0 18px 40px -14px rgba(0,0,0,0.5)', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: CYAN, color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <div style={{ height: 8, width: '78%', borderRadius: '6px', background: 'rgba(255,255,255,0.35)' }} />
            <div style={{ height: 8, width: '55%', borderRadius: '6px', background: 'rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </div>

      {/* Onda divisoria */}
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '64px', display: 'block' }}>
        <path d="M0,64 C240,120 480,8 720,40 C960,72 1200,116 1440,60 L1440,120 L0,120 Z" fill="var(--bg-main)" />
      </svg>

      <style>{`
        @media (max-width: 640px) { .module-hero-art { display: none !important; } }
      `}</style>
    </div>
  );
}
