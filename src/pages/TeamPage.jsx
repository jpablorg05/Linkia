import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, UserPlus, Shield, Trash2, Mail, Circle, Briefcase } from 'lucide-react';

export default function TeamPage() {
  const { teamMembers, setTeamMembers, user, setUser } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'sales' });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    setTeamMembers([...teamMembers, {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'offline',
      lastActive: 'Nunca'
    }]);

    setNewMember({ name: '', email: '', role: 'sales' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>Admin</span>;
      case 'sales': return <span style={{ background: '#f59e0b', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>Ventas</span>;
      case 'logistics': return <span style={{ background: '#10b981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>Logística</span>;
      default: return null;
    }
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Gestión de Equipo</h2>
        {user?.subRole === 'admin' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <UserPlus size={16} /> Invitar Empleado
          </button>
        )}
      </div>

      {/* Simulador de Roles - Siempre visible para poder alternar */}
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Briefcase size={16} color="var(--primary)" /> Simulador de Roles
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.15rem 0 0 0' }}>Prueba cómo ve la app el personal de tu empresa.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--bg-main)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'admin', label: 'Admin (Dueño)', color: 'var(--primary)' },
            { id: 'sales', label: 'Vendedor (Mostrador)', color: '#f59e0b' },
            { id: 'logistics', label: 'Almacenista (Logística)', color: '#10b981' }
          ].map(roleItem => {
            const isActive = user?.subRole === roleItem.id;
            return (
              <button 
                key={roleItem.id} 
                onClick={() => { setUser({...user, subRole: roleItem.id}); localStorage.setItem('subRole', roleItem.id); }} 
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? roleItem.color : 'transparent',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {roleItem.label}
              </button>
            );
          })}
        </div>
      </div>

      {user?.subRole !== 'admin' ? (
        /* Mostrar mensaje de acceso denegado para el resto de la página */
        <div className="flex-center" style={{ height: '40vh', flexDirection: 'column', color: 'var(--text-muted)', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
          <Shield size={48} style={{ opacity: 0.5, marginBottom: '1rem', color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0.5rem 0' }}>Acceso Restringido</h2>
          <p style={{ fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>Solo los administradores pueden gestionar el personal. Utiliza el simulador superior para cambiar de rol.</p>
        </div>
      ) : (
        <>
          {showAddForm && (
            <div className="card-panel animate-slide-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
              <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: 'bold' }}>Invitar Colaborador</h3>
              <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Nombre</label>
                  <input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="input-field" required style={{ marginBottom: 0, padding: '0.6rem 0.8rem', borderRadius: '8px' }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Correo Electrónico</label>
                  <input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="input-field" required style={{ marginBottom: 0, padding: '0.6rem 0.8rem', borderRadius: '8px' }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Rol Asignado</label>
                  <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="input-field" style={{ marginBottom: 0, padding: '0.6rem 0.8rem', borderRadius: '8px', height: '36px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                    <option value="sales">Vendedor (Cotizaciones y Chat)</option>
                    <option value="logistics">Almacenista (Solo Envíos)</option>
                    <option value="admin">Administrador (Acceso Total)</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancelar</button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> Enviar Invitación</button>
                </div>
              </form>
            </div>
          )}

          {/* Lista del personal */}
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-panel)', overflow: 'hidden' }}>
            {/* Header de la lista */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px', padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Colaborador</div>
              <div>Rol</div>
              <div>Estado</div>
              <div>Última Actividad</div>
              <div style={{ textAlign: 'right' }}>Acciones</div>
            </div>

            {/* Cuerpo: Tu usuario */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px', padding: '1rem 1.2rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.88rem' }}>{user?.name} <span style={{ fontSize: '0.65rem', color: 'var(--primary)', background: 'rgba(14,165,233,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.3rem', fontWeight: 'bold' }}>Tú</span></div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <div>{getRoleBadge('admin')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> En línea
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ahora</div>
              <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.78rem' }}>--</div>
            </div>

            {/* Resto de miembros */}
            {teamMembers.map(member => (
              <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px', padding: '1rem 1.2rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.88rem' }}>{member.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                </div>
                <div>{getRoleBadge(member.role)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: member.status === 'online' ? '#10b981' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: member.status === 'online' ? '#10b981' : 'var(--text-muted)' }} /> 
                  {member.status === 'online' ? 'En línea' : 'Desconectado'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.lastActive}</div>
                <div style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(member.id)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--error)', transition: 'opacity 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
