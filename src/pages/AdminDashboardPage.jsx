import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, DollarSign, Activity } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setUsersList(usersRes.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>Cargando panel de administración...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Panel de Administración Global</h1>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <KpiCard icon={<Users size={24} color="#3b82f6" />} title="Usuarios Totales" value={stats?.totalUsers || 0} />
        <KpiCard icon={<ShoppingBag size={24} color="#10b981" />} title="Órdenes Totales" value={stats?.totalOrders || 0} />
        <KpiCard icon={<DollarSign size={24} color="#f59e0b" />} title="Volumen Movido" value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`} />
        <KpiCard icon={<Activity size={24} color="#8b5cf6" />} title="Estado del Sistema" value="Óptimo" />
      </div>

      {/* Charts Section */}
      <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>Crecimiento de la Plataforma</h2>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              <Bar dataKey="Usuarios" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ordenes" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Últimos Usuarios Registrados</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Nombre</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Email</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Rol</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {usersList.slice(0, 10).map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{u.name}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      background: u.role === 'admin' ? 'rgba(139,92,246,0.1)' : u.role === 'seller' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                      color: u.role === 'admin' ? '#8b5cf6' : u.role === 'seller' ? '#3b82f6' : '#10b981'
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, title, value }) {
  return (
    <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  );
}
