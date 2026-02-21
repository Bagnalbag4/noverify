import { useState } from 'react';
import Modal from '../components/Modal';

export default function CheckoutPage({ selectedService, onNavigate, onSubmitOrder }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        whatsapp: '',
        paymentMethod: 'jazzcash',
        screenshot: null,
        screenshotName: ''
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmedOrderId, setConfirmedOrderId] = useState('');

    // Quantity & Coupon state
    const [quantity, setQuantity] = useState(1);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

    const demoCoupons = {
        'NOVERIFY10': { type: 'percent', val: 10 },
        'SAVE500': { type: 'fixed', val: 500 }
    };

    const basePrice = selectedService?.price || 0;
    const subtotal = basePrice * quantity;
    let discountAmt = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmt = subtotal * (appliedCoupon.val / 100);
        } else {
            discountAmt = appliedCoupon.val;
        }
    }
    const totalAmount = Math.max(0, subtotal - discountAmt);

    const handleApplyCoupon = () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        if (demoCoupons[code]) {
            setAppliedCoupon(demoCoupons[code]);
            setCouponMsg({ type: 'success', text: 'Coupon applied successfully!' });
        } else {
            setAppliedCoupon(null);
            setCouponMsg({ type: 'error', text: 'Invalid coupon code' });
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMsg({ type: '', text: '' });
    };

    const defaultTitle = import.meta.env.VITE_ACCOUNT_TITLE || 'NoVerify Services';
    const paymentAccounts = {
        jazzcash: { name: 'JazzCash', number: import.meta.env.VITE_JAZZCASH_ACCOUNT || '0314-1603089', title: defaultTitle, icon: '📱' },
        easypaisa: { name: 'EasyPaisa', number: import.meta.env.VITE_EASYPAISA_ACCOUNT || '0314-1603089', title: defaultTitle, icon: '📱' },
        sadapay: { name: 'SadaPay', number: import.meta.env.VITE_SADAPAY_ACCOUNT || '0314-1603089', title: defaultTitle, icon: '💳' },
        nayapay: { name: 'NayaPay', number: import.meta.env.VITE_NAYAPAY_ACCOUNT || '0314-1603089', title: defaultTitle, icon: '💳' },
        bank: { name: 'Bank Transfer', number: import.meta.env.VITE_BANK_ACCOUNT || 'PK12345678901234567890 (Meezan)', title: defaultTitle, icon: '🏦' }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp number is required';
        if (!formData.screenshotName) newErrors.screenshot = 'Payment screenshot is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const orderId = onSubmitOrder(formData, {
                ...selectedService,
                price: totalAmount,
                originalPrice: subtotal,
                orderQuantity: quantity
            });
            setConfirmedOrderId(orderId);
            setShowConfirmation(true);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                screenshot: file,
                screenshotName: file.name
            }));
            if (errors.screenshot) {
                setErrors(prev => ({ ...prev, screenshot: '' }));
            }
        }
    };

    if (!selectedService) {
        return (
            <div className="page-enter" style={{
                paddingTop: '120px',
                textAlign: 'center',
                minHeight: '100vh'
            }}>
                <div className="container">
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '24px',
                        animation: 'float 3s ease-in-out infinite'
                    }}>🛒</div>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.8rem',
                        marginBottom: '12px',
                        color: '#f0ece2'
                    }}>No Service Selected</h2>
                    <p style={{
                        color: '#a09e96',
                        marginBottom: '32px',
                        fontSize: '1rem'
                    }}>
                        Please select a service from our catalog to proceed with checkout.
                    </p>
                    <button className="btn btn-primary" onClick={() => onNavigate('landing')}>
                        ← Browse Services
                    </button>
                </div>
            </div>
        );
    }

    const account = paymentAccounts[formData.paymentMethod];
    const discount = Math.round(((selectedService.originalPrice - selectedService.price) / selectedService.originalPrice) * 100);

    return (
        <div className="page-enter" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 380px',
                    gap: '32px',
                    alignItems: 'start'
                }}>
                    {/* ─── Left: Order Form ─── */}
                    <div>
                        {/* Back button */}
                        <button
                            onClick={() => onNavigate('landing')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'none',
                                border: 'none',
                                color: '#a09e96',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                marginBottom: '28px',
                                padding: 0,
                                transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#a09e96'}
                        >
                            ← Back to Services
                        </button>

                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            marginBottom: '8px',
                            color: '#f0ece2'
                        }}>Checkout</h1>
                        <p style={{
                            fontSize: '0.95rem',
                            color: '#a09e96',
                            marginBottom: '36px'
                        }}>
                            Fill in your details and complete payment to place your order.
                        </p>

                        <form onSubmit={handleSubmit}>
                            {/* Personal Details */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '16px',
                                padding: '28px',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    marginBottom: '20px',
                                    color: '#f0ece2'
                                }}>Personal Details</h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px'
                                }}>
                                    <div className="input-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Ahmed Khan"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            style={errors.name ? { borderColor: '#f87171' } : {}}
                                        />
                                        {errors.name && <span style={{ fontSize: '0.78rem', color: '#f87171' }}>{errors.name}</span>}
                                    </div>
                                    <div className="input-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="input-field"
                                            placeholder="0301-2345678"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            style={errors.phone ? { borderColor: '#f87171' } : {}}
                                        />
                                        {errors.phone && <span style={{ fontSize: '0.78rem', color: '#f87171' }}>{errors.phone}</span>}
                                    </div>
                                    <div className="input-group">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="ahmed@mail.com"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            style={errors.email ? { borderColor: '#f87171' } : {}}
                                        />
                                        {errors.email && <span style={{ fontSize: '0.78rem', color: '#f87171' }}>{errors.email}</span>}
                                    </div>
                                    <div className="input-group">
                                        <label>WhatsApp Number *</label>
                                        <input
                                            type="tel"
                                            className="input-field"
                                            placeholder="0301-2345678"
                                            value={formData.whatsapp}
                                            onChange={(e) => handleChange('whatsapp', e.target.value)}
                                            style={errors.whatsapp ? { borderColor: '#f87171' } : {}}
                                        />
                                        {errors.whatsapp && <span style={{ fontSize: '0.78rem', color: '#f87171' }}>{errors.whatsapp}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '16px',
                                padding: '28px',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    marginBottom: '20px',
                                    color: '#f0ece2'
                                }}>Payment Method</h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                    marginBottom: '24px'
                                }}>
                                    {Object.entries(paymentAccounts).map(([key, acc]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleChange('paymentMethod', key)}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: `1px solid ${formData.paymentMethod === key ? 'rgba(201, 168, 76, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                                                background: formData.paymentMethod === key ? 'rgba(201, 168, 76, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                                color: formData.paymentMethod === key ? '#c9a84c' : '#a09e96',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '1.5rem',
                                                marginBottom: '6px'
                                            }}>
                                                {acc.icon}
                                            </div>
                                            <div style={{
                                                fontWeight: 600,
                                                fontSize: '0.95rem'
                                            }}>{acc.name}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Account details */}
                                <div style={{
                                    background: 'rgba(201, 168, 76, 0.05)',
                                    border: '1px solid rgba(201, 168, 76, 0.15)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{
                                        fontSize: '0.82rem',
                                        color: '#a09e96',
                                        marginBottom: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontWeight: 600
                                    }}>
                                        Send Payment To:
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', color: '#a09e96' }}>Account Title:</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0ece2' }}>{account.title}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', color: '#a09e96' }}>Account Number:</span>
                                        <span style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            color: '#c9a84c',
                                            fontFamily: "'Playfair Display', serif"
                                        }}>{account.number}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', color: '#a09e96' }}>Amount:</span>
                                        <span style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 700,
                                            color: '#c9a84c',
                                            fontFamily: "'Playfair Display', serif"
                                        }}>Rs. {selectedService.price.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    marginBottom: '20px'
                                }}>
                                    {[
                                        { step: 1, text: `Open ${account.name} app on your phone` },
                                        { step: 2, text: `Send Rs. ${selectedService.price.toLocaleString()} to ${account.number}` },
                                        { step: 3, text: 'Take a screenshot of the transaction' },
                                        { step: 4, text: 'Upload the screenshot below' }
                                    ].map((item) => (
                                        <div key={item.step} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: 'rgba(201, 168, 76, 0.1)',
                                                border: '1px solid rgba(201, 168, 76, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: '#c9a84c',
                                                flexShrink: 0
                                            }}>
                                                {item.step}
                                            </div>
                                            <span style={{ fontSize: '0.88rem', color: '#a09e96' }}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Screenshot upload */}
                                <div className="input-group">
                                    <label>Payment Screenshot *</label>
                                    <div
                                        onClick={() => document.getElementById('screenshot-input').click()}
                                        style={{
                                            width: '100%',
                                            padding: '32px 20px',
                                            borderRadius: '12px',
                                            border: `2px dashed ${errors.screenshot ? '#f87171' : formData.screenshotName ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            background: formData.screenshotName ? 'rgba(52, 211, 153, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {formData.screenshotName ? (
                                            <div>
                                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✅</div>
                                                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#34d399' }}>
                                                    {formData.screenshotName}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: '#6b6963', marginTop: '4px' }}>
                                                    Click to change
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📸</div>
                                                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#a09e96' }}>
                                                    Click to upload payment screenshot
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: '#6b6963', marginTop: '4px' }}>
                                                    PNG, JPG or JPEG (max 5MB)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="screenshot-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    {errors.screenshot && <span style={{ fontSize: '0.78rem', color: '#f87171' }}>{errors.screenshot}</span>}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', fontSize: '1.05rem' }}
                            >
                                Place Order — Rs. {totalAmount.toLocaleString()}
                            </button>
                        </form>
                    </div>

                    {/* ─── Right: Order Summary ─── */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '20px',
                            overflow: 'hidden'
                        }}>
                            {/* Top accent */}
                            <div style={{
                                height: '3px',
                                background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)'
                            }} />

                            <div style={{ padding: '28px' }}>
                                <h3 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.05rem',
                                    fontWeight: 600,
                                    marginBottom: '24px',
                                    color: '#f0ece2'
                                }}>Order Summary</h3>

                                {/* Service info */}
                                <div style={{
                                    display: 'flex',
                                    gap: '14px',
                                    marginBottom: '24px',
                                    paddingBottom: '20px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                                }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        width: '52px',
                                        height: '52px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '14px',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        flexShrink: 0
                                    }}>
                                        {selectedService.icon}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            color: '#f0ece2',
                                            marginBottom: '4px'
                                        }}>
                                            {selectedService.title}
                                        </div>
                                        <div style={{
                                            fontSize: '0.82rem',
                                            color: '#34d399'
                                        }}>
                                            ⚡ {selectedService.deliveryTime}
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    paddingBottom: '20px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                                }}>
                                    <span style={{ fontSize: '0.95rem', color: '#f0ece2', fontWeight: 600 }}>Quantity</span>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{ padding: '6px 14px', color: '#a09e96', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        >−</button>
                                        <span style={{ padding: '0 10px', fontSize: '1rem', fontWeight: 600 }}>{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                            style={{ padding: '6px 14px', color: '#a09e96', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        >+</button>
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#a09e96' }}>Subtotal ({quantity}x)</span>
                                        <span style={{ color: '#f0ece2' }}>Rs. {subtotal.toLocaleString()}</span>
                                    </div>

                                    {appliedCoupon && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#34d399' }}>
                                            <span>Discount ({appliedCoupon.type === 'percent' ? `${appliedCoupon.val}%` : `Flat Rs.${appliedCoupon.val}`})</span>
                                            <span>-Rs. {discountAmt.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Coupon Code Input */}
                                <div style={{ marginBottom: '20px' }}>
                                    {!appliedCoupon ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Promo Code (e.g. NOVERIFY10)"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                style={{ padding: '10px 14px', fontSize: '0.85rem', flex: 1, textTransform: 'uppercase' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleApplyCoupon}
                                                style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 14px',
                                            background: 'rgba(52, 211, 153, 0.1)',
                                            border: '1px solid rgba(52, 211, 153, 0.2)',
                                            borderRadius: '8px'
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                                                ✅ {couponCode.toUpperCase()} Applied
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.85rem', cursor: 'pointer' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    {couponMsg.text && !appliedCoupon && (
                                        <div style={{ fontSize: '0.78rem', marginTop: '6px', color: couponMsg.type === 'error' ? '#f87171' : '#34d399' }}>
                                            {couponMsg.text}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                    paddingTop: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline'
                                }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0ece2' }}>Total</span>
                                    <span style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: '1.6rem',
                                        fontWeight: 700,
                                        color: '#c9a84c'
                                    }}>
                                        Rs. {totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Trust badges */}
                            <div style={{
                                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                padding: '20px 28px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                {[
                                    { icon: '🛡️', text: '100% Secure Payment' },
                                    { icon: '⚡', text: 'Instant Delivery Guarantee' },
                                    { icon: '🔄', text: 'Full Refund if Not Delivered' }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '0.82rem',
                                        color: '#6b6963'
                                    }}>
                                        <span>{item.icon}</span>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stock warning */}
                        <div style={{
                            marginTop: '16px',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'rgba(248, 113, 113, 0.05)',
                            border: '1px solid rgba(248, 113, 113, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.85rem',
                            color: '#f87171',
                            fontWeight: 500,
                            animation: 'pulse 3s infinite'
                        }}>
                            🔥 Only {selectedService.stock} left in stock — order now!
                        </div>
                    </div>
                </div>

                {/* Responsive override for mobile */}
                <style>{`
          @media (max-width: 800px) {
            .container > div:first-child {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 600px) {
            .input-group + .input-group {
              margin-top: 0;
            }
          }
        `}</style>
            </div>

            {/* ─── Confirmation Modal ─── */}
            <Modal
                isOpen={showConfirmation}
                onClose={() => {
                    setShowConfirmation(false);
                    onNavigate('landing');
                }}
                title="Order Confirmed! 🎉"
                footer={
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setShowConfirmation(false);
                            onNavigate('landing');
                        }}
                    >
                        Back to Home
                    </button>
                }
            >
                <div style={{
                    textAlign: 'center',
                    padding: '12px 0'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '20px',
                        animation: 'countPulse 0.6s ease'
                    }}>✅</div>
                    <h3 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        marginBottom: '12px',
                        color: '#f0ece2'
                    }}>
                        Thank You, {formData.name}!
                    </h3>
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#a09e96',
                        lineHeight: 1.7,
                        marginBottom: '24px'
                    }}>
                        Your order for <strong style={{ color: '#c9a84c' }}>{selectedService.title}</strong> has been placed
                        successfully. We'll verify your payment and deliver via WhatsApp.
                    </p>
                    <div style={{
                        background: 'rgba(201, 168, 76, 0.05)',
                        border: '1px solid rgba(201, 168, 76, 0.15)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'left'
                    }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c9a84c', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Order Details
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                            <span style={{ color: '#a09e96' }}>Order ID</span>
                            <span style={{ color: '#f0ece2', fontWeight: 600 }}>{confirmedOrderId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                            <span style={{ color: '#a09e96' }}>Service</span>
                            <span style={{ color: '#f0ece2', fontWeight: 500, maxWidth: '200px', textAlign: 'right' }}>{selectedService.title}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                            <span style={{ color: '#a09e96' }}>Amount</span>
                            <span style={{ color: '#c9a84c', fontWeight: 700 }}>Rs. {selectedService.price.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                            <span style={{ color: '#a09e96' }}>Payment</span>
                            <span style={{ color: '#f0ece2', fontWeight: 500 }}>{paymentAccounts[formData.paymentMethod].name}</span>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '0.82rem',
                        color: '#6b6963',
                        marginTop: '16px'
                    }}>
                        Expected delivery: {selectedService.deliveryTime} • Check WhatsApp for updates
                    </p>
                </div>
            </Modal>
        </div>
    );
}
