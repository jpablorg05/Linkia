import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Package, Zap, Upload, Building2, Smartphone, FileCheck } from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function PaymentMockPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setBuyerOrders } = useAppContext();
  const [status, setStatus] = useState('idle'); // idle, processing, success
  
  const price = location.state?.price || 120.00;
  const shipping = 15.00;
  const total = price + shipping;

  const [paymentMethod, setPaymentMethod] = useState('zelle');
  const [reference, setReference] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  const handleReportPayment = async (e) => {
    e.preventDefault();
    setStatus('processing');
    
    try {
      let imageUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        const resUpload = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = resUpload.data.imageUrl;
      }

      await api.post('/payments/pay', { orderId, reference, imageUrl });
      
      setStatus('success');
      
      setTimeout(() => {
        navigate('/orders');
      }, 4000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="animate-slide-up" style={{ minHeight: '100%', display: 'flex', background: 'var(--bg-main)' }}>
      
      {/* Left Column - Order Summary & Bank Details */}
      <div style={{ flex: 1, padding: '4rem', background: 'linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-main) 100%)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', color: 'var(--text-main)' }}>
          <ShieldCheck size={24} color="var(--primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>Linkia Transacciones Seguras</span>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'normal' }}>Monto a Transferir</h2>
          <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '-1px', marginBottom: '2rem' }}>
            ${total.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>USD</span>
          </div>

          <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Building2 size={18} /> Datos Bancarios de la Tienda
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button onClick={() => setPaymentMethod('zelle')} className={paymentMethod === 'zelle' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1 }}>Zelle</button>
              <button onClick={() => setPaymentMethod('transfer')} className={paymentMethod === 'transfer' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1 }}>Banesco Panamá</button>
              <button onClick={() => setPaymentMethod('pm')} className={paymentMethod === 'pm' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1 }}>Pago Móvil</button>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-main)' }}>
              {paymentMethod === 'zelle' && (
                <>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Correo Zelle:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>pagos@techstoreplus.com</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Titular:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Tech Store Plus LLC</div>
                </>
              )}
              {paymentMethod === 'transfer' && (
                <>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Banco:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>Banesco Panamá</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Número de Cuenta:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>0000 1234 5678 9012</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Titular:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Tech Store Plus LLC (J-12345678)</div>
                </>
              )}
              {paymentMethod === 'pm' && (
                <>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Banco:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>Banesco (0134)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Teléfono:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>0414-1234567</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Cédula/RIF:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>J-123456789</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>Tasa del día (BCV): Bs. 36.50</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Report Form */}
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        
        {status === 'idle' && (
          <div className="animate-slide-up" style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Reportar Pago</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Realiza la transferencia a los datos indicados y adjunta el comprobante para que la tienda lo verifique.</p>

            <form onSubmit={handleReportPayment}>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Número de Referencia</label>
                <div style={{ position: 'relative' }}>
                  <FileCheck size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Ej. 12345678" 
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3rem', border: '1px solid var(--border-color)', borderRadius: '12px', outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '1rem' }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Capture o Comprobante</label>
                <div style={{ position: 'relative', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: 'var(--bg-panel)', transition: 'border-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                    required
                  />
                  <Upload size={32} color={fileName ? 'var(--success)' : 'var(--text-muted)'} style={{ margin: '0 auto 1rem' }} />
                  {fileName ? (
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{fileName} adjuntado</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Haz clic o arrastra la imagen aquí</span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)' }}>
                Enviar Reporte de Pago
              </button>
            </form>

            <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancelar y volver
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex-center animate-slide-up" style={{ flexDirection: 'column', height: '100%', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 80, height: 80, marginBottom: '2rem' }}>
              <div className="spin-animation" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
              <Upload size={32} color="var(--primary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Subiendo comprobante...</h3>
          </div>
        )}

        {status === 'success' && (
          <div className="flex-center animate-slide-up" style={{ flexDirection: 'column', height: '100%', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
              <ShieldCheck size={48} color="#f59e0b" />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.5px' }}>¡Reporte Enviado!</h2>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2rem' }}>
              Tu pago ha sido notificado a la tienda. Están revisando el comprobante y el dinero en su cuenta.
            </p>

            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 'bold', color: '#f59e0b' }}>
              Estado: Pendiente por Verificación
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex-center animate-slide-up" style={{ flexDirection: 'column', height: '100%', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem' }}>❌</span>
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Error al enviar</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2rem' }}>
              Hubo un problema procesando tu pago. Por favor intenta de nuevo.
            </p>
            <button onClick={() => setStatus('idle')} className="btn-primary" style={{ padding: '1rem 2rem' }}>
              Volver a intentar
            </button>
          </div>
        )}

      </div>

      <style>{`
        .spin-animation {
          animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
