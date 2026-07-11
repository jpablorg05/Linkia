import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import io from 'socket.io-client';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // --- THEME STATE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // --- AUTHENTICATION STATE ---
  const [user, setUser] = useState(null); 
  const [authLoading, setAuthLoading] = useState(true);

  // --- SOCKET STATE ---
  const [socket, setSocket] = useState(null);
  const socketRef = React.useRef(null);

  // --- BUYER STATE ---
  const [searchHistory, setSearchHistory] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [activeSearch, setActiveSearch] = useState(null);
  const [buyerOffers, setBuyerOffers] = useState([]);

  // --- SELLER STATE ---
  const [sellerLeads, setSellerLeads] = useState([]);
  const [sellerStats, setSellerStats] = useState({
    totalOffers: 0,
    responseRate: 100,
    closedSales: 0
  });
  const [sellerProfile, setSellerProfile] = useState({
    storeName: 'Mi Tienda Autorizada',
    slogan: 'Repuestos originales y garantizados.',
    description: 'Somos especialistas en autopartes de todas las marcas con más de 10 años de experiencia.',
    returnPolicy: 'Devoluciones en los primeros 7 días si el repuesto está sellado.',
    businessHours: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
    logoUrl: '',
    zone: 'Madrid', // Zona por defecto para pruebas
    categories: ['Tecnología y Móviles', 'Ferretería y Construcción', 'Moda y Calzado', 'Hogar y Muebles']
  });
  const sellerProfileRef = React.useRef(sellerProfile);
  const [inventoryTags, setInventoryTags] = useState([
    { id: 1, name: 'Tecnología', icon: 'smartphone' },
    { id: 2, name: 'Hogar', icon: 'home' },
    { id: 3, name: 'Moda', icon: 'shirt' },
    { id: 4, name: 'Ferretería', icon: 'wrench' }
  ]);
  const inventoryTagsRef = React.useRef(inventoryTags);
  const [catalogProducts, setCatalogProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.length === 0) {
          const defaultProducts = [
            { name: 'Laptop Dell Inspiron 15', desc: 'Intel Core i7, 16GB RAM, 512GB SSD. Ideal para trabajo y diseño.', price: 850.00, stock: 5, discount: 0, category: 'Tecnología y Móviles', image: '', images: [] },
            { name: 'Auriculares Inalámbricos Sony WH-1000XM4', desc: 'Cancelación de ruido activa, batería de 30 horas. Color Negro.', price: 299.99, stock: 8, discount: 15, category: 'Tecnología y Móviles', image: '', images: [] },
            { name: 'Taladro Percutor Dewalt 20V MAX', desc: 'Incluye 2 baterías y cargador. Maletín duro de transporte.', price: 145.00, stock: 12, discount: 0, category: 'Ferretería y Construcción', image: '', images: [] },
            { name: 'Silla Ergonómica Herman Miller', desc: 'Silla de oficina con soporte lumbar ajustable. Envío gratis.', price: 1200.00, stock: 3, discount: 10, category: 'Hogar y Muebles', image: '', images: [] }
          ];
          const seeded = [];
          for (const p of defaultProducts) {
            const added = await api.post('/products', p);
            seeded.push(added.data);
          }
          setCatalogProducts(seeded);
        } else {
          setCatalogProducts(res.data);
        }
      } catch (e) {
        console.error("Error cargando productos", e);
      }
    };
    loadProducts();
  }, []);
  
  
  const [teamMembers, setTeamMembers] = useState([
    { id: 101, name: 'Carlos (Mostrador)', email: 'ventas@mitienda.com', role: 'sales', status: 'online', lastActive: 'Ahora' },
    { id: 102, name: 'Luis (Almacén)', email: 'logistica@mitienda.com', role: 'logistics', status: 'offline', lastActive: 'Hace 2 horas' }
  ]);

  const [crmClients, setCrmClients] = useState([
    { id: 201, name: 'Juan Pérez', contact: 'Juan Pérez', email: 'juan@email.com', phone: '+1234567890', totalSpent: 4500.00, lastPurchase: 'Hace 2 días', label: 'vip' },
    { id: 202, name: 'Agencia de Marketing R&A', contact: 'María López', email: 'compras@mkt.com', phone: '+0987654321', totalSpent: 1250.50, lastPurchase: 'Hace 1 semana', label: 'recurring' },
    { id: 203, name: 'Carlos Rodríguez', contact: 'Carlos Rodríguez', email: 'carlos@gmail.com', phone: '+1122334455', totalSpent: 120.00, lastPurchase: 'Hace 1 mes', label: 'new' }
  ]);

  const [loyaltyPoints, setLoyaltyPoints] = useState(250); // Puntos iniciales para el comprador

  useEffect(() => {
    inventoryTagsRef.current = inventoryTags;
    sellerProfileRef.current = sellerProfile;
  }, [inventoryTags, sellerProfile]);

  // --- COMMON STATE ---
  const [notifications, setNotifications] = useState([]);
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data);
    } catch (e) {
      console.error("Error cargando chats", e);
    }
  };

  // --- INIT & PERSISTENCE ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/users/me');
          const savedSubRole = localStorage.getItem('subRole') || 'admin';
          setUser({ ...res.data, subRole: savedSubRole });
          connectSocket(res.data.id, res.data.role);
          fetchChats();
        } catch (error) {
          console.error("Error al recuperar sesión:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('subRole');
        }
      }
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const connectSocket = (userId, role) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://linkia-backend.onrender.com';
    const newSocket = io(SOCKET_URL);
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', userId);
      // Los admin también se unen para poder probar el simulador de roles
      if (role === 'seller' || role === 'admin') {
        newSocket.emit('join_sellers');
      }
    });

    // Escuchar leads en tiempo real
    newSocket.on('lead_received', (data) => {
      // RADAR INTELIGENTE LOGIC:
      const profile = sellerProfileRef.current;
      
      // 1. Filtrar por Categoría (Rama)
      if (data.category && profile.categories) {
        if (!profile.categories.includes(data.category)) {
          console.log(`[Radar] Solicitud filtrada: Categoría '${data.category}' no aplica.`);
          return; // Stop processing, ignore lead
        }
      }

      // 2. Filtrar por Zona / Geolocation (Radio)
      const dataZoneStr = data.zone ? String(data.zone) : '';
      if (dataZoneStr && dataZoneStr.includes('km')) {
        console.log(`[Radar] Solicitud detectada en el radio permitido: ${dataZoneStr}`);
      } else if (dataZoneStr && profile.zone && profile.zone !== 'Global') {
        if (dataZoneStr.toLowerCase() !== profile.zone.toLowerCase()) {
          console.log(`[Radar] Solicitud filtrada: Zona '${dataZoneStr}' no aplica.`);
          return;
        }
      }

      setSellerLeads(prev => {
        const leadId = data.searchId || data.id || Date.now();
        // Evitar duplicados: mismo id de solicitud, o la misma solicitud sin responder del mismo comprador.
        const yaExiste = prev.some(l =>
          l.id === leadId ||
          (l.status === 'new' && l.buyerId === data.buyerId && l.item === data.query)
        );
        if (yaExiste) return prev;
        return [{
          id: leadId,
          buyerId: data.buyerId,
          user: data.buyerName,
          item: data.query,
          time: 'Ahora',
          status: 'new',
          category: data.category,
          zone: data.zone,
          expiresAt: data.expiresAt
        }, ...prev];
      });
      
      setNotifications(prev => {
        const text = `Nueva solicitud en tu zona (${data.zone}): ${data.query}`;
        const timeStr = new Date().toLocaleTimeString();
        if (prev.some(n => n.text === text && n.date.slice(0, 5) === timeStr.slice(0, 5))) {
          return prev;
        }
        return [{
          text,
          date: timeStr,
          link: `/chat/${data.buyerId}`
        }, ...prev];
      });
    });

    newSocket.on('receive_message', (msg) => {
      fetchChats();
      // Agregar notificación si no estamos en el chat
      if (!window.location.pathname.includes(`/chat`)) {
        setNotifications(prev => [{
          text: `Nuevo mensaje recibido.`,
          date: new Date().toLocaleTimeString(),
          link: '/inbox'
        }, ...prev]);
      }
    });
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  // --- ACTIONS ---
  const login = async (formData) => {
    const res = await api.post('/auth/login', formData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('subRole', 'admin');
    const loggedUser = { ...res.data.user, subRole: 'admin' }; // By default, logged in user is admin
    setUser(loggedUser);
    connectSocket(res.data.user.id, res.data.user.role);
    fetchChats();
    return loggedUser;
  };

  const register = async (accountType, formData) => {
    const payload = { role: accountType, ...formData };
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('subRole', 'admin');
    const newUser = { ...res.data.user, subRole: 'admin' }; // By default, logged in user is admin
    setUser(newUser);
    connectSocket(res.data.user.id, res.data.user.role);
    fetchChats();
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('subRole');
    setUser(null);
    disconnectSocket();
  };

  const addSearch = (term, category = '', zone = 'Global', expiresAt = null) => {
    setSearchHistory(prev => [{ term, category, zone, date: new Date().toLocaleDateString() }, ...prev]);
    // Emitir socket
    if (socket && user) {
      const searchId = `${user.id}-${Date.now()}`; // id único para evitar leads duplicados
      socket.emit('new_search', {
        searchId,
        buyerId: user.id,
        buyerName: user.name,
        query: term,
        category,
        zone,
        expiresAt
      });
    }
  };

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
  };

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;

  return (
    <AppContext.Provider value={{
      user, setUser, login, register, logout,
      searchHistory, addSearch,
      buyerOrders, setBuyerOrders,
      activeSearch, setActiveSearch,
      buyerOffers, setBuyerOffers,
      sellerLeads, setSellerLeads, sellerStats,
      sellerProfile, setSellerProfile,
      inventoryTags, setInventoryTags,
      catalogProducts, setCatalogProducts,
      teamMembers, setTeamMembers,
      crmClients, setCrmClients,
      loyaltyPoints, setLoyaltyPoints,
      notifications, addNotification,
      chats, setChats,
      socket,
      theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};
