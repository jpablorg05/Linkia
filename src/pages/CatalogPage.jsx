import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PackageSearch, Plus, Trash2, Edit2, Save, ImagePlus, X, ShoppingCart, Star, Eye } from 'lucide-react';
import api from '../services/api';
import ModuleHero from '../components/ModuleHero';

export default function CatalogPage() {
  const { catalogProducts, setCatalogProducts } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', images: [], discount: '', category: 'Tecnología y Móviles', desc: '' });
  const [editingId, setEditingId] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
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
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ModuleHero eyebrow="Empresa" title="Mi Catálogo" subtitle="Publica y gestiona los productos de tu tienda." iconName="catalog" fullBleed={true}>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
          <Plus size={16} /> Añadir Producto
        </button>
      </ModuleHero>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {showAddForm && (
          <div className="card-panel animate-slide-up" style={{ padding: '2rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900' }}>
                {editingId ? <Edit2 size={20} color="var(--primary)" /> : <PackageSearch size={20} color="var(--primary)" />}
                {editingId ? 'Editar Producto' : 'Añadir Nuevo Producto'}
              </h3>
              <button onClick={() => { setShowAddForm(false); setEditingId(null); setNewProduct({ name: '', price: '', stock: '', images: [], discount: '', category: 'Tecnología y Móviles', desc: '' }); }} style={{ background: 'var(--bg-main)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
            
            <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
              
              <div style={{ gridColumn: '1 / span 3' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Imágenes del Producto</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%', minHeight: '100px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', background: 'var(--bg-main)', padding: '1rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', width: '100%', justifyContent: 'center' }}>
                      {newProduct.images.map((imgUrl, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                          <img src={imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={(e) => { e.stopPropagation(); setNewProduct({...newProduct, images: newProduct.images.filter((_, i) => i !== idx)}); }} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={10} /></button>
                        </div>
                      ))}
                      {newProduct.images.length < 5 && (
                        <div style={{ width: '56px', height: '56px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                          <ImagePlus size={18} opacity={0.5} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImagePlus size={20} />
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.2rem' }}>Añadir Fotos</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sube hasta 5 imágenes (PNG, JPG)</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ gridColumn: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Nombre del Producto</label>
                <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ej: Taladro Percutor Inalámbrico" required style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Categoría</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%', cursor: 'pointer' }}>
                  <option value="Tecnología y Móviles">Tecnología y Móviles</option>
                  <option value="Ferretería y Construcción">Ferretería y Construcción</option>
                  <option value="Moda y Calzado">Moda y Calzado</option>
                  <option value="Hogar y Muebles">Hogar y Muebles</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / span 3', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Descripción del Producto</label>
                <textarea value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} placeholder="Describe detalladamente el producto, compatibilidades, especificaciones..." style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', minHeight: '80px', resize: 'vertical', fontSize: '0.9rem', width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Precio ($)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>$</span>
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" required style={{ padding: '0.8rem 1rem 0.8rem 2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem', width: '100%', fontWeight: 'bold' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Unidades en Stock</label>
                <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="Ej: 10" style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>% Descuento</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input type="number" min="0" max="99" value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} placeholder="0" style={{ padding: '0.8rem 2rem 0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }} />
                  <span style={{ position: 'absolute', right: '1rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>%</span>
                </div>
              </div>

              <div style={{ gridColumn: '1 / span 3', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); setNewProduct({ name: '', price: '', stock: '', images: [], discount: '', category: 'Tecnología y Móviles', desc: '' }); }} className="btn-secondary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem', borderRadius: '10px', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem', fontSize: '0.9rem', borderRadius: '10px', fontWeight: 'bold' }}><Save size={18} /> {editingId ? 'Guardar Cambios' : 'Publicar Producto'}</button>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {catalogProducts.map(product => (
              <div 
                key={product.id} 
                className="card-panel group" 
                style={{ 
                  padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', 
                  border: '1px solid var(--border-color)', borderRadius: '16px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
                }}
                onClick={() => setPreviewProduct(product)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.9)', backdropFilter: 'blur(8px)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: '900', fontSize: '0.75rem', zIndex: 10, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                    -{product.discount}% OFF
                  </div>
                )}

                {/* Actions Overlay (Edit/Delete) */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(product); }} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fca5a5', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}>
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {/* View Overlay on Hover */}
                <div className="view-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(14, 165, 233, 0.1)', zIndex: 5, opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', gap: '0.4rem', alignItems: 'center', transform: 'translateY(10px)', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)' }}>
                    <Eye size={16} /> Ver Publicación
                  </div>
                </div>
                <style>{`
                  .card-panel.group:hover .view-overlay { opacity: 1; }
                  .card-panel.group:hover .view-overlay div { transform: translateY(0); }
                `}</style>

                {/* Image Area */}
                <div style={{ position: 'relative', height: '180px', background: 'var(--bg-main)' }}>
                  <img src={getProductImage(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, var(--bg-panel), transparent)' }}></div>
                </div>
                
                {/* Details */}
                <div style={{ padding: '0 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-panel)' }}>
                  
                  {/* Category & Title */}
                  <div style={{ marginTop: '-0.5rem', position: 'relative', zIndex: 2 }}>
                    <span style={{ display: 'inline-block', fontSize: '0.6rem', color: 'var(--primary)', background: 'rgba(14, 165, 233, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{product.category || 'Repuestos'}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{product.name}</h4>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    {/* Price */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Precio</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: product.discount > 0 ? '#ef4444' : 'var(--text-main)', letterSpacing: '-0.5px' }}>
                          ${product.discount > 0 ? (product.price * (1 - product.discount/100)).toFixed(2) : product.price.toFixed(2)}
                        </span>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: '600' }}>
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Disp.</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{product.stock} un.</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL VISTA PREVIA (CÓMO LO VE EL CLIENTE) */}
      {previewProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '1rem' }} onClick={() => setPreviewProduct(null)}>
          <div className="card-panel animate-slide-up" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', margin: 0, borderRadius: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', background: 'var(--bg-main)' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setPreviewProduct(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0.5)'}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0 }}>
              {/* Columna Izquierda: Imagen */}
              <div style={{ position: 'relative', minHeight: '350px', background: 'var(--bg-panel)' }}>
                {previewProduct.discount > 0 && (
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ef4444', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: '900', fontSize: '0.9rem', zIndex: 10, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                    -{previewProduct.discount}% OFF
                  </div>
                )}
                <img src={getProductImage(previewProduct)} alt={previewProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Columna Derecha: Detalles (Estilo Tienda) */}
              <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'var(--bg-main)' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(14, 165, 233, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>{previewProduct.category || 'Repuestos'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Star size={12} fill="#fbbf24" color="#fbbf24" /> 4.9 (12 reseñas)</span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 1rem 0', lineHeight: '1.2' }}>{previewProduct.name}</h2>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: '900', color: previewProduct.discount > 0 ? '#ef4444' : 'var(--text-main)', letterSpacing: '-1px' }}>
                      ${previewProduct.discount > 0 ? (previewProduct.price * (1 - previewProduct.discount/100)).toFixed(2) : previewProduct.price.toFixed(2)}
                    </span>
                    {previewProduct.discount > 0 && (
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: '600' }}>
                        ${previewProduct.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '1.2rem', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '0.5rem 0' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Descripción</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                    {previewProduct.desc || 'Este producto no tiene descripción. Añade una para atraer más clientes a tu publicación y detallar todas sus características.'}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Stock Disponible: <span style={{ color: 'var(--primary)' }}>{previewProduct.stock} unidades</span></span>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 'bold', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px -6px rgba(14, 165, 233, 0.4)' }} onClick={(e) => { e.preventDefault(); handleEditClick(previewProduct); setPreviewProduct(null); }}>
                    <Edit2 size={20} /> Editar Producto
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem', fontStyle: 'italic' }}>Estás en Modo Empresa - Vista de Catálogo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
