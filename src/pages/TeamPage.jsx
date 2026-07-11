import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, UserPlus, Shield, Trash2, Mail, Circle, Briefcase, ChevronRight, Activity } from 'lucide-react';
import ModuleHero from '../components/ModuleHero';

export default function TeamPage() {
  const { teamMembers, setTeamMembers, user, setUser } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'sales' });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    setTeamMembers([{
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'offline',
      lastActive: 'Hace un momento'
    }, ...teamMembers]);

    setNewMember({ name: '', email: '', role: 'sales' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const getRoleTheme = (role) => {
    switch(role) {
      case 'admin': return { bg: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', label: 'Admin', icon: <Shield size={14}/> };
      case 'sales': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Ventas', icon: <Briefcase size={14}/> };
      case 'logistics': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Logística', icon: <Activity size={14}/> };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', label: 'Invitado', icon: <UserPlus size={14}/> };
    }
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      <ModuleHero eyebrow="Empresa" title="Gestión de Equipo" subtitle="Construye, organiza y gestiona los accesos de tus colaboradores." iconName="team" fullBleed={true}>
        {user?.subRole === 'admin' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 8px 20px -6px rgba(14, 165, 233, 0.5)', borderRadius: '12px' }}>
            <UserPlus size={18} /> {showAddForm ? 'Ocultar Formulario' : 'Invitar Empleado'}
          </button>
        )}
      </ModuleHero>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 2rem 3rem', maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        {/* ROLE SIMULATOR - PREMIUM BANNER */}
        <div style={{ background: 'linear-gradient(90deg, var(--bg-panel) 0%, rgba(14,165,233,0.05) 100%)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.6rem', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '900', margin: 0, color: 'var(--text-main)' }}>Simulador de Entorno</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.15rem 0 0 0' }}>Cambia tu rol temporalmente para ver la plataforma como la vería tu equipo.</p>
            </div>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '0.2rem' }}>
            {[
              { id: 'admin', label: 'Admin (Dueño)', color: 'var(--primary)' },
              { id: 'sales', label: 'Ventas (Mostrador)', color: '#f59e0b' },
              { id: 'logistics', label: 'Almacén (Logística)', color: '#10b981' }
            ].map(roleItem => {
              const isActive = user?.subRole === roleItem.id;
              return (
                <button 
                  key={roleItem.id} 
                  onClick={() => { setUser({...user, subRole: roleItem.id}); localStorage.setItem('subRole', roleItem.id); }} 
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? roleItem.color : 'transparent',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? '900' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? `0 4px 10px ${roleItem.color}40` : 'none'
                  }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.color = 'var(--text-main)')}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {roleItem.label}
                </button>
              );
            })}
          </div>
        </div>

        {user?.subRole !== 'admin' ? (
          <div className="flex-center" style={{ height: '40vh', flexDirection: 'column', color: 'var(--text-muted)', background: 'var(--bg-panel)', border: '1px dashed var(--border-color)', borderRadius: '24px', padding: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <Shield size={40} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Acceso Restringido</h2>
            <p style={{ fontSize: '0.95rem', margin: 0, textAlign: 'center', maxWidth: '400px' }}>No tienes permisos para ver o gestionar el personal. Usa el simulador de arriba para volver al rol de Administrador.</p>
          </div>
        ) : (
          <>
            {showAddForm && (
              <div className="card-panel animate-slide-up" style={{ padding: 0, marginBottom: '1rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', display: 'flex', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}>
                {/* Left Decoration */}
                <div style={{ width: '250px', background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)', padding: '3rem 2rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <UserPlus size={48} color="rgba(255,255,255,0.8)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>Nuevo Miembro</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', lineHeight: 1.5 }}>Invita a un nuevo colaborador para que te ayude a gestionar Linkia.</p>
                </div>
                
                {/* Right Form */}
                <form onSubmit={handleAddMember} style={{ flex: 1, padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nombre y Apellido</label>
                    <input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="input-field" placeholder="Ej: Ana López" required style={{ margin: 0, padding: '1rem', fontSize: '1rem', borderRadius: '12px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correo Electrónico</label>
                    <input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="input-field" placeholder="ana@empresa.com" required style={{ margin: 0, padding: '1rem', fontSize: '1rem', borderRadius: '12px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Asignar Rol</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {[
                        { id: 'sales', label: 'Ventas y Atención', desc: 'Acceso a Catálogo y Mensajes' },
                        { id: 'logistics', label: 'Almacén', desc: 'Acceso solo a Pedidos y Envíos' },
                        { id: 'admin', label: 'Administrador', desc: 'Acceso total y configuración' }
                      ].map(roleOpt => (
                        <div 
                          key={roleOpt.id} 
                          onClick={() => setNewMember({...newMember, role: roleOpt.id})}
                          style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: newMember.role === roleOpt.id ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: newMember.role === roleOpt.id ? 'rgba(14,165,233,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <div style={{ fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{roleOpt.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{roleOpt.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ padding: '0.8rem 2rem', fontWeight: 'bold', borderRadius: '12px' }}>Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem', fontWeight: 'bold', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px -6px rgba(14, 165, 233, 0.4)' }}><Mail size={18} /> Enviar Invitación</button>
                  </div>
                </form>
              </div>
            )}

            {/* TEAM GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              
              {/* CURRENT USER CARD */}
              <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--primary)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(14,165,233,0.1)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Tú')}&background=0D8ABC&color=fff&size=128&bold=true`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: '#10b981', border: '3px solid var(--bg-panel)' }}></div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(14,165,233,0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Tú</span>
                </div>
                
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-main)' }}>{user?.name || 'Administrador'}</h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.email || 'admin@empresa.com'}</p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: getRoleTheme('admin').bg, color: getRoleTheme('admin').color, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {getRoleTheme('admin').icon} {getRoleTheme('admin').label}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Activity size={14}/> En línea</span>
                </div>
              </div>

              {/* OTHER MEMBERS */}
              {teamMembers.map(member => {
                const theme = getRoleTheme(member.role);
                const isOnline = member.status === 'online';
                return (
                  <div key={member.id} className="group" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f1f5f9&color=64748b&size=128&bold=true`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: isOnline ? '#10b981' : '#94a3b8', border: '3px solid var(--bg-panel)' }}></div>
                      </div>
                      <button 
                        onClick={() => handleDelete(member.id)} 
                        title="Eliminar Miembro"
                        style={{ background: 'transparent', border: '1px solid transparent', cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', color: 'var(--text-muted)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent'; }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>{member.name}</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.email}</p>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: theme.bg, color: theme.color, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                        {theme.icon} {theme.label}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: isOnline ? '#10b981' : 'var(--text-muted)', fontWeight: 'bold' }}>{isOnline ? 'En línea' : member.lastActive}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
