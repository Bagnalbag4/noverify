import { useState } from 'react';
import Modal from '../components/Modal';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CRMPanel({ customers, onUpdateCustomers, orders }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [editingNote, setEditingNote] = useState('');

    const cities = [...new Set(customers.map(c => c.city))];

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesCity = cityFilter === 'all' || c.city === cityFilter;
        return matchesSearch && matchesStatus && matchesCity;
    });

    const getCustomerOrders = (customerName) => {
        return orders.filter(o => o.customerName === customerName);
    };

    const updateCustomerNote = async (customerId, newNote) => {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;
        try {
            await setDoc(doc(db, "customers", customerId.toString()), { ...customer, notes: newNote });
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    const updateCustomerStatus = async (customerId, newStatus) => {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;
        try {
            await setDoc(doc(db, "customers", customerId.toString()), { ...customer, status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const openCustomerDetail = (customer) => {
        setSelectedCustomer(customer);
        setEditingNote(customer.notes);
        setShowCustomerModal(true);
    };

    const saveNote = () => {
        if (selectedCustomer) {
            updateCustomerNote(selectedCustomer.id, editingNote);
            setSelectedCustomer(prev => ({ ...prev, notes: editingNote }));
        }
    };

    const statusColors = {
        active: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
        vip: { bg: 'rgba(201, 168, 76, 0.1)', color: '#c9a84c', border: 'rgba(201, 168, 76, 0.3)' },
        inactive: { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
        blocked: { bg: 'rgba(107, 105, 99, 0.1)', color: '#6b6963', border: 'rgba(107, 105, 99, 0.3)' }
    };

    const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const vipCount = customers.filter(c => c.status === 'vip').length;
    const activeCount = customers.filter(c => c.status === 'active').length;

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
                            Customer Relationship Manager
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: '#6b6963' }}>
                            Track, manage, and build relationships with your customers.
                        </p>
                    </div>
                    <button className="btn btn-outline btn-sm">
                        📥 Export CSV
                    </button>
                </div>

                {/* Quick Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginBottom: '28px'
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
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
                        {cities.map(city => (
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
                                    const sc = statusColors[customer.status] || statusColors.active;
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
                                            <td style={{ fontSize: '0.85rem', color: '#a09e96' }}>{customer.city}</td>
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
                                                        onClick={() => openCustomerDetail(customer)}
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
                                                            onClick={() => updateCustomerStatus(customer.id, 'vip')}
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

            {/* ─── Customer Detail Modal ─── */}
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
                                        const sc = statusColors[status];
                                        const isActive = selectedCustomer.status === status;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    updateCustomerStatus(selectedCustomer.id, status);
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
                                            <button onClick={async () => {
                                                const newTags = selectedCustomer.tags.filter(t => t !== tag);
                                                try {
                                                    await setDoc(doc(db, "customers", selectedCustomer.id.toString()), { ...selectedCustomer, tags: newTags });
                                                    setSelectedCustomer(prev => ({ ...prev, tags: newTags }));
                                                } catch (error) {
                                                    console.error("Failed to remove tag", error);
                                                }
                                            }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        id="crm-new-tag-input"
                                        placeholder="Add tag (e.g. VIP, Wholesale)..."
                                        className="input-field"
                                        style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1 }}
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                const val = e.target.value.trim();
                                                const currentTags = selectedCustomer.tags || [];
                                                if (!currentTags.includes(val)) {
                                                    const newTags = [...currentTags, val];
                                                    try {
                                                        await setDoc(doc(db, "customers", selectedCustomer.id.toString()), { ...selectedCustomer, tags: newTags });
                                                        setSelectedCustomer(prev => ({ ...prev, tags: newTags }));
                                                    } catch (error) {
                                                        console.error("Failed to add tag", error);
                                                    }
                                                }
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={async () => {
                                            const input = document.getElementById('crm-new-tag-input');
                                            const val = input.value.trim();
                                            if (val) {
                                                const currentTags = selectedCustomer.tags || [];
                                                if (!currentTags.includes(val)) {
                                                    const newTags = [...currentTags, val];
                                                    try {
                                                        await setDoc(doc(db, "customers", selectedCustomer.id.toString()), { ...selectedCustomer, tags: newTags });
                                                        setSelectedCustomer(prev => ({ ...prev, tags: newTags }));
                                                    } catch (error) {
                                                        console.error("Failed to add tag", error);
                                                    }
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
                                    onClick={saveNote}
                                >
                                    Save Note
                                </button>
                            </div>

                            {/* Order history */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a09e96', marginBottom: '10px', display: 'block' }}>
                                    Order History
                                </label>
                                {getCustomerOrders(selectedCustomer.name).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b6963', fontSize: '0.88rem' }}>
                                        No orders found
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {getCustomerOrders(selectedCustomer.name).map(order => (
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
        </div>
    );
}
