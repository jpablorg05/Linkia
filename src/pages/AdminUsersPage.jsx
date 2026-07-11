import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, ShieldOff, Search, Trash2, Ban, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ROLE_STYLES = {
  admin: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  seller: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  buyer: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const summary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      total: users.length,
      today: users.filter(u => isSameDay(new Date(u.createdAt), now)).length,
      week: users.filter(u => new Date(u.createdAt) >= weekAgo).length,
      suspended: users.filter(u => u.suspendedAt).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });
  }, [users, search, roleFilter]);

  const handleRole = async (u, role) => {
    if (role === u.role) return;
    setBusyId(u.id);
    try {
      await api.put(`/admin/users/${u.id}/role`, { role });
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, role } : x)));
    } catch (e) {
      alert(e.response?.data?.error || 'Error al cambiar el rol');
    } finally { setBusyId(null); }
  };

  const handleSuspend = async (u) => {
    setBusyId(u.id);
    try {
      const res = await api.put(`/admin/users/${u.id}/suspend`);
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, suspendedAt: res.data.suspendedAt } : x)));
    } catch (e) {
      alert(e.response?.data?.error || 'Error al suspender');
    } finally { setBusyId(null); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`¿Eliminar a "${u.name}"? Se ocultará de la plataforma (soft-delete).`)) return;
    setBusyId(u.id);
    try {
      await api.delete(`/admin/users/${u.id}`);
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar');
    } finally { setBusyId(null); }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>Cargando usuarios...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Gestión de Usuarios</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>Controla las cuentas de toda la plataforma.</p>
      </div>

      {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <SummaryCard icon={<Users size={22} color="#3b82f6" />} title="Usuarios Totales" value={summary.total} />
        <SummaryCard icon={<UserPlus size={22} color="#10b981" />} title="Nuevos Hoy" value={summary.today} />
        <SummaryCard icon={<UserPlus size={22} color="#f59e0b" />} title="Nuevos (7 días)" value={summary.week} />
        <SummaryCard icon={<ShieldOff size={22} color="#ef4444" />} title="Suspendidos" value={summary.suspended} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}
          />
        </div>
        {['all', 'buyer', 'seller', 'admin'].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
              border: '1px solid var(--border-color)',
              background: roleFilter === r ? 'var(--primary)' : 'var(--bg-panel)',
              color: roleFilter === r ? '#fff' : 'var(--text-muted)',
            }}
          >
            {r === 'all' ? 'Todos' : r.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Usuario', 'Rol', 'Actividad', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const suspended = !!u.suspendedAt;
                const activity = (u._count?.sellerOrders || 0) + (u._count?.buyerOrders || 0);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: suspended ? 0.55 : 1 }}>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <div style={{ fontWeight: '600' }}>{u.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <select
                        value={u.role}
                        disabled={busyId === u.id}
                        onChange={(e) => handleRole(u, e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                          background: (ROLE_STYLES[u.role] || {}).bg, color: (ROLE_STYLES[u.role] || {}).color,
                          fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                        }}
                      >
                        <option value="buyer">BUYER</option>
                        <option value="seller">SELLER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {u.role === 'seller'
                        ? `${u._count?.products || 0} productos · ${u._count?.sellerOrders || 0} ventas`
                        : `${activity} órdenes`}
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                        background: suspended ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        color: suspended ? '#ef4444' : '#10b981',
                      }}>
                        {suspended ? 'Suspendido' : 'Activo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <IconBtn
                          title={suspended ? 'Reactivar' : 'Suspender'}
                          disabled={busyId === u.id}
                          onClick={() => handleSuspend(u)}
                          color={suspended ? '#10b981' : '#f59e0b'}
                        >
                          {suspended ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                        </IconBtn>
                        <IconBtn title="Eliminar" disabled={busyId === u.id} onClick={() => handleDelete(u)} color="#ef4444">
                          <Trash2 size={16} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value }) {
  return (
    <div style={{ background: 'var(--bg-panel)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '0.8rem', background: 'var(--bg-main)', borderRadius: '12px' }}>{icon}</div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  );
}

function IconBtn({ children, title, onClick, disabled, color }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid var(--border-color)', background: 'var(--bg-main)', color,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
