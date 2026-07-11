import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, ShoppingBag, Receipt, Clock, Search } from 'lucide-react';
import api from '../services/api';

// Estados que cuentan como ingreso confirmado
const PAID_STATUSES = ['Pagado', 'En Preparación', 'Enviado', 'Entregado'];

const STATUS_STYLE = (status) => {
  const map = {
    'Pendiente': { bg: 'rgba(148,163,184,0.15)', color: '#64748b' },
    'pending_verification': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    'Pagado': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    'En Preparación': { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
    'Enviado': { bg: 'rgba(14,165,233,0.12)', color: '#0ea5e9' },
    'Entregado': { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  };
  return map[status] || { bg: 'rgba(148,163,184,0.15)', color: '#64748b' };
};

const LABEL = (s) => (s === 'pending_verification' ? 'Verificando pago' : s);

// Algunos items traen metadatos de delivery pegados con un separador; mostramos solo el nombre.
const cleanItem = (item) => (item || '').split('|||')[0].trim();

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/orders');
        setOrders(res.data);
      } catch (e) {
        setError('No se pudieron cargar las órdenes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const revenue = orders
      .filter(o => PAID_STATUSES.includes(o.status))
      .reduce((s, o) => s + o.price, 0);
    const paidCount = orders.filter(o => PAID_STATUSES.includes(o.status)).length;
    return {
      revenue,
      total: orders.length,
      avg: paidCount ? revenue / paidCount : 0,
      pending: orders.filter(o => o.status === 'Pendiente' || o.status === 'pending_verification').length,
    };
  }, [orders]);

  const byStatus = useMemo(() => {
    const counts = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const statuses = useMemo(() => byStatus.map(([s]) => s), [byStatus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return cleanItem(o.item).toLowerCase().includes(q)
        || o.buyer?.name?.toLowerCase().includes(q)
        || o.seller?.name?.toLowerCase().includes(q);
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>Cargando órdenes...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Ventas Globales</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>Todas las órdenes de la plataforma en un solo lugar.</p>
      </div>

      {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <SummaryCard icon={<DollarSign size={22} color="#10b981" />} title="Volumen Confirmado" value={`$${summary.revenue.toFixed(2)}`} />
        <SummaryCard icon={<ShoppingBag size={22} color="#3b82f6" />} title="Órdenes Totales" value={summary.total} />
        <SummaryCard icon={<Receipt size={22} color="#8b5cf6" />} title="Ticket Promedio" value={`$${summary.avg.toFixed(2)}`} />
        <SummaryCard icon={<Clock size={22} color="#f59e0b" />} title="Pendientes" value={summary.pending} />
      </div>

      {/* Embudo de estados */}
      <div style={{ background: 'var(--bg-panel)', padding: '1.2rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Órdenes por Estado</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {byStatus.map(([status, count]) => {
            const st = STATUS_STYLE(status);
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: st.bg, color: st.color, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem' }}>
                {LABEL(status)}
                <span style={{ background: st.color, color: '#fff', borderRadius: '10px', padding: '0.05rem 0.5rem', fontSize: '0.75rem' }}>{count}</span>
              </div>
            );
          })}
          {byStatus.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Sin órdenes todavía.</span>}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, comprador o vendedor..."
            style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)', cursor: 'pointer' }}
        >
          <option value="all">Todos los estados</option>
          {statuses.map(s => <option key={s} value={s}>{LABEL(s)}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 820 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['#', 'Producto', 'Comprador', 'Vendedor', 'Precio', 'Estado', 'Fecha'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const st = STATUS_STYLE(o.status);
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{o.id}</td>
                    <td style={{ padding: '0.8rem 0.5rem', fontWeight: '600' }}>{cleanItem(o.item)}</td>
                    <td style={{ padding: '0.8rem 0.5rem', fontSize: '0.85rem' }}>{o.buyer?.name || '—'}</td>
                    <td style={{ padding: '0.8rem 0.5rem', fontSize: '0.85rem' }}>{o.seller?.name || '—'}</td>
                    <td style={{ padding: '0.8rem 0.5rem', fontWeight: '600' }}>${Number(o.price).toFixed(2)}</td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: st.bg, color: st.color }}>
                        {LABEL(o.status)}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin resultados.</td></tr>
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
