import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PackageSearch, Plus, Trash2, Edit2, Save, ImagePlus, X } from 'lucide-react';
import api from '../services/api';

export default function CatalogPage() {
  const { catalogProducts, setCatalogProducts } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', images: [], discount: '', category: 'Tecnología y Móviles', desc: '' });
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const getProductImage = (product) => {
    let imgUrl = product.image;
    if (!imgUrl || imgUrl.startsWith('blob:')) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=0D8ABC&color=fff&size=300`;
    }
    return imgUrl;
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products');
        setCatalogProducts(res.data);
      } catch (err) {
        console.error("Error al obtener catálogo:", err);
      }
    };
    fetchCatalog();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const payload = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 1,
      image: newProduct.images[0] || '',
      images: newProduct.images,
      discount: parseInt(newProduct.discount) || 0,
      category: newProduct.category,
      desc: newProduct.desc
    };

    try {
      if (editingId) {
        const res = await api.put(`/products/${editingId}`, payload);
        setCatalogProducts(catalogProducts.map(p => p.id === editingId ? res.data : p));
        setEditingId(null);
      } else {
        const res = await api.post('/products', payload);
        setCatalogProducts([...catalogProducts, res.data]);
      }
      setNewProduct({ name: '', price: '', stock: '', images: [], discount: '', category: 'Tecnología y Móviles', desc: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Error al guardar el producto');
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({ 
      name: product.name, 
      price: product.price, 
      stock: product.stock, 
      images: product.images || (product.image ? [product.image] : []), 
      discount: product.discount || '',
      category: product.category || 'Tecnología y Móviles',
      desc: product.desc || ''
    });
    setEditingId(product.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setCatalogProducts(catalogProducts.filter(p => p.id !== id));
    } catch (err) {
      alert('Error al eliminar el producto');
    }
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Mi Catálogo de Productos</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Plus size={16} /> Añadir Producto
        </button>
      </div>

      {showAddForm && (
        <div className="card-panel animate-slide-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: 'bold' }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div style={{ gridColumn: '1 / span 2' }}>
              <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Nombre del Repuesto / Producto</label>
              <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="input-field" required style={{ marginBottom: 0, padding: '0.6rem 0.8rem', borderRadius: '8px' }} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Categoría</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="input-field" style={{ marginBottom: 0, height: '36px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.5rem', fontSize: '0.85rem' }}>
                <option value="Tecnología y Móviles">Tecnología y Móviles</option>
                <option value="Ferretería y Construcción">Ferretería y Construcción</option>
                <option value="Moda y Calzado">Moda y Calzado</option>
                <option value="Hogar y Muebles">Hogar y Muebles</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Descripción del Producto</label>
              <textarea value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} placeholder="Describe detalladamente el repuesto, compatibilidades, marca, etc..." className="input-field" style={{ marginBottom: 0, minHeight: '60px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', width: '100%', resize: 'vertical', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Precio ($)</label>
              <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="input-field" required style={{ marginBottom: 0, padding: '0.6rem 0.8rem', borderRadius: '8px' }} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Unidades Disponibles (Stock)</label>
              <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="input-field" style={{ marginBottom: 0, padding: '0.6rem 0.8rem', borderRadius: '8px' }} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>% Descuento (Opcional)</label>
              <input type="number" min="0" max="99" value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} placeholder="Ej: 15" className="input-field" style={{ marginBottom: 0, padding: '0.6rem 0.8rem', borderRadius: '8px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Fotos del Producto (Opcional - Máx 5)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', minHeight: '80px', border: '1px dashed var(--border-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', padding: '0.8rem' }}>
                <input 
                  type="file" 
                  multiple
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={async (e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      const uploadedUrls = [];
                      for (const file of files) {
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const uploadRes = await api.post('/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          uploadedUrls.push(`http://localhost:3000${uploadRes.data.url}`);
                        } catch (err) {
                          console.error("Error al subir archivo", err);
                          alert("Error al subir imagen al servidor");
                        }
                      }
                      setNewProduct(prev => ({...prev, images: [...(prev.images || []), ...uploadedUrls].slice(0, 5)}));
                    }
                  }} 
                />
                {newProduct.images && newProduct.images.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%' }}>
                    {newProduct.images.map((imgUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setNewProduct({...newProduct, images: newProduct.images.filter((_, i) => i !== idx)}); }} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '0 0 0 4px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={10} /></button>
                      </div>
                    ))}
                    {newProduct.images.length < 5 && (
                      <div style={{ width: '40px', height: '40px', border: '1px dashed var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--bg-panel)' }}>
                        <Plus size={16} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <ImagePlus size={16} />
                    <span>Haz clic para subir fotos desde tu equipo (Máx 5)</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); setNewProduct({ name: '', price: '', stock: '', images: [], discount: '', category: 'Tecnología y Móviles', desc: '' }); }} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}><Save size={16} /> {editingId ? 'Guardar Cambios' : 'Guardar Producto'}</button>
            </div>
          </form>
        </div>
      )}

      {catalogProducts.length === 0 ? (
        <div className="card-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)', flex: 1 }}>
          <PackageSearch size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No tienes productos en tu catálogo</h3>
          <p>Tus productos fijos aparecerán en tu Vitrina Pública para venta directa.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
          {catalogProducts.map(product => (
            <div key={product.id} className="card-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              {product.discount > 0 && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.72rem', zIndex: 10 }}>
                  {product.discount}% OFF
                </div>
              )}
              <div style={{ position: 'relative', height: '150px', background: 'var(--bg-main)' }}>
                <img src={getProductImage(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>{product.category || 'Repuestos'}</span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 'bold', margin: '0.15rem 0 0 0', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.3' }}>{product.name}</h4>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {product.discount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                    <span style={{ fontSize: '1.15rem', fontWeight: '900', color: product.discount > 0 ? '#ef4444' : 'var(--text-main)' }}>
                      ${product.discount > 0 ? (product.price * (1 - product.discount/100)).toFixed(2) : product.price.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stock: {product.stock}</span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => handleEditClick(product)} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(product.id)} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--error)' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
