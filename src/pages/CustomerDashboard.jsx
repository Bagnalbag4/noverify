import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Modal from '../components/Modal';

export default function CustomerDashboard({ customerUser, orders, tickets = [], onNavigate, addToast }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!customerUser) return;
        const fetchProfile = async () => {
            const docRef = doc(db, "customers", customerUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            }
        };
        fetchProfile();
    }, [customerUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            addToast({ type: 'info', message: 'Logged out successfully' });
            onNavigate('landing');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    if (!customerUser) {
        return (
            <div className="page-enter" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh' }}>
                <p style={{ color: '#a09e96' }}>Please log in to view your dashboard.</p>
                <button className="btn btn-primary" onClick={() => onNavigate('auth')} style={{ marginTop: '16px' }}>
                    Go to Login
                </button>
            </div>
        );
    }

    // Filter orders belonging to this user (we link by UID via userId field on the order)
    const myOrders = orders.filter(o => o.userId === customerUser.uid || (profile && o.email === profile.email));

    // Support Tickets
    const myTickets = tickets.filter(t => t.userId === customerUser.uid || t.customerEmail === customerUser.email);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({ subject: '', category: 'General Inquiry' });

    const handleCreateTicket = async () => {
        if (!ticketForm.subject.trim()) {
            addToast({ type: 'warning', message: 'Please enter a message or subject.' });
            return;
        }
        try {
            const ticketId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
            const newTicket = {
                id: ticketId,
                userId: customerUser.uid,
                customerEmail: customerUser.email,
                customerName: profile?.name || customerUser.email.split('@')[0],
                subject: ticketForm.subject,
                category: ticketForm.category,
                status: 'open',
                date: new Date().toISOString(),
                messages: [{
                    sender: 'customer',
                    text: ticketForm.subject,
                    timestamp: new Date().toISOString()
                }]
            };
            await setDoc(doc(db, "tickets", ticketId), newTicket);
            addToast({ type: 'success', title: 'Ticket Created', message: 'Support will reply shortly.' });
            setShowTicketModal(false);
            setTicketForm({ subject: '', category: 'General Inquiry' });
        } catch (error) {
            console.error("Error creating ticket:", error);
            addToast({ type: 'error', message: 'Failed to create ticket.' });
        }
    };

    return (
        <div className="page-enter" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh' }}>
            <div className="container-wide" style={{ maxWidth: '1000px' }}>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '32px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: '#f0ece2',
                            marginBottom: '4px'
                        }}>
                            My Dashboard
                        </h1>
                        <p style={{ color: '#6b6963', fontSize: '0.95rem' }}>
                            Welcome back, {profile?.name || customerUser.email.split('@')[0]}!
                        </p>
                    </div>
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        🚪 Logout
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '24px' }}>
                    {/* Left Col: Profile Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.2), rgba(201, 168, 76, 0.05))',
                                border: '1px solid rgba(201, 168, 76, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.8rem',
                                color: '#c9a84c',
                                fontWeight: 700,
                                marginBottom: '16px'
                            }}>
                                {(profile?.name || 'C')[0].toUpperCase()}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0ece2', marginBottom: '4px' }}>
                                {profile?.name || 'Customer'}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#a09e96', marginBottom: '4px' }}>{customerUser.email}</p>
                            <p style={{ fontSize: '0.85rem', color: '#a09e96', marginBottom: '20px' }}>{profile?.phone || ''}</p>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {profile?.status === 'vip' && (
                                    <span style={{
                                        background: 'rgba(201, 168, 76, 0.1)',
                                        color: '#c9a84c',
                                        border: '1px solid rgba(201, 168, 76, 0.3)',
                                        padding: '4px 10px',
                                        borderRadius: '100px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>⭐ VIP Member</span>
                                )}
                                {(profile?.tags || []).map(tag => (
                                    <span key={tag} style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#a09e96',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '4px 10px',
                                        borderRadius: '100px',
                                        fontSize: '0.75rem'
                                    }}>{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b6963', marginBottom: '4px' }}>Total Orders</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0ece2' }}>{myOrders.length}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b6963', marginBottom: '4px' }}>Total Spent</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c9a84c' }}>
                                    Rs. {myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Orders History */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: '#f0ece2',
                            marginBottom: '20px'
                        }}>Order History</h3>

                        {myOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b6963' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛍️</div>
                                <p>You haven't placed any orders yet.</p>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: '16px' }} onClick={() => onNavigate('landing')}>
                                    Browse Services
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {myOrders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(order => (
                                    <div key={order.id} style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                                <span style={{ fontWeight: 600, color: '#f0ece2', fontSize: '0.95rem' }}>{order.service}</span>
                                                <span className={`badge ${order.status === 'completed' ? 'badge-success' :
                                                    order.status === 'pending' ? 'badge-warning' :
                                                        order.status === 'processing' ? 'badge-info' : 'badge-danger'
                                                    }`} style={{ fontSize: '0.7rem' }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#6b6963' }}>
                                                <span>{order.date}</span>
                                                <span>ID: {order.id}</span>
                                            </div>
                                        </div>
                                        <div style={{
                                            fontWeight: 700,
                                            color: '#c9a84c',
                                            fontSize: '1.1rem'
                                        }}>
                                            Rs. {order.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Support Tickets */}
                <div className="glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: '#f0ece2'
                        }}>Support Tickets</h3>
                        <button className="btn btn-sm btn-primary" onClick={() => setShowTicketModal(true)}>
                            ＋ New Ticket
                        </button>
                    </div>

                    {myTickets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b6963' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🎫</div>
                            <p>You have no support tickets.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {myTickets.sort((a, b) => new Date(b.date) - new Date(a.date)).map(ticket => (
                                <div key={ticket.id} style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    borderRadius: '12px',
                                    padding: '16px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 600, color: '#f0ece2', fontSize: '0.9rem' }}>{ticket.id}</span>
                                        <span className={`badge ${ticket.status === 'resolved' ? 'badge-success' : ticket.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#a09e96', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {ticket.subject}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#6b6963' }}>
                                        <span>{new Date(ticket.date).toLocaleDateString()}</span>
                                        <span>{ticket.messages.length} messages</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Modal */}
            <Modal
                isOpen={showTicketModal}
                onClose={() => setShowTicketModal(false)}
                title="Create Support Ticket"
                footer={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setShowTicketModal(false)}>Cancel</button>
                        <button className="btn btn-sm btn-primary" onClick={handleCreateTicket}>Submit Ticket</button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#a09e96', marginBottom: '6px' }}>Category</label>
                        <select
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                            style={{
                                width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0ece2', cursor: 'pointer'
                            }}
                        >
                            <option value="General Inquiry" style={{ background: '#1a1a24' }}>General Inquiry</option>
                            <option value="Order Issue" style={{ background: '#1a1a24' }}>Order Issue</option>
                            <option value="Billing" style={{ background: '#1a1a24' }}>Billing</option>
                            <option value="Technical Support" style={{ background: '#1a1a24' }}>Technical Support</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#a09e96', marginBottom: '6px' }}>How can we help?</label>
                        <textarea
                            value={ticketForm.subject}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Please describe your issue..."
                            style={{
                                width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0ece2', minHeight: '100px', resize: 'vertical'
                            }}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
