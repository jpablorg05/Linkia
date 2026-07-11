import React, { useEffect, useMemo, useState } from 'react';
import { Package, AlertTriangle, UserX, Tag, Search, Trash2 } from 'lucide-react';
import api from '../services/api';

const LOW_STOCK = 3;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))),
    [products]
  );

  const summary = useMemo(() => ({
    total: products.length,
    lowStock: products.filter(p => (p.stock ?? 0) <= LOW_STOCK).length,
    noSeller: products.filter(p => !p.seller).length,
    categories: categories.length,
  }), [products, categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return p.name?.toLowerCase().includes(q) || p.seller?.name?.toLowerCase().includes(q);
    });
  }, [products, search, category]);

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar el producto "${p.name}"? Se ocultará del catálogo.`)) return;
    setBusyId(p.id);
    try {
      await api.delete(`/products/${p.id}`);
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar el producto');
    } finally { setBusyId(null); }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>Cargando productos...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Catálogo Global</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>Supervisa todos los productos de la plataforma y sus vendedores.</p>
      </div>

      {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <SummaryCard icon={<Package size={22} color="#3b82f6" />} title="Productos Totales" value={summary.total} />
        <SummaryCard icon={<AlertTriangle size={22} color="#f59e0b" />} title={`Stock Bajo (≤${LOW_STOCK})`} value={summary.lowStock} />
        <SummaryCard icon={<UserX size={22} color="#ef4444" />} title="Sin Vendedor" value={summary.noSeller} />
        <SummaryCard icon={<Tag size={22} color="#8b5cf6" />} title="Categorías" value={summary.categories} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto o vendedor..."
            style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)', cursor: 'pointer' }}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 780 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Producto', 'Vendedor', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const low = (p.stock ?? 0) <= LOW_STOCK;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--bg-main)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.image
                            ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={18} color="var(--text-muted)" />}
                        </div>
                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 0.5rem', fontSize: '0.85rem' }}>
                      {p.seller
                        ? <span>{p.seller.name}</span>
                        : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Sin vendedor</span>}
                    </td>
                    <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.category || '—'}</td>
                    <td style={{ padding: '0.8rem 0.5rem', fontWeight: '600' }}>${Number(p.price).toFixed(2)}</td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600',
                        background: low ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)',
                        color: low ? '#f59e0b' : '#10b981',
                      }}>
                        {p.stock ?? 0}{low ? ' ⚠️' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      <IconBtn title="Eliminar" disabled={busyId === p.id} onClick={() => handleDelete(p)} color="#ef4444">
                        <Trash2 size={16} />
                      </IconBtn>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin resultados.</td></tr>
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
