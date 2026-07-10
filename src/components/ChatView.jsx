import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Store, User } from 'lucide-react';

export default function ChatView({ chatData, role, onBack }) {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'seller', 
      text: chatData?.message || 'Hola, tengo el repuesto disponible.', 
      time: '10:00 AM' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages([...messages, {
      id: Date.now(),
      sender: role,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');

    // Simulate reply if buyer is sending
    if (role === 'buyer') {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'seller',
          text: 'Perfecto, ¿a qué hora puedes pasar a retirarlo o prefieres envío?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 2000);
    }
  };

  const getPartnerName = () => {
    if (role === 'buyer') return chatData?.sellerName || 'Vendedor';
    return 'Usuario Comprador'; // En un entorno real vendría de chatData
  };

  return (
    <div className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      
      {/* Chat Header */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {role === 'buyer' ? <Store size={20} color="white" /> : <User size={20} color="white" />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{getPartnerName()}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>En línea</span>
          </div>
        </div>
      </div>

      {/* Info Banner (Offer context) */}
      <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--primary)', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem' }}>Cotización activa: <strong>${chatData?.price || '0.00'}</strong></span>
        <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Comprar Ahora</button>
      </div>

      {/* Messages Area */}
      <div className="glass-panel" style={{ flex: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderTop: 'none', borderBottom: 'none', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => {
          const isMe = msg.sender === role;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                border: isMe ? 'none' : '1px solid var(--border-color)',
                padding: '0.8rem 1rem', 
                borderRadius: '16px', 
                borderBottomRightRadius: isMe ? 0 : '16px',
                borderBottomLeftRadius: isMe ? '16px' : 0,
                maxWidth: '70%',
                wordBreak: 'break-word'
              }}>
                <p style={{ fontSize: '0.95rem' }}>{msg.text}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{msg.time}</span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel" style={{ padding: '1rem', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '9999px', padding: '0.8rem 1.5rem', color: 'white', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: 48, height: 48, padding: 0 }}>
            <Send size={20} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      </div>

    </div>
  );
}
