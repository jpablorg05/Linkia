import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, User, Building, Store, Clock, ShieldCheck, Image as ImageIcon, Tag, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, sellerProfile, setSellerProfile, inventoryTags, setInventoryTags } = useAppContext();
  
  // Basic user data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Seller storefront specific state
  const [storeData, setStoreData] = useState({});
  
  // Inventory Tags state
  const [localTags, setLocalTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Sincronizar estados locales cuando los datos carguen desde el Contexto
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (sellerProfile) {
      setStoreData(sellerProfile);
    }
  }, [sellerProfile]);

  useEffect(() => {
    if (inventoryTags) {
      setLocalTags(inventoryTags);
    }
  }, [inventoryTags]);

  const handleUserChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleStoreChange = (e) => setStoreData({ ...storeData, [e.target.name]: e.target.value });

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleaned = tagInput.trim();
      if (cleaned && !localTags.some(t => t.name.toLowerCase() === cleaned.toLowerCase())) {
        setLocalTags([...localTags, { id: Date.now(), name: cleaned, icon: 'tag' }]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (idToRemove) => {
    setLocalTags(localTags.filter(tag => tag.id !== idToRemove));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (user && user.role === 'seller') {
      setSellerProfile(storeData);
      setInventoryTags(localTags);
    }
    alert('Perfil y Vitrina actualizados con éxito');
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Cargando perfil del usuario...
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          {user.role === 'buyer' ? 'Mi Perfil' : 'Configuración de Vitrina Pública'}
        </h2>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Tarjeta de Información Básica */}
          <div className="card-panel" style={{ padding: '2rem', background: 'var(--bg-panel)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--primary)" /> Información de Contacto
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Nombre Completo / Razón Social</label>
                <input type="text" name="name" value={formData.name} onChange={handleUserChange} className="input-field" style={{ marginBottom: 0 }} />
              </div>

              <div>
                <label className="input-label">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleUserChange} className="input-field" style={{ marginBottom: 0 }} />
              </div>

              <div>
                <label className="input-label">Teléfono Público</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleUserChange} className="input-field" style={{ marginBottom: 0 }} />
              </div>
            </div>
          </div>

          {/* Tarjeta de Vitrina Pública (Solo para Vendedores) */}
          {user.role === 'seller' && (
            <div className="card-panel" style={{ padding: '2rem', background: 'var(--bg-panel)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={20} color="var(--primary)" /> Perfil de Tienda Pública
              </h3>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', flexDirection: 'column' }}>
                  <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.7rem' }}>Subir Logo</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Este logo y nombre se mostrará a los compradores cuando vean tus cotizaciones y perfil.</p>
                  <label className="input-label">Nombre Comercial de la Tienda</label>
                  <input type="text" name="storeName" value={storeData.storeName} onChange={handleStoreChange} className="input-field" style={{ marginBottom: 0 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div>
                  <label className="input-label">Slogan o Lema</label>
                  <input type="text" name="slogan" value={storeData.slogan} onChange={handleStoreChange} placeholder="Ej: Los mejores repuestos originales" className="input-field" style={{ marginBottom: 0 }} />
                </div>

                <div>
                  <label className="input-label">Descripción de la Empresa</label>
                  <textarea name="description" value={storeData.description} onChange={handleStoreChange} className="input-field" style={{ minHeight: '100px', resize: 'vertical', marginBottom: 0 }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> Horario de Atención</label>
                    <input type="text" name="businessHours" value={storeData.businessHours} onChange={handleStoreChange} placeholder="Ej: Lun-Vie 8AM - 5PM" className="input-field" style={{ marginBottom: 0 }} />
                  </div>
                  <div>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={16} /> Políticas de Devolución</label>
                    <input type="text" name="returnPolicy" value={storeData.returnPolicy} onChange={handleStoreChange} placeholder="Ej: 7 días de garantía" className="input-field" style={{ marginBottom: 0 }} />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tarjeta de Radar e Inventario (Solo Vendedores) */}
          {user.role === 'seller' && (
            <div className="card-panel" style={{ padding: '2rem', background: 'var(--bg-panel)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={20} color="var(--primary)" /> Especialidades de Inventario (Radar)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Agrega palabras clave de los repuestos o marcas que vendes (ej. "Toyota", "Frenos"). 
                El <strong>Radar Inteligente</strong> solo te enviará solicitudes de clientes si coinciden con estas etiquetas. Si lo dejas vacío, recibirás todas las solicitudes.
              </p>
              
              <div>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Escribe una etiqueta y presiona Enter..." 
                  className="input-field" 
                  style={{ marginBottom: '1rem' }} 
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {localTags.length === 0 && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No has añadido especialidades. Recibirás todo tipo de solicitudes.</span>}
                  {localTags.map(tag => (
                    <div key={tag.id} style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {tag.name}
                      <button type="button" onClick={() => handleRemoveTag(tag.id)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botón Guardar Flotante */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: '2rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', boxShadow: 'var(--shadow-md)' }}>
              <Save size={20} /> Guardar Perfil Público
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
