import { useState, useEffect } from 'react';

export default function OrderTrackingPage({ orders, onNavigate }) {
    const [orderId, setOrderId] = useState('');
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleTrack = (e) => {
        e.preventDefault();
        setError('');

        if (!orderId.trim()) {
            setError('Please enter a valid Order ID');
            return;
        }

        const found = orders.find(o => o.id.toLowerCase() === orderId.trim().toLowerCase());

        if (found) {
            setTrackedOrder(found);
        } else {
            setError('Order not found. Please check your ID and try again.');
            setTrackedOrder(null);
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'pending': return 1;
            case 'processing': return 2;
            case 'completed': return 3;
            case 'cancelled': return 0;
            default: return 1;
        }
    };

    return (
        <div className="page-enter" style={{ paddingTop: '100px', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '600px' }}>

                <button
                    onClick={() => onNavigate('landing')}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f0ece2',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}
                >
                    ← Back to Home
                </button>

                <div className="glass-panel" style={{ padding: '40px 30px', textAlign: 'center', animation: 'fadeInUp 0.5s ease' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📍</div>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#f0ece2',
                        marginBottom: '12px'
                    }}>
                        Track Your Order
                    </h1>
                    <p style={{ color: '#a09e96', marginBottom: '32px' }}>
                        Enter your Order ID below to check the current status of your premium service delivery.
                    </p>

                    <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', marginBottom: error ? '12px' : '32px' }}>
                        <input
                            type="text"
                            placeholder="e.g. NV-1234"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="input-field"
                            style={{ flex: 1, padding: '16px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 32px' }}>
                            Track
                        </button>
                    </form>

                    {error && (
                        <div style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '32px', textAlign: 'left', background: 'rgba(248, 113, 113, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {trackedOrder && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '16px',
                            padding: '30px',
                            border: '1px solid rgba(201, 168, 76, 0.15)',
                            textAlign: 'left',
                            animation: 'fadeIn 0.4s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b6963', marginBottom: '4px' }}>Order ID</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c9a84c' }}>{trackedOrder.id}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b6963', marginBottom: '4px', textAlign: 'right' }}>Date</div>
                                    <div style={{ fontSize: '1rem', color: '#f0ece2' }}>{trackedOrder.date}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ fontSize: '0.88rem', color: '#6b6963', marginBottom: '8px' }}>Service Requested</div>
                                <div style={{ fontSize: '1.05rem', color: '#f0ece2', fontWeight: 500 }}>{trackedOrder.service}</div>
                            </div>

                            {trackedOrder.status === 'cancelled' ? (
                                <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(248, 113, 113, 0.05)', borderRadius: '12px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>❌</div>
                                    <div style={{ color: '#f87171', fontWeight: 600, fontSize: '1.1rem' }}>Order Cancelled</div>
                                    <p style={{ color: '#a09e96', fontSize: '0.9rem', marginTop: '8px' }}>This order has been cancelled. Please contact support if you need assistance.</p>
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    {/* Timeline line */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '15px',
                                        top: '20px',
                                        bottom: '20px',
                                        width: '2px',
                                        background: 'rgba(255,255,255,0.06)'
                                    }} />

                                    <div style={{
                                        position: 'absolute',
                                        left: '15px',
                                        top: '20px',
                                        height: getStatusStep(trackedOrder.status) === 1 ? '0%' : getStatusStep(trackedOrder.status) === 2 ? '50%' : '100%',
                                        width: '2px',
                                        background: '#c9a84c',
                                        transition: 'height 1s ease'
                                    }} />

                                    {/* Steps */}
                                    {[
                                        { step: 1, title: 'Order Placed', desc: 'We have received your order details.', icon: '📝' },
                                        { step: 2, title: 'Processing', desc: 'Working on your premium service.', icon: '⚙️' },
                                        { step: 3, title: 'Completed', desc: 'Your service has been delivered!', icon: '✅' }
                                    ].map((s, i) => {
                                        const isActive = getStatusStep(trackedOrder.status) >= s.step;
                                        const isCurrent = getStatusStep(trackedOrder.status) === s.step;
                                        return (
                                            <div key={i} style={{
                                                display: 'flex',
                                                gap: '20px',
                                                marginBottom: i === 2 ? 0 : '32px',
                                                position: 'relative',
                                                opacity: isActive ? 1 : 0.4,
                                                transform: isActive ? 'translateX(0)' : 'translateX(10px)',
                                                transition: 'all 0.5s ease'
                                            }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: isActive ? '#c9a84c' : '#1a1a24',
                                                    border: `2px solid ${isActive ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: isActive ? '#0a0a0f' : '#6b6963',
                                                    fontSize: '0.8rem',
                                                    zIndex: 2,
                                                    boxShadow: isCurrent ? '0 0 0 4px rgba(201, 168, 76, 0.2)' : 'none'
                                                }}>
                                                    {isActive ? '✓' : s.step}
                                                </div>
                                                <div style={{ paddingTop: '4px' }}>
                                                    <div style={{
                                                        color: isActive ? '#f0ece2' : '#a09e96',
                                                        fontWeight: isActive ? 600 : 400,
                                                        fontSize: '1.05rem',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {s.icon} {s.title}
                                                    </div>
                                                    <div style={{ color: '#6b6963', fontSize: '0.85rem' }}>
                                                        {s.desc}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Need help */}
                            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                <p style={{ color: '#a09e96', fontSize: '0.9rem', marginBottom: '16px' }}>Need help with this order?</p>
                                <button className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => window.open(`https://wa.me/923141603089?text=Hi, I need help with my order ${trackedOrder.id}`, '_blank')}>
                                    💬 Contact WhatsApp Support
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
