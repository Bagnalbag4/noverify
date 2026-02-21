import { useState } from 'react';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
const emptyProduct = {
    id: '',
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '',
    icon: '📦',
    category: 'numbers',
    deliveryTime: '5-30 minutes',
    features: ['', '', ''],
    badge: ''
};

const iconOptions = ['📱', '📧', '💬', '🎵', '🎬', '📦', '🛡️', '🔑', '💳', '🌐', '📞', '🎮'];

export default function AdminPanel({ services, orders, customers, tickets = [], addToast }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [orderSearch, setOrderSearch] = useState('');

    // Product management state
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ ...emptyProduct });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // CRM state
    const [crmSearch, setCrmSearch] = useState('');
    const [crmStatusFilter, setCrmStatusFilter] = useState('all');
    const [crmCityFilter, setCrmCityFilter] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [editingNote, setEditingNote] = useState('');

    // Tickets state
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketReply, setTicketReply] = useState('');

    const handleReplyTicket = async () => {
        if (!ticketReply.trim() || !selectedTicket) return;
        try {
            const updatedTicket = {
                ...selectedTicket,
                status: 'pending',
                messages: [
                    ...(selectedTicket.messages || []),
                    { sender: 'admin', text: ticketReply, timestamp: new Date().toISOString() }
                ]
            };
            await setDoc(doc(db, "tickets", selectedTicket.id), updatedTicket);
            if (addToast) addToast({ type: 'success', message: 'Reply sent successfully' });
            setSelectedTicket(updatedTicket);
            setTicketReply('');
        } catch (error) {
            console.error("Error replying to ticket:", error);
            if (addToast) addToast({ type: 'error', message: 'Failed to send reply' });
        }
    };

    const updateTicketStatus = async (ticketId, newStatus) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        try {
            await setDoc(doc(db, "tickets", ticketId), { ...ticket, status: newStatus });
            if (addToast) addToast({ type: 'success', message: `Ticket marked as ${newStatus}` });
            if (selectedTicket && selectedTicket.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Low stock alert on mount
    import('react').then(({ useEffect }) => {
        useEffect(() => {
            const lowStockItems = services.filter(s => s.stock <= 3);
            if (lowStockItems.length > 0) {
                addToast({
                    type: 'warning',
                    title: 'Stock Alert ⚠️',
                    message: `${lowStockItems.length} product(s) are critically low on stock.`
                });
            }
        }, []); // eslint-disable-line react-hooks/exhaustive-deps
    });

    // ─── Export Helpers ───
    const exportToCSV = (data, filename) => {
        if (!data.length) return;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                let val = row[h];
                if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                    val = '"' + val.replace(/"/g, '""') + '"';
                }
                if (Array.isArray(val)) val = val.join('; ');
                return val;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        if (addToast) addToast({ type: 'success', title: 'Export Complete', message: `${filename}.csv downloaded successfully` });
    };

    const exportToJSON = () => {
        const backup = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: { services, orders, customers }
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `noverify_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        if (addToast) addToast({ type: 'success', title: 'Backup Created', message: 'Full data backup downloaded as JSON' });
    };

    const importFromJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const backup = JSON.parse(ev.target.result);
                if (backup.data) {
                    if (backup.data.services) onUpdateServices(backup.data.services);
                    if (backup.data.orders) onUpdateOrders(backup.data.orders);
                    if (backup.data.customers) onUpdateCustomers(backup.data.customers);
                    if (addToast) addToast({ type: 'success', title: 'Import Complete', message: `Restored backup from ${backup.exportDate || 'file'}` });
                } else {
                    if (addToast) addToast({ type: 'error', message: 'Invalid backup file format' });
                }
            } catch {
                if (addToast) addToast({ type: 'error', message: 'Failed to parse backup file' });
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const filteredOrders = activeFilter === 'all'
        ? orders
        : orders.filter(o => o.status === activeFilter);

    const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.amount, 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const updateOrderStatus = async (orderId, newStatus) => {
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (!orderToUpdate) return;

        try {
            await setDoc(doc(db, "orders", orderId.toString()), { ...orderToUpdate, status: newStatus });
            if (addToast) addToast({ type: 'success', message: `Order status updated to ${newStatus}` });
        } catch (error) {
            console.error("Error updating order status:", error);
            if (addToast) addToast({ type: 'error', message: 'Failed to update order status' });
        }
        setShowOrderModal(false);
    };

    // ─── Product CRUD ───
    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm({
            ...emptyProduct,
            id: 'svc-' + Date.now()
        });
        setShowProductModal(true);
    };

    const openEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            ...product,
            price: String(product.price),
            originalPrice: String(product.originalPrice),
            discount: String(product.discount),
            stock: String(product.stock),
            features: [...product.features, '', '', ''].slice(0, Math.max(product.features.length, 3))
        });
        setShowProductModal(true);
    };

    const handleProductFormChange = (field, value) => {
        setProductForm(prev => ({ ...prev, [field]: value }));
    };

    const handleFeatureChange = (index, value) => {
        setProductForm(prev => {
            const newFeatures = [...prev.features];
            newFeatures[index] = value;
            return { ...prev, features: newFeatures };
        });
    };

    const addFeatureField = () => {
        setProductForm(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeatureField = (index) => {
        setProductForm(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const saveProduct = async () => {
        const price = parseInt(productForm.price) || 0;
        const originalPrice = parseInt(productForm.originalPrice) || price;
        const discount = parseInt(productForm.discount) || 0;
        const stock = parseInt(productForm.stock) || 0;

        const productData = {
            ...productForm,
            price,
            originalPrice: originalPrice || Math.round(price / (1 - discount / 100)),
            discount,
            stock,
            features: productForm.features.filter(f => f.trim() !== '')
        };

        if (productData.features.length === 0) {
            productData.features = ['Standard delivery'];
        }

        if (!productData.title.trim()) {
            if (addToast) addToast({ type: 'error', message: 'Product title is required' });
            return;
        }

        try {
            await setDoc(doc(db, "services", productData.id.toString()), productData);
            if (addToast) addToast({ type: 'success', title: 'Product Saved', message: `${productData.title} saved successfully.` });
        } catch (error) {
            console.error("Error saving product:", error);
            if (addToast) addToast({ type: 'error', message: 'Failed to save product to database' });
        }

        setShowProductModal(false);
        setEditingProduct(null);
    };

    const deleteProduct = async (productId) => {
        try {
            await deleteDoc(doc(db, "services", productId.toString()));
            if (addToast) addToast({ type: 'success', title: 'Product Deleted', message: `Product removed successfully.` });
        } catch (error) {
            console.error("Error deleting product:", error);
            if (addToast) addToast({ type: 'error', message: 'Failed to delete product' });
        }
        setShowDeleteConfirm(null);
    };

    const updateStock = async (serviceId, newStock) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        try {
            await setDoc(doc(db, "services", serviceId.toString()), { ...service, stock: parseInt(newStock) || 0 });
            if (addToast) addToast({ type: 'success', message: 'Stock updated successfully' });
        } catch (error) {
            console.error("Error updating stock:", error);
            if (addToast) addToast({ type: 'error', message: 'Failed to update stock' });
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(17, 17, 24, 0.95)',
                    border: '1px solid rgba(201, 168, 76, 0.2)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <p style={{ fontSize: '0.82rem', color: '#a09e96', marginBottom: '4px' }}>{label}</p>
                    {payload.map((entry, i) => (
                        <p key={i} style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c9a84c' }}>
                            {entry.name === 'revenue' ? `Rs. ${entry.value.toLocaleString()}` : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        color: '#f0ece2',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'border-color 0.3s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.82rem',
        fontWeight: 600,
        color: '#a09e96',
        marginBottom: '6px'
    };

    // Dynamic Chart Data Generation
    const generateChartData = () => {
        const revMap = {};
        const srvMap = {};

        const validOrders = orders.filter(o => o.status === 'completed' || o.status === 'processing');

        validOrders.forEach(o => {
            const date = new Date(o.date || Date.now());
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            if (!revMap[dayName]) revMap[dayName] = 0;
            revMap[dayName] += o.amount || 0;

            const srvName = o.service || 'Unknown';
            if (!srvMap[srvName]) srvMap[srvName] = 0;
            srvMap[srvName] += o.amount || 0;
        });

        const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const revenueData = Object.keys(revMap)
            .sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b))
            .map(day => ({ day, revenue: revMap[day] }));

        const serviceRevenueData = Object.keys(srvMap)
            .map(name => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, revenue: srvMap[name] }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);

        // Fallback for empty data so charts don't break
        if (revenueData.length === 0) {
            revenueData.push({ day: 'Today', revenue: 0 });
        }
        if (serviceRevenueData.length === 0) {
            serviceRevenueData.push({ name: 'No Data', revenue: 0 });
        }

        return { revenueData, serviceRevenueData };
    };

    const { revenueData, serviceRevenueData } = generateChartData();

    return (
        <div className="page-enter" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh' }}>
            <div className="container-wide">
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                            fontWeight: 700,
                            color: '#f0ece2',
                            marginBottom: '4px'
                        }}>
                            Admin Dashboard
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: '#6b6963' }}>
                            Manage products, orders, and stock from one place.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge badge-success" style={{ padding: '6px 14px' }}>
                            ● System Online
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    <StatsCard icon="💰" label="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} change="12.5%" changeType="positive" index={0} />
                    <StatsCard icon="📦" label="Total Orders" value={orders.length} change="8.2%" changeType="positive" index={1} />
                    <StatsCard icon="✅" label="Completed" value={completedOrders} change="15%" changeType="positive" index={2} />
                    <StatsCard icon="⏳" label="Pending" value={pendingOrders} change="3 new" changeType="negative" index={3} />
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '24px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '4px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    width: 'fit-content'
                }}>
                    {[
                        { key: 'products', label: '📦 Products' },
                        { key: 'orders', label: '📋 Orders' },
                        { key: 'customers', label: '👥 Customers' },
                        { key: 'tickets', label: '🎫 Tickets' },
                        { key: 'charts', label: '📊 Analytics' },
                        { key: 'stock', label: '🏷️ Stock' },
                        { key: 'data', label: '📤 Data' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                background: activeTab === tab.key ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                                color: activeTab === tab.key ? '#c9a84c' : '#6b6963'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/* ─── Products Tab ─── */}
                {/* ═══════════════════════════════════════════ */}
                {activeTab === 'products' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        {/* Add button */}
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.88rem', color: '#6b6963' }}>
                                {services.length} product{services.length !== 1 ? 's' : ''} listed
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={openAddProduct}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                ＋ Add New Product
                            </button>
                        </div>

                        {/* Products Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                            gap: '20px'
                        }}>
                            {services.map((product, i) => (
                                <div key={product.id} className="glass-panel" style={{
                                    padding: '24px',
                                    animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}>
                                    {/* Product Header */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '14px',
                                            background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.12), rgba(201, 168, 76, 0.04))',
                                            border: '1px solid rgba(201, 168, 76, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            flexShrink: 0
                                        }}>
                                            {product.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: '#f0ece2',
                                                marginBottom: '4px',
                                                lineHeight: 1.3
                                            }}>
                                                {product.title}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>{product.category}</span>
                                                {product.badge && (
                                                    <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>{product.badge}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Stock Row */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.04)'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: '#6b6963', marginBottom: '2px' }}>Price</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontFamily: "'Playfair Display', serif",
                                                    fontSize: '1.2rem',
                                                    fontWeight: 700,
                                                    color: '#c9a84c'
                                                }}>
                                                    Rs. {product.price.toLocaleString()}
                                                </span>
                                                {product.discount > 0 && (
                                                    <span style={{
                                                        fontSize: '0.78rem',
                                                        color: '#6b6963',
                                                        textDecoration: 'line-through'
                                                    }}>
                                                        Rs. {product.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#6b6963', marginBottom: '2px' }}>Stock</div>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                color: product.stock <= 3 ? '#f87171' : product.stock <= 5 ? '#fbbf24' : '#34d399'
                                            }}>
                                                {product.stock}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {product.features.slice(0, 3).map((f, fi) => (
                                            <span key={fi} style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                fontSize: '0.75rem',
                                                color: '#a09e96',
                                                border: '1px solid rgba(255, 255, 255, 0.04)'
                                            }}>
                                                {f}
                                            </span>
                                        ))}
                                        {product.features.length > 3 && (
                                            <span style={{ fontSize: '0.75rem', color: '#6b6963', padding: '4px 6px' }}>
                                                +{product.features.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        marginTop: 'auto',
                                        paddingTop: '8px',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.04)'
                                    }}>
                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                flex: 1,
                                                background: 'rgba(201, 168, 76, 0.08)',
                                                color: '#c9a84c',
                                                border: '1px solid rgba(201, 168, 76, 0.2)'
                                            }}
                                            onClick={() => openEditProduct(product)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                background: 'rgba(248, 113, 113, 0.08)',
                                                color: '#f87171',
                                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                                padding: '6px 14px'
                                            }}
                                            onClick={() => setShowDeleteConfirm(product.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {/* Delete confirmation */}
                                    {showDeleteConfirm === product.id && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(10, 10, 15, 0.95)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '16px',
                                            padding: '24px',
                                            zIndex: 2,
                                            animation: 'fadeIn 0.2s ease'
                                        }}>
                                            <div style={{ fontSize: '2rem' }}>⚠️</div>
                                            <p style={{ fontSize: '0.95rem', color: '#f0ece2', fontWeight: 600, textAlign: 'center' }}>
                                                Delete "{product.title}"?
                                            </p>
                                            <p style={{ fontSize: '0.82rem', color: '#6b6963', textAlign: 'center' }}>
                                                This action cannot be undone.
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: 'rgba(248, 113, 113, 0.15)',
                                                        color: '#f87171',
                                                        border: '1px solid rgba(248, 113, 113, 0.3)'
                                                    }}
                                                    onClick={() => deleteProduct(product.id)}
                                                >
                                                    Yes, Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {services.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '80px 20px',
                                color: '#6b6963'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📦</div>
                                <p style={{ fontSize: '1rem', marginBottom: '20px' }}>No products yet. Add your first product!</p>
                                <button className="btn btn-primary" onClick={openAddProduct}>
                                    ＋ Add New Product
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* ─── Orders Tab ─── */}
                {/* ═══════════════════════════════════════════ */}
                {activeTab === 'orders' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        {/* Filter buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            marginBottom: '20px',
                            flexWrap: 'wrap'
                        }}>
                            {[
                                { key: 'all', label: 'All Orders' },
                                { key: 'pending', label: 'Pending' },
                                { key: 'processing', label: 'Processing' },
                                { key: 'completed', label: 'Completed' },
                                { key: 'cancelled', label: 'Cancelled' }
                            ].map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`btn btn-sm ${activeFilter === filter.key ? '' : 'btn-secondary'}`}
                                    style={activeFilter === filter.key ? {
                                        background: 'rgba(201, 168, 76, 0.1)',
                                        color: '#c9a84c',
                                        border: '1px solid rgba(201, 168, 76, 0.3)'
                                    } : {}}
                                >
                                    {filter.label}
                                    {filter.key !== 'all' && (
                                        <span style={{
                                            marginLeft: '6px',
                                            fontSize: '0.75rem',
                                            opacity: 0.7
                                        }}>
                                            ({orders.filter(o => filter.key === 'all' ? true : o.status === filter.key).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Orders Table */}
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Service</th>
                                            <th>Amount</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order, i) => {
                                            const orderDate = new Date(order.date || Date.now());
                                            const daysOld = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
                                            const isOverdue = order.status === 'pending' && daysOld >= 1;

                                            return (
                                                <tr key={order.id} style={{
                                                    animation: `fadeInUp 0.3s ease ${i * 0.03}s both`,
                                                    background: isOverdue ? 'rgba(248, 113, 113, 0.05)' : 'transparent',
                                                    borderLeft: isOverdue ? '3px solid #f87171' : 'none'
                                                }}>
                                                    <td style={{ fontWeight: 600, color: '#c9a84c', fontSize: '0.85rem' }}>
                                                        {order.id}
                                                        {isOverdue && (
                                                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#f87171', marginTop: '4px' }}>
                                                                ⚠️ Overdue
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{order.customerName}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#6b6963' }}>{order.city}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {order.service}
                                                    </td>
                                                    <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>Rs. {order.amount.toLocaleString()}</td>
                                                    <td style={{ fontSize: '0.85rem', color: '#a09e96' }}>{order.paymentMethod}</td>
                                                    <td>
                                                        <span className={`badge ${order.status === 'completed' ? 'badge-success' :
                                                            order.status === 'pending' ? 'badge-warning' :
                                                                order.status === 'processing' ? 'badge-info' :
                                                                    'badge-danger'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                style={{ padding: '6px 12px' }}
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowOrderModal(true);
                                                                }}
                                                            >
                                                                View
                                                            </button>
                                                            {order.status === 'pending' && (
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        background: 'rgba(52, 211, 153, 0.1)',
                                                                        color: '#34d399',
                                                                        border: '1px solid rgba(52, 211, 153, 0.3)'
                                                                    }}
                                                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                                                >
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {order.status === 'processing' && (
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        background: 'rgba(201, 168, 76, 0.1)',
                                                                        color: '#c9a84c',
                                                                        border: '1px solid rgba(201, 168, 76, 0.3)'
                                                                    }}
                                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                                >
                                                                    Deliver
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* ─── Charts Tab ─── */}
                {/* ═══════════════════════════════════════════ */}
                {activeTab === 'charts' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                        gap: '24px',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        {/* Revenue Chart */}
                        <div className="glass-panel" style={{ padding: '28px' }}>
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                marginBottom: '24px',
                                color: '#f0ece2'
                            }}>
                                Weekly Revenue
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="day" stroke="#6b6963" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#6b6963" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000)}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} fill="url(#goldGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Orders by Service Chart */}
                        <div className="glass-panel" style={{ padding: '28px' }}>
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                marginBottom: '24px',
                                color: '#f0ece2'
                            }}>
                                Revenue by Service
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={serviceRevenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="name" stroke="#6b6963" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b6963" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000)}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="revenue" fill="#c9a84c" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* ─── Stock Tab ─── */}
                {/* ═══════════════════════════════════════════ */}
                {activeTab === 'stock' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Service</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Current Stock</th>
                                            <th>Status</th>
                                            <th>Update Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((service, i) => (
                                            <tr key={service.id} style={{ animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ fontSize: '1.3rem' }}>{service.icon}</span>
                                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{service.title}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-gold">{service.category}</span>
                                                </td>
                                                <td style={{ fontWeight: 600, color: '#c9a84c' }}>Rs. {service.price.toLocaleString()}</td>
                                                <td>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        fontSize: '1.1rem',
                                                        color: service.stock <= 3 ? '#f87171' : service.stock <= 5 ? '#fbbf24' : '#34d399'
                                                    }}>
                                                        {service.stock}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${service.stock <= 2 ? 'badge-danger' :
                                                        service.stock <= 5 ? 'badge-warning' :
                                                            'badge-success'
                                                        }`}>
                                                        {service.stock <= 2 ? 'Critical' : service.stock <= 5 ? 'Low' : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ padding: '6px 12px', minWidth: '36px' }}
                                                            onClick={() => updateStock(service.id, Math.max(0, service.stock - 1))}
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={service.stock}
                                                            onChange={(e) => updateStock(service.id, e.target.value)}
                                                            style={{
                                                                width: '60px',
                                                                padding: '6px 8px',
                                                                background: 'rgba(255,255,255,0.04)',
                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                borderRadius: '8px',
                                                                color: '#f0ece2',
                                                                textAlign: 'center',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600
                                                            }}
                                                            min="0"
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ padding: '6px 12px', minWidth: '36px' }}
                                                            onClick={() => updateStock(service.id, service.stock + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* ─── Customers / CRM Tab ─── */}
                {/* ═══════════════════════════════════════════ */}
                {activeTab === 'customers' && (() => {
                    const crmCities = [...new Set(customers.map(c => c.city).filter(Boolean))];
                    const filteredCustomers = customers.filter(c => {
                        const matchesSearch = c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            c.email.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            c.phone.includes(crmSearch);
                        const matchesStatus = crmStatusFilter === 'all' || c.status === crmStatusFilter;
                        const matchesCity = crmCityFilter === 'all' || c.city === crmCityFilter;
                        return matchesSearch && matchesStatus && matchesCity;
                    });
                    const getCustomerOrders = (customerName) => orders.filter(o => o.customerName === customerName);
                    const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
                    const vipCount = customers.filter(c => c.status === 'vip').length;
                    const activeCount = customers.filter(c => c.status === 'active').length;
                    const crmStatusColors = {
                        active: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
                        vip: { bg: 'rgba(201, 168, 76, 0.1)', color: '#c9a84c', border: 'rgba(201, 168, 76, 0.3)' },
                        inactive: { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
                        blocked: { bg: 'rgba(107, 105, 99, 0.1)', color: '#6b6963', border: 'rgba(107, 105, 99, 0.3)' }
                    };

                    return (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            {/* CRM Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                {[
                                    { label: 'Total Customers', value: customers.length, icon: '👥' },
                                    { label: 'VIP Customers', value: vipCount, icon: '⭐' },
                                    { label: 'Active Customers', value: activeCount, icon: '✅' },
                                    { label: 'Total Revenue', value: `Rs. ${totalSpentAll.toLocaleString()}`, icon: '💰' }
                                ].map((stat, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '14px',
                                        padding: '18px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        animation: `fadeInUp 0.4s ease ${i * 0.1}s both`
                                    }}>
                                        <div style={{
                                            fontSize: '1.3rem',
                                            width: '42px',
                                            height: '42px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(201, 168, 76, 0.06)',
                                            borderRadius: '10px'
                                        }}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontSize: '1.2rem',
                                                fontWeight: 700,
                                                color: '#f0ece2',
                                                lineHeight: 1.2
                                            }}>{stat.value}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#6b6963' }}>{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Search & Filters */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '20px',
                                flexWrap: 'wrap',
                                alignItems: 'center'
                            }}>
                                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '1rem',
                                        color: '#6b6963'
                                    }}>🔍</span>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Search by name, email, or phone..."
                                        value={crmSearch}
                                        onChange={(e) => setCrmSearch(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                                <select
                                    value={crmStatusFilter}
                                    onChange={(e) => setCrmStatusFilter(e.target.value)}
                                    style={{
                                        padding: '14px 18px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '12px',
                                        color: '#f0ece2',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        minWidth: '150px'
                                    }}
                                >
                                    <option value="all" style={{ background: '#1a1a24' }}>All Status</option>
                                    <option value="active" style={{ background: '#1a1a24' }}>Active</option>
                                    <option value="vip" style={{ background: '#1a1a24' }}>VIP</option>
                                    <option value="inactive" style={{ background: '#1a1a24' }}>Inactive</option>
                                    <option value="blocked" style={{ background: '#1a1a24' }}>Blocked</option>
                                </select>
                                <select
                                    value={crmCityFilter}
                                    onChange={(e) => setCrmCityFilter(e.target.value)}
                                    style={{
                                        padding: '14px 18px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '12px',
                                        color: '#f0ece2',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        minWidth: '150px'
                                    }}
                                >
                                    <option value="all" style={{ background: '#1a1a24' }}>All Cities</option>
                                    {crmCities.map(city => (
                                        <option key={city} value={city} style={{ background: '#1a1a24' }}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Results count */}
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#6b6963',
                                marginBottom: '16px'
                            }}>
                                Showing {filteredCustomers.length} of {customers.length} customers
                            </div>

                            {/* Customer Table */}
                            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Phone</th>
                                                <th>City</th>
                                                <th>Orders</th>
                                                <th>Total Spent</th>
                                                <th>Status</th>
                                                <th>Last Order</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCustomers.map((customer, i) => {
                                                const sc = crmStatusColors[customer.status] || crmStatusColors.active;
                                                const daysSinceLastOrder = customer.lastOrder ? (new Date() - new Date(customer.lastOrder)) / (1000 * 60 * 60 * 24) : 0;
                                                const isChurnRisk = customer.totalOrders > 0 && daysSinceLastOrder > 30;
                                                return (
                                                    <tr key={customer.id} style={{ animation: `fadeInUp 0.3s ease ${i * 0.03}s both` }}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div style={{
                                                                    width: '38px',
                                                                    height: '38px',
                                                                    borderRadius: '10px',
                                                                    background: sc.bg,
                                                                    border: `1px solid ${sc.border}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: 700,
                                                                    color: sc.color,
                                                                    flexShrink: 0
                                                                }}>
                                                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                                                </div>
                                                                <div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer.name}</div>
                                                                        {isChurnRisk && (
                                                                            <span style={{ fontSize: '0.65rem', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(248, 113, 113, 0.3)' }} title="Churn Risk (>30 days since last order)">⚠️ Risk</span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#6b6963' }}>{customer.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem', color: '#a09e96' }}>{customer.phone}</td>
                                                        <td style={{ fontSize: '0.85rem', color: '#a09e96' }}>{customer.city || '—'}</td>
                                                        <td style={{ fontWeight: 600, textAlign: 'center' }}>{customer.totalOrders}</td>
                                                        <td style={{ fontWeight: 600, color: '#c9a84c' }}>Rs. {customer.totalSpent.toLocaleString()}</td>
                                                        <td>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '4px 12px',
                                                                borderRadius: '100px',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 600,
                                                                letterSpacing: '0.5px',
                                                                textTransform: 'uppercase',
                                                                background: sc.bg,
                                                                color: sc.color,
                                                                border: `1px solid ${sc.border}`
                                                            }}>
                                                                {customer.status === 'vip' ? '⭐ ' : ''}{customer.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.82rem', color: '#6b6963' }}>{customer.lastOrder}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    style={{ padding: '6px 12px' }}
                                                                    onClick={() => {
                                                                        setSelectedCustomer(customer);
                                                                        setEditingNote(customer.notes);
                                                                        setShowCustomerModal(true);
                                                                    }}
                                                                >
                                                                    View
                                                                </button>
                                                                {customer.status !== 'vip' && (
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        style={{
                                                                            padding: '6px 12px',
                                                                            background: 'rgba(201, 168, 76, 0.1)',
                                                                            color: '#c9a84c',
                                                                            border: '1px solid rgba(201, 168, 76, 0.3)'
                                                                        }}
                                                                        onClick={() => onUpdateCustomers(customers.map(c => c.id === customer.id ? { ...c, status: 'vip' } : c))}
                                                                    >
                                                                        ⭐ VIP
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredCustomers.length === 0 && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: '#6b6963'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
                                        <div style={{ fontSize: '0.95rem' }}>No customers found matching your search.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* ═══════════════════════════════════════════ */}
                {/* ─── Support Tickets Tab ─── */}
                {/* ═══════════════════════════════════════════ */}
                {activeTab === 'tickets' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Ticket ID</th>
                                            <th>Customer</th>
                                            <th>Subject / Category</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.sort((a, b) => new Date(b.date) - new Date(a.date)).map((ticket, i) => (
                                            <tr key={ticket.id} style={{ animation: `fadeInUp 0.3s ease ${i * 0.03}s both` }}>
                                                <td style={{ fontWeight: 600, color: '#c9a84c', fontSize: '0.85rem' }}>{ticket.id}</td>
                                                <td>
                                                    <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{ticket.customerName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b6963' }}>{ticket.customerEmail}</div>
                                                </td>
                                                <td style={{ maxWidth: '250px' }}>
                                                    <div style={{ fontSize: '0.72rem', color: '#a09e96', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ticket.category}</div>
                                                    <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${ticket.status === 'resolved' ? 'badge-success' : ticket.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: '#a09e96' }}>{new Date(ticket.date).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        style={{ padding: '6px 12px' }}
                                                        onClick={() => {
                                                            setSelectedTicket(ticket);
                                                            setShowTicketModal(true);
                                                        }}
                                                    >
                                                        Respond
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {tickets.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: '#6b6963'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎫</div>
                                    <div style={{ fontSize: '0.95rem' }}>No support tickets available.</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* ─── Data Export/Import Tab ─── */}
                {/* ═══════════════════════════════════════════ */}
                {activeTab === 'data' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '20px'
                        }}>
                            {/* Export Orders CSV */}
                            <div className="glass-panel" style={{ padding: '28px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📋</div>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: '#f0ece2',
                                    marginBottom: '8px'
                                }}>Export Orders</h3>
                                <p style={{ fontSize: '0.85rem', color: '#6b6963', marginBottom: '20px', lineHeight: 1.5 }}>
                                    Download all {orders.length} orders as a CSV spreadsheet file
                                </p>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => exportToCSV(orders.map(o => ({
                                        ID: o.id,
                                        Customer: o.customerName,
                                        Service: o.service,
                                        Amount: o.amount,
                                        Payment: o.paymentMethod,
                                        Status: o.status,
                                        Date: o.date,
                                        Phone: o.phone,
                                        Email: o.email,
                                        City: o.city
                                    })), 'noverify_orders')}
                                >
                                    📥 Download Orders CSV
                                </button>
                            </div>

                            {/* Export Customers CSV */}
                            <div className="glass-panel" style={{ padding: '28px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>👥</div>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: '#f0ece2',
                                    marginBottom: '8px'
                                }}>Export Customers</h3>
                                <p style={{ fontSize: '0.85rem', color: '#6b6963', marginBottom: '20px', lineHeight: 1.5 }}>
                                    Download all {customers.length} customers as a CSV spreadsheet file
                                </p>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => exportToCSV(customers.map(c => ({
                                        Name: c.name,
                                        Email: c.email,
                                        Phone: c.phone,
                                        City: c.city,
                                        Orders: c.totalOrders,
                                        TotalSpent: c.totalSpent,
                                        Status: c.status,
                                        JoinDate: c.joinDate,
                                        LastOrder: c.lastOrder,
                                        Notes: c.notes
                                    })), 'noverify_customers')}
                                >
                                    📥 Download Customers CSV
                                </button>
                            </div>

                            {/* Full Backup JSON */}
                            <div className="glass-panel" style={{ padding: '28px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>💾</div>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: '#f0ece2',
                                    marginBottom: '8px'
                                }}>Full Backup</h3>
                                <p style={{ fontSize: '0.85rem', color: '#6b6963', marginBottom: '20px', lineHeight: 1.5 }}>
                                    Download complete backup (products, orders, customers) as JSON
                                </p>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={exportToJSON}
                                >
                                    💾 Download Full Backup
                                </button>
                            </div>

                            {/* Import Backup */}
                            <div className="glass-panel" style={{ padding: '28px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📤</div>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: '#f0ece2',
                                    marginBottom: '8px'
                                }}>Restore Backup</h3>
                                <p style={{ fontSize: '0.85rem', color: '#6b6963', marginBottom: '20px', lineHeight: 1.5 }}>
                                    Import a previously downloaded JSON backup file to restore data
                                </p>
                                <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
                                    📂 Choose Backup File
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={importFromJSON}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            {/* Export Products CSV */}
                            <div className="glass-panel" style={{ padding: '28px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📦</div>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: '#f0ece2',
                                    marginBottom: '8px'
                                }}>Export Products</h3>
                                <p style={{ fontSize: '0.85rem', color: '#6b6963', marginBottom: '20px', lineHeight: 1.5 }}>
                                    Download all {services.length} products as a CSV spreadsheet file
                                </p>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => exportToCSV(services.map(s => ({
                                        ID: s.id,
                                        Title: s.title,
                                        Price: s.price,
                                        OriginalPrice: s.originalPrice,
                                        Discount: s.discount + '%',
                                        Stock: s.stock,
                                        Category: s.category,
                                        DeliveryTime: s.deliveryTime,
                                        Features: s.features.join('; '),
                                        Badge: s.badge || ''
                                    })), 'noverify_products')}
                                >
                                    📥 Download Products CSV
                                </button>
                            </div>
                        </div>

                        {/* Data Summary */}
                        <div className="glass-panel" style={{
                            padding: '24px',
                            marginTop: '24px',
                            display: 'flex',
                            justifyContent: 'space-around',
                            flexWrap: 'wrap',
                            gap: '20px',
                            textAlign: 'center'
                        }}>
                            {[
                                { label: 'Products', count: services.length, icon: '📦' },
                                { label: 'Orders', count: orders.length, icon: '📋' },
                                { label: 'Customers', count: customers.length, icon: '👥' },
                                { label: 'Total Revenue', count: `Rs. ${orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0).toLocaleString()}`, icon: '💰' }
                            ].map((item, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{item.icon}</div>
                                    <div style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: '1.3rem',
                                        fontWeight: 700,
                                        color: '#c9a84c'
                                    }}>{item.count}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#6b6963', marginTop: '2px' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* ─── Product Add/Edit Modal ─── */}
            {/* ═══════════════════════════════════════════ */}
            <Modal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                title={editingProduct ? `Edit: ${editingProduct.title}` : 'Add New Product'}
                footer={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setShowProductModal(false)}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={saveProduct}
                            style={{ minWidth: '120px' }}
                        >
                            {editingProduct ? '💾 Save Changes' : '＋ Add Product'}
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '8px' }}>
                    {/* Icon Picker */}
                    <div>
                        <label style={labelStyle}>Icon</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {iconOptions.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => handleProductFormChange('icon', icon)}
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '10px',
                                        border: `1px solid ${productForm.icon === icon ? 'rgba(201, 168, 76, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                                        background: productForm.icon === icon ? 'rgba(201, 168, 76, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label style={labelStyle}>Product Title *</label>
                        <input
                            type="text"
                            value={productForm.title}
                            onChange={(e) => handleProductFormChange('title', e.target.value)}
                            placeholder="e.g. YouTube Verification Number"
                            style={inputStyle}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            value={productForm.description}
                            onChange={(e) => handleProductFormChange('description', e.target.value)}
                            placeholder="Brief product description..."
                            style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label style={labelStyle}>Image URL (optional)</label>
                        <input
                            type="text"
                            value={productForm.image || ''}
                            onChange={(e) => handleProductFormChange('image', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            style={inputStyle}
                        />
                    </div>

                    {/* Rating & Reviews */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Rating (1.0 - 5.0)</label>
                            <input
                                type="number"
                                value={productForm.rating || ''}
                                onChange={(e) => handleProductFormChange('rating', parseFloat(e.target.value))}
                                placeholder="5.0"
                                style={inputStyle}
                                min="1"
                                max="5"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Reviews Count</label>
                            <input
                                type="number"
                                value={productForm.reviewsCount || ''}
                                onChange={(e) => handleProductFormChange('reviewsCount', parseInt(e.target.value, 10))}
                                placeholder="150"
                                style={inputStyle}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Category + Badge */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select
                                value={productForm.category}
                                onChange={(e) => handleProductFormChange('category', e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                            >
                                <option value="numbers" style={{ background: '#1a1a24' }}>Phone Numbers</option>
                                <option value="accounts" style={{ background: '#1a1a24' }}>Accounts & Channels</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Badge (optional)</label>
                            <input
                                type="text"
                                value={productForm.badge}
                                onChange={(e) => handleProductFormChange('badge', e.target.value)}
                                placeholder="e.g. 🔥 Hot, ⭐ Best Seller"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Price Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Price (Rs.) *</label>
                            <input
                                type="number"
                                value={productForm.price}
                                onChange={(e) => handleProductFormChange('price', e.target.value)}
                                placeholder="500"
                                style={inputStyle}
                                min="0"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Original Price</label>
                            <input
                                type="number"
                                value={productForm.originalPrice}
                                onChange={(e) => handleProductFormChange('originalPrice', e.target.value)}
                                placeholder="800"
                                style={inputStyle}
                                min="0"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Discount %</label>
                            <input
                                type="number"
                                value={productForm.discount}
                                onChange={(e) => handleProductFormChange('discount', e.target.value)}
                                placeholder="30"
                                style={inputStyle}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Stock + Delivery */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Stock Quantity *</label>
                            <input
                                type="number"
                                value={productForm.stock}
                                onChange={(e) => handleProductFormChange('stock', e.target.value)}
                                placeholder="10"
                                style={inputStyle}
                                min="0"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Delivery Time</label>
                            <input
                                type="text"
                                value={productForm.deliveryTime}
                                onChange={(e) => handleProductFormChange('deliveryTime', e.target.value)}
                                placeholder="5-30 minutes"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Features</label>
                            <button
                                onClick={addFeatureField}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#c9a84c',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                + Add Feature
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {productForm.features.map((feature, fi) => (
                                <div key={fi} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(fi, e.target.value)}
                                        placeholder={`Feature ${fi + 1}`}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                    {productForm.features.length > 1 && (
                                        <button
                                            onClick={() => removeFeatureField(fi)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                                background: 'rgba(248, 113, 113, 0.06)',
                                                color: '#f87171',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ═══════════════════════════════════════════ */}
            {/* ─── Order Detail Modal ─── */}
            {/* ═══════════════════════════════════════════ */}
            <Modal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                title={`Order ${selectedOrder?.id || ''}`}
                footer={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {selectedOrder?.status === 'pending' && (
                            <>
                                <button
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' }}
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                                >
                                    Reject
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                                >
                                    Approve
                                </button>
                            </>
                        )}
                        {selectedOrder?.status === 'processing' && (
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                            >
                                Mark Delivered
                            </button>
                        )}
                        <button className="btn btn-sm btn-secondary" onClick={() => setShowOrderModal(false)}>
                            Close
                        </button>
                    </div>
                }
            >
                {selectedOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { label: 'Customer', value: selectedOrder.customerName },
                            { label: 'Email', value: selectedOrder.email },
                            { label: 'Phone', value: selectedOrder.phone },
                            { label: 'City', value: selectedOrder.city },
                            { label: 'Service', value: selectedOrder.service },
                            { label: 'Amount', value: `Rs. ${selectedOrder.amount.toLocaleString()}`, color: '#c9a84c' },
                            { label: 'Payment', value: selectedOrder.paymentMethod },
                            { label: 'Date', value: selectedOrder.date }
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                            }}>
                                <span style={{ fontSize: '0.88rem', color: '#6b6963' }}>{item.label}</span>
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: item.color || '#f0ece2',
                                    maxWidth: '250px',
                                    textAlign: 'right'
                                }}>{item.value}</span>
                            </div>
                        ))}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0'
                        }}>
                            <span style={{ fontSize: '0.88rem', color: '#6b6963' }}>Status</span>
                            <span className={`badge ${selectedOrder.status === 'completed' ? 'badge-success' :
                                selectedOrder.status === 'pending' ? 'badge-warning' :
                                    selectedOrder.status === 'processing' ? 'badge-info' :
                                        'badge-danger'
                                }`}>
                                {selectedOrder.status}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ═══════════════════════════════════════════ */}
            {/* ─── Customer Detail Modal ─── */}
            {/* ═══════════════════════════════════════════ */}
            <Modal
                isOpen={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                title={selectedCustomer ? `${selectedCustomer.name}` : 'Customer Detail'}
                footer={
                    <button className="btn btn-sm btn-secondary" onClick={() => setShowCustomerModal(false)}>
                        Close
                    </button>
                }
            >
                {selectedCustomer && (() => {
                    const custOrders = orders.filter(o => o.customerName === selectedCustomer.name);
                    const crmStatusColors = {
                        active: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
                        vip: { bg: 'rgba(201, 168, 76, 0.1)', color: '#c9a84c', border: 'rgba(201, 168, 76, 0.3)' },
                        inactive: { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
                        blocked: { bg: 'rgba(107, 105, 99, 0.1)', color: '#6b6963', border: 'rgba(107, 105, 99, 0.3)' }
                    };
                    const daysSinceLastOrder = selectedCustomer.lastOrder ? (new Date() - new Date(selectedCustomer.lastOrder)) / (1000 * 60 * 60 * 24) : 0;
                    const isChurnRisk = selectedCustomer.totalOrders > 0 && daysSinceLastOrder > 30;
                    return (
                        <div>
                            {/* Customer info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: '24px',
                                paddingBottom: '20px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                            }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.15), rgba(201, 168, 76, 0.05))',
                                    border: '1px solid rgba(201, 168, 76, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: '#c9a84c',
                                    flexShrink: 0
                                }}>
                                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f0ece2' }}>
                                            {selectedCustomer.name}
                                        </h4>
                                        {isChurnRisk && (
                                            <span style={{ fontSize: '0.75rem', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                                                ⚠️ Churn Risk
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#6b6963' }}>📧 {selectedCustomer.email}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#6b6963', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            📱 {selectedCustomer.phone}
                                            <button
                                                onClick={() => window.open(`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                                                style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                                                title="Message on WhatsApp"
                                            >
                                                💬 WhatsApp
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '10px',
                                marginBottom: '24px'
                            }}>
                                {[
                                    { label: 'Orders', value: selectedCustomer.totalOrders },
                                    { label: 'Spent', value: `Rs. ${selectedCustomer.totalSpent.toLocaleString()}` },
                                    { label: 'Since', value: selectedCustomer.joinDate }
                                ].map((stat, i) => (
                                    <div key={i} style={{
                                        textAlign: 'center',
                                        padding: '14px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.04)'
                                    }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c9a84c', marginBottom: '2px' }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#6b6963', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Status change */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a09e96', marginBottom: '8px', display: 'block' }}>
                                    Status
                                </label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {['active', 'vip', 'inactive', 'blocked'].map(status => {
                                        const sc = crmStatusColors[status];
                                        const isActive = selectedCustomer.status === status;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    onUpdateCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, status } : c));
                                                    setSelectedCustomer(prev => ({ ...prev, status }));
                                                }}
                                                style={{
                                                    padding: '6px 16px',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${isActive ? sc.border : 'rgba(255,255,255,0.06)'}`,
                                                    background: isActive ? sc.bg : 'transparent',
                                                    color: isActive ? sc.color : '#6b6963',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    textTransform: 'capitalize',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {status}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tags */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a09e96', marginBottom: '8px', display: 'block' }}>
                                    Tags
                                </label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    {(selectedCustomer.tags || []).map(tag => (
                                        <span key={tag} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {tag}
                                            <button onClick={() => {
                                                const newTags = selectedCustomer.tags.filter(t => t !== tag);
                                                onUpdateCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, tags: newTags } : c));
                                                setSelectedCustomer(prev => ({ ...prev, tags: newTags }));
                                            }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        id="new-tag-input"
                                        placeholder="Add tag (e.g. VIP, Wholesale)..."
                                        className="input-field"
                                        style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1 }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                const val = e.target.value.trim();
                                                const currentTags = selectedCustomer.tags || [];
                                                if (!currentTags.includes(val)) {
                                                    const newTags = [...currentTags, val];
                                                    onUpdateCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, tags: newTags } : c));
                                                    setSelectedCustomer(prev => ({ ...prev, tags: newTags }));
                                                }
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => {
                                            const input = document.getElementById('new-tag-input');
                                            const val = input.value.trim();
                                            if (val) {
                                                const currentTags = selectedCustomer.tags || [];
                                                if (!currentTags.includes(val)) {
                                                    const newTags = [...currentTags, val];
                                                    onUpdateCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, tags: newTags } : c));
                                                    setSelectedCustomer(prev => ({ ...prev, tags: newTags }));
                                                }
                                                input.value = '';
                                            }
                                        }}
                                    >
                                        Add Tag
                                    </button>
                                </div>
                            </div>

                            {/* Notes */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a09e96', marginBottom: '8px', display: 'block' }}>
                                    Notes
                                </label>
                                <textarea
                                    className="input-field"
                                    value={editingNote}
                                    onChange={(e) => setEditingNote(e.target.value)}
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                    placeholder="Add notes about this customer..."
                                />
                                <button
                                    className="btn btn-sm btn-primary"
                                    style={{ marginTop: '8px' }}
                                    onClick={() => {
                                        onUpdateCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, notes: editingNote } : c));
                                        setSelectedCustomer(prev => ({ ...prev, notes: editingNote }));
                                    }}
                                >
                                    Save Note
                                </button>
                            </div>

                            {/* Order history */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a09e96', marginBottom: '10px', display: 'block' }}>
                                    Order History
                                </label>
                                {custOrders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b6963', fontSize: '0.88rem' }}>
                                        No orders found
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {custOrders.map(order => (
                                            <div key={order.id} style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                                borderRadius: '10px',
                                                padding: '14px 16px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '8px'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '0.88rem', color: '#f0ece2', marginBottom: '2px' }}>
                                                        {order.service.length > 35 ? order.service.substring(0, 35) + '...' : order.service}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b6963' }}>
                                                        {order.id} · {order.date}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#c9a84c' }}>
                                                        Rs. {order.amount.toLocaleString()}
                                                    </span>
                                                    <span className={`badge ${order.status === 'completed' ? 'badge-success' :
                                                        order.status === 'pending' ? 'badge-warning' :
                                                            order.status === 'processing' ? 'badge-info' :
                                                                'badge-danger'
                                                        }`} style={{ fontSize: '0.68rem' }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* ═══════════════════════════════════════════ */}
            {/* ─── Ticket Respond Modal ─── */}
            {/* ═══════════════════════════════════════════ */}
            {selectedTicket && (
                <Modal
                    isOpen={showTicketModal}
                    onClose={() => setShowTicketModal(false)}
                    title={`Ticket: ${selectedTicket.id}`}
                    footer={
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {selectedTicket.status !== 'resolved' && (
                                    <button className="btn btn-sm btn-secondary" onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}>✅ Mark Resolved</button>
                                )}
                                {selectedTicket.status === 'resolved' && (
                                    <button className="btn btn-sm btn-secondary" onClick={() => updateTicketStatus(selectedTicket.id, 'open')} style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>Reopen Ticket</button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-sm btn-secondary" onClick={() => setShowTicketModal(false)}>Close</button>
                            </div>
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#a09e96', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
                            <div style={{ fontWeight: 600, color: '#f0ece2' }}>{selectedTicket.customerName} ({selectedTicket.customerEmail})</div>
                            <div style={{ fontSize: '0.75rem', color: '#a09e96', textTransform: 'uppercase', marginTop: '12px', marginBottom: '4px' }}>Subject</div>
                            <div style={{ fontSize: '0.9rem', color: '#f0ece2' }}>{selectedTicket.subject}</div>
                        </div>

                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: '12px',
                            maxHeight: '300px', overflowY: 'auto', padding: '12px',
                            background: 'rgba(10,10,15,0.5)', borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.02)'
                        }}>
                            {(selectedTicket.messages || []).map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    background: msg.sender === 'admin' ? 'rgba(201, 168, 76, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: `1px solid ${msg.sender === 'admin' ? 'rgba(201, 168, 76, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    borderBottomRightRadius: msg.sender === 'admin' ? '4px' : '12px',
                                    borderBottomLeftRadius: msg.sender === 'customer' ? '4px' : '12px'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: msg.sender === 'admin' ? '#c9a84c' : '#cba', marginBottom: '4px', fontWeight: 600 }}>
                                        {msg.sender === 'admin' ? 'Support Agent' : selectedTicket.customerName}
                                    </div>
                                    <div style={{ fontSize: '0.88rem', color: '#f0ece2', whiteSpace: 'pre-wrap' }}>
                                        {msg.text}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#6b6963', marginTop: '6px', textAlign: 'right' }}>
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedTicket.status !== 'resolved' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <textarea
                                    value={ticketReply}
                                    onChange={(e) => setTicketReply(e.target.value)}
                                    placeholder="Type your reply..."
                                    style={{
                                        flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                                        color: '#f0ece2', minHeight: '60px', resize: 'vertical'
                                    }}
                                />
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: '0 20px', alignSelf: 'stretch' }}
                                    onClick={handleReplyTicket}
                                    disabled={!ticketReply.trim()}
                                >
                                    Reply
                                </button>
                            </div>
                        )}
                        {selectedTicket.status === 'resolved' && (
                            <div style={{ textAlign: 'center', color: '#a09e96', fontSize: '0.85rem', padding: '10px' }}>
                                This ticket has been resolved. Reopen to reply.
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
