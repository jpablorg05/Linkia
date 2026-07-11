import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, MessageCircle, DollarSign, Award, ShoppingBag, Percent, ArrowUpRight, X, Calendar, List, Activity, Zap } from 'lucide-react';
import api from '../services/api';
import ModuleHero from '../components/ModuleHero';

export default function StatsPage() {
  const { user } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStat, setSelectedStat] = useState(null);

  useEffect(() => {
    // mock fetch
    setTimeout(() => {
      setStats({});
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--primary)' }}>
        <Activity size={32} className="animate-spin" />
      </div>
    );
  }

  // Dummy Data
  const chartData = [
    { name: 'Ene', Ingresos: 1200, Ventas: 10 },
    { name: 'Feb', Ingresos: 1800, Ventas: 15 },
    { name: 'Mar', Ingresos: 1500, Ventas: 12 },
    { name: 'Abr', Ingresos: 2400, Ventas: 20 },
    { name: 'May', Ingresos: 2200, Ventas: 18 },
    { name: 'Jun', Ingresos: 3500, Ventas: 25 },
    { name: 'Jul', Ingresos: 4100, Ventas: 30 }
  ];

  const miniChartData1 = [{v: 10},{v: 15},{v: 8},{v: 20},{v: 18},{v: 25}];
  const miniChartData2 = [{v: 40},{v: 30},{v: 45},{v: 50},{v: 35},{v: 60}];
  
  const categoryData = [
    { name: 'Electrónica', value: 4000, color: '#0ea5e9' },
    { name: 'Ferretería', value: 3000, color: '#8b5cf6' },
    { name: 'Hogar', value: 2000, color: '#10b981' },
    { name: 'Otros', value: 1000, color: '#f59e0b' },
  ];

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      
      <ModuleHero eyebrow="Inteligencia de Negocios" title="Centro de Rendimiento" subtitle="Visualiza el latido de tu negocio con métricas en tiempo real y proyecciones avanzadas." iconName="stats" fullBleed={true} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 2rem 3rem', maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        {/* TOP ROW: Asymmetric Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
          
          {/* HERO METRIC: Revenue */}
          <div 
            className="card-panel group" 
            onClick={() => setSelectedStat({ label: 'Volumen de Ingresos', value: '$12,450', change: '+24.5%', color: 'var(--primary)', bg: 'rgba(14, 165, 233, 0.1)', icon: <DollarSign size={24}/> })}
            style={{ 
              position: 'relative', overflow: 'hidden', padding: 0, borderRadius: '24px', 
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(14, 165, 233, 0.01) 100%)',
              border: '1px solid rgba(14, 165, 233, 0.2)', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              boxShadow: '0 10px 30px -10px rgba(14, 165, 233, 0.1)', transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(14, 165, 233, 0.2)'; e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(14, 165, 233, 0.1)'; e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.2)'; }}
          >
            <div style={{ padding: '2.5rem 2.5rem 0 2.5rem', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)' }}>
                    <TrendingUp size={24} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Volumen de Ingresos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-2px' }}>$12,450</h2>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                    <ArrowUpRight size={20} /> 24.5%
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '300px' }}>Tu crecimiento en los últimos 30 días ha superado el promedio del mercado.</p>
              </div>
              <div style={{ background: 'var(--bg-panel)', padding: '0.8rem 1.2rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Proyección</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '900' }}>$15K</span>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '220px', marginTop: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }} itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="Ingresos" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#heroGradient)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT COLUMN: Stacked Mini KPIs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Ventas */}
            <div 
              onClick={() => setSelectedStat({ label: 'Ventas Cerradas', value: '142', change: '+12%', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: <ShoppingBag size={20}/> })}
              style={{ flex: 1, background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-5px)'; e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(139, 92, 246, 0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <ShoppingBag size={16} color="#8b5cf6" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Ventas Cerradas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1px' }}>142</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>+12%</span>
                </div>
              </div>
              <div style={{ width: '100px', height: '60px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniChartData1}>
                    <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={3} dot={false} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ofertas */}
            <div 
              onClick={() => setSelectedStat({ label: 'Ofertas Activas', value: '85', change: '+45%', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <MessageCircle size={20}/> })}
              style={{ flex: 1, background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-5px)'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(245, 158, 11, 0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <MessageCircle size={16} color="#f59e0b" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Ofertas Activas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1px' }}>85</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>+45%</span>
                </div>
              </div>
              <div style={{ width: '100px', height: '60px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={miniChartData2}>
                    <Bar dataKey="v" fill="#f59e0b" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tasa */}
            <div 
              onClick={() => setSelectedStat({ label: 'Tasa de Conversión', value: '68%', change: '+5%', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <Zap size={20}/> })}
              style={{ flex: 1, background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-5px)'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(16, 185, 129, 0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <Zap size={16} color="#10b981" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Tasa de Conversión</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1px' }}>68%</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>+5%</span>
                </div>
              </div>
              <div style={{ width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                 {/* Radial Progress Mock */}
                 <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', background: 'conic-gradient(#10b981 68%, rgba(16, 185, 129, 0.1) 0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-panel)' }}></div>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM ROW: Split 50/50 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          
          {/* Detailed Bar Chart */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '900' }}>Rendimiento de Ventas</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>Volumen de ventas vs ingresos mensuales</p>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', padding: '0.2rem 0.5rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '4px' }}>Este Año</span>
              </div>
            </div>

            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                  <Bar yAxisId="left" dataKey="Ingresos" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={24} animationDuration={1500} />
                  <Bar yAxisId="right" dataKey="Ventas" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goal & Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Goal Card */}
            <div style={{ background: 'linear-gradient(135deg, var(--bg-panel) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(#10b981 78%, rgba(16, 185, 129, 0.1) 0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}>78%</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={20} color="#10b981"/> Meta Trimestral</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.4rem 0 1rem 0', lineHeight: 1.4 }}>Estás a solo <strong>$2,550</strong> de alcanzar el objetivo. Mantén este ritmo para desbloquear la insignia de Vendedor Élite.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--text-muted)' }}>$12,450 logrados</span>
                  <span style={{ color: 'var(--text-main)' }}>$15,000 meta</span>
                </div>
              </div>
            </div>

            {/* Categories Distribution */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
               <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: '900' }}>Distribución por Categorías</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  {categoryData.map((cat, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{cat.name}</span>
                        <span style={{ fontWeight: 'bold', color: cat.color }}>{cat.value / 100}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.value / 100}%`, height: '100%', background: cat.color, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

          </div>

        </div>
      </div>

      {/* HISTORY MODAL */}
      {selectedStat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }} onClick={() => setSelectedStat(null)}>
          <div className="card-panel animate-slide-up" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '20px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ background: selectedStat.bg, color: selectedStat.color, padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedStat.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: '900' }}>Historial</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedStat.label}</span>
                </div>
              </div>
              <button onClick={() => setSelectedStat(null)} style={{ background: 'var(--bg-main)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Valor Actual</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '950', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{selectedStat.value}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Variación</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedStat.color === 'var(--text-main)' ? '#10b981' : selectedStat.color }}>{selectedStat.change}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto', paddingRight: '0.5rem', flex: 1 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}><List size={14}/> Últimos Registros</span>
              
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <Calendar size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Registro #{2405 + i}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hace {i + 1} {i === 0 ? 'día' : 'días'}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    {selectedStat.label.includes('Volumen') ? `+$${(Math.random() * 500 + 100).toFixed(2)}` : 
                     selectedStat.label.includes('Tasa') ? `${(Math.random() * 10 + 90).toFixed(0)}%` : 
                     `+${Math.floor(Math.random() * 5 + 1)}`}
                  </span>
                </div>
              ))}
            </div>
            
            <button onClick={() => setSelectedStat(null)} className="btn-secondary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', borderRadius: '10px', fontWeight: 'bold' }}>Cerrar Detalles</button>
          </div>
        </div>
      )}

    </div>
  );
}
