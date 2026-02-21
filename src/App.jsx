import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Toast from './components/Toast';
import { collection, onSnapshot, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const CRMPanel = lazy(() => import('./pages/CRMPanel'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const CustomerAuth = lazy(() => import('./pages/CustomerAuth'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '923141603089';

export default function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (['admin', 'crm', 'checkout', 'login', 'track', 'auth', 'dashboard'].includes(hash)) return hash;
    return 'landing';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [selectedService, setSelectedService] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [customerUser, setCustomerUser] = useState(null);

  // Fetch real-time data from Firestore
  useEffect(() => {
    // Services Listener
    const unsubscribeServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      // Optionally sort by best seller or ID here
      servicesData.sort((a, b) => Number(a.id) - Number(b.id));
      setServices(servicesData);
    });

    // Orders Listener (Sort by date descending)
    const qOrders = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setOrders(ordersData);
    });

    // Customers Listener
    const unsubscribeCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setCustomers(customersData);
    });

    // Tickets Listener (Sort by date descending)
    const qTickets = query(collection(db, 'tickets'), orderBy('date', 'desc'));
    const unsubscribeTickets = onSnapshot(qTickets, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTickets(ticketsData);
    });

    return () => {
      unsubscribeServices();
      unsubscribeOrders();
      unsubscribeCustomers();
      unsubscribeTickets();
    };
  }, []);

  // Customer Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCustomerUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('nv_theme') || 'dark');

  // Check existing auth session
  useEffect(() => {
    const auth = localStorage.getItem('nv_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        // Session valid for 24 hours
        if (Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('nv_auth');
        }
      } catch {
        localStorage.removeItem('nv_auth');
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Request notification permission for admin
  useEffect(() => {
    if ((currentPage === 'admin' || currentPage === 'crm') && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [currentPage]);

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nv_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Dynamic SEO tags
  useEffect(() => {
    const titles = {
      landing: 'NoVerify - Premium Digital Services',
      checkout: 'Checkout - NoVerify',
      admin: 'Admin Dashboard - NoVerify',
      crm: 'CRM - NoVerify',
      login: 'Admin Login - NoVerify',
      track: 'Track Your Order - NoVerify'
    };
    const descriptions = {
      landing: "Pakistan's most trusted source for verified accounts & real numbers. Delivered in minutes.",
      checkout: 'Complete your purchase securely.',
      admin: 'Manage your NoVerify platform.',
      crm: 'Manage your customers.',
      login: 'Login to NoVerify Admin panel.',
      track: 'Track the status of your NoVerify order.'
    };

    document.title = titles[currentPage] || titles.landing;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', descriptions[currentPage] || descriptions.landing);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      metaDesc.content = descriptions[currentPage] || descriptions.landing;
      document.head.appendChild(metaDesc);
    }
  }, [currentPage]);

  // Toast helpers
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.location.hash = page === 'landing' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
  };


  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'Successfully logged in to Admin Dashboard'
      });
      navigate('admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nv_auth');
    setIsAuthenticated(false);
    addToast({
      type: 'info',
      message: 'Logged out successfully'
    });
    navigate('landing');
  };

  const playOrderNotification = (title, message) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio notification failed', e);
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/icon.svg' });
    }
  };

  const handleSubmitOrder = async (formData, service) => {
    const today = new Date().toISOString().split('T')[0];
    const orderId = `NV-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderQty = service.orderQuantity || 1;
    const serviceTitleWithQty = orderQty > 1 ? `${service.title} (x${orderQty})` : service.title;

    playOrderNotification('New Order Received! 💰', `${formData.name} ordered ${serviceTitleWithQty}`);

    const newOrder = {
      id: orderId,
      userId: customerUser ? customerUser.uid : null,
      customerName: formData.name,
      service: serviceTitleWithQty,
      status: 'pending',
      date: today,
      amount: service.price,
      paymentMethod: {
        jazzcash: 'JazzCash',
        easypaisa: 'EasyPaisa',
        sadapay: 'SadaPay',
        nayapay: 'NayaPay',
        bank: 'Bank Transfer'
      }[formData.paymentMethod] || formData.paymentMethod,
      city: '',
      phone: formData.phone,
      email: formData.email
    };

    // 1. Write Order to Firestore
    try {
      await setDoc(doc(db, "orders", orderId), newOrder);

      // 2. Update or Create Customer in Firestore
      const existingCustomer = customers.find(
        c => c.email.toLowerCase() === formData.email.toLowerCase() || c.phone === formData.phone
      );

      if (existingCustomer) {
        const updatedCustomer = {
          ...existingCustomer,
          totalOrders: existingCustomer.totalOrders + 1,
          totalSpent: existingCustomer.totalSpent + service.price,
          lastOrder: today,
          phone: formData.phone,
          email: formData.email
        };
        await setDoc(doc(db, "customers", existingCustomer.id.toString()), updatedCustomer);
      } else {
        const newCustomerId = Date.now().toString();
        const newCustomer = {
          id: newCustomerId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: '',
          totalOrders: 1,
          totalSpent: service.price,
          status: 'active',
          notes: `New customer. First order: ${serviceTitleWithQty}. WhatsApp: ${formData.whatsapp}`,
          joinDate: today,
          lastOrder: today
        };
        await setDoc(doc(db, "customers", newCustomerId), newCustomer);
      }

      // 3. Deduct Stock in Firestore
      const newStock = Math.max(0, service.stock - orderQty);
      await setDoc(doc(db, "services", service.id.toString()), { ...service, stock: newStock });

    } catch (error) {
      console.error("Error submitting order to Firestore:", error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to submit order to database.'
      });
      return orderId;
    }

    addToast({
      type: 'success',
      title: 'Order Placed!',
      message: `Order ${orderId} submitted successfully`
    });

    return orderId;
  };

  const renderPage = () => {
    // Protect admin routes
    if ((currentPage === 'admin' || currentPage === 'crm') && !isAuthenticated) {
      return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(201, 168, 76, 0.2)', borderTopColor: '#c9a84c', animation: 'spin 1s linear infinite' }}></div></div>}>
          <LoginPage onLogin={handleLogin} />
        </Suspense>
      );
    }

    let Component;
    switch (currentPage) {
      case 'landing':
        Component = <LandingPage services={services} onNavigate={navigate} onSelectService={handleSelectService} />;
        break;
      case 'checkout':
        Component = <CheckoutPage selectedService={selectedService} onNavigate={navigate} onSubmitOrder={handleSubmitOrder} />;
        break;
      case 'admin':
        Component = <AdminPanel services={services} orders={orders} customers={customers} tickets={tickets} addToast={addToast} />;
        break;
      case 'crm':
        Component = <CRMPanel customers={customers} orders={orders} />;
        break;
      case 'login':
        Component = isAuthenticated ? (navigate('admin'), null) : <LoginPage onLogin={handleLogin} />;
        break;
      case 'track':
        Component = <OrderTrackingPage orders={orders} onNavigate={navigate} />;
        break;
      case 'auth':
        Component = customerUser ? (navigate('dashboard'), null) : <CustomerAuth onNavigate={navigate} addToast={addToast} />;
        break;
      case 'dashboard':
        Component = <CustomerDashboard customerUser={customerUser} orders={orders} tickets={tickets} onNavigate={navigate} addToast={addToast} />;
        break;
      default:
        Component = <LandingPage services={services} onNavigate={navigate} onSelectService={handleSelectService} />;
        break;
    }

    return (
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(201, 168, 76, 0.2)', borderTopColor: '#c9a84c', animation: 'spin 1s linear infinite' }}></div>
        </div>
      }>
        {Component}
      </Suspense>
    );
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ─── Navigation Bar ─── */}
      <nav className={`navbar ${scrolled || currentPage !== 'landing' ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Brand */}
          <div className="navbar-brand" onClick={() => navigate('landing')}>
            <div className="navbar-brand-icon">N</div>
            <div className="navbar-brand-text">
              No<span>Verify</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <button
              className={`navbar-link ${currentPage === 'landing' ? 'active' : ''}`}
              onClick={() => navigate('landing')}
            >
              🏠 Home
            </button>
            <button
              className={`navbar-link ${currentPage === 'track' ? 'active' : ''}`}
              onClick={() => navigate('track')}
            >
              📦 Track Order
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => window.open(`https://wa.me/${WHATSAPP}`, '_blank')}
              style={{ marginLeft: '8px' }}
            >
              💬 WhatsApp
            </button>
            <button
              className="navbar-link"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ fontSize: '1.1rem', padding: '8px 12px' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isAuthenticated && (
              <>
                <button
                  className={`navbar-link ${currentPage === 'admin' ? 'active' : ''}`}
                  onClick={() => navigate('admin')}
                  style={{ color: '#c9a84c' }}
                >
                  🔐 Admin
                </button>
                <button
                  className="navbar-link"
                  onClick={handleLogout}
                  style={{ color: '#f87171' }}
                >
                  🚪 Logout
                </button>
              </>
            )}
            {customerUser ? (
              <button
                className={`navbar-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigate('dashboard')}
                style={{ color: '#34d399' }}
              >
                👤 My Profile
              </button>
            ) : (
              <button
                className={`navbar-link ${currentPage === 'auth' ? 'active' : ''}`}
                onClick={() => navigate('auth')}
              >
                👤 Login
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ─── Page Content ─── */}
      <main key={currentPage}>
        {renderPage()}
      </main>
    </div>
  );
}
