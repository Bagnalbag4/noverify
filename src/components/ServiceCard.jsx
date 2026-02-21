export default function ServiceCard({ service, onOrder, index = 0 }) {
    const discount = Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100);

    const badgeColors = {
        'Best Seller': { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
        'Popular': { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
        'Limited Stock': { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
        'Premium': { bg: 'rgba(201, 168, 76, 0.1)', color: '#c9a84c', border: 'rgba(201, 168, 76, 0.3)' },
        'Exclusive': { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' }
    };

    const badge = badgeColors[service.badge] || badgeColors['Popular'];

    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '20px',
                padding: '0',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                cursor: 'default'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.25)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Top accent line */}
            <div style={{
                height: '3px',
                background: `linear-gradient(90deg, transparent, ${badge.color}, transparent)`,
                opacity: 0.6
            }} />

            {service.image && (
                <div style={{
                    width: '100%',
                    height: '180px',
                    backgroundImage: `url(${service.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                }} />
            )}

            <div style={{ padding: service.image ? '20px 24px' : '28px 24px' }}>
                {/* Badge + Icon row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '5px 14px',
                        borderRadius: '100px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`
                    }}>
                        {service.badge}
                    </span>
                    <div style={{
                        fontSize: '2rem',
                        width: '52px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        {service.icon}
                    </div>
                </div>

                {/* Title */}
                <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: '#f0ece2',
                    marginBottom: '8px',
                    lineHeight: 1.3
                }}>
                    {service.title}
                </h3>

                {service.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '0.82rem', fontWeight: 500 }}>
                        <span style={{ color: '#fbbf24' }}>★ {service.rating}</span>
                        <span style={{ color: '#6b6963' }}>({service.reviewsCount} reviews)</span>
                    </div>
                )}

                {/* Description */}
                <p style={{
                    fontSize: '0.88rem',
                    color: '#a09e96',
                    lineHeight: 1.6,
                    marginBottom: '20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {service.description}
                </p>

                {/* Features */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '22px'
                }}>
                    {service.features.map((f, i) => (
                        <span key={i} style={{
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            color: '#a09e96',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.04)'
                        }}>
                            {f}
                        </span>
                    ))}
                </div>

                {/* Delivery time */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '20px',
                    fontSize: '0.82rem',
                    color: '#34d399'
                }}>
                    <span>⚡</span>
                    <span>Delivery: {service.deliveryTime}</span>
                </div>

                {/* Price row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    marginBottom: '6px'
                }}>
                    <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: '#c9a84c'
                    }}>
                        Rs. {service.price.toLocaleString()}
                    </span>
                    <span style={{
                        fontSize: '0.95rem',
                        color: '#6b6963',
                        textDecoration: 'line-through'
                    }}>
                        Rs. {service.originalPrice.toLocaleString()}
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#34d399',
                        background: 'rgba(52, 211, 153, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                    }}>
                        -{discount}%
                    </span>
                </div>

                {/* Stock warning */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                }}>
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: service.stock <= 3 ? '#f87171' : '#fbbf24',
                        animation: service.stock <= 3 ? 'pulse 2s infinite' : 'none'
                    }}>
                        {service.stock <= 3 ? '🔥' : '📦'} Only {service.stock} left in stock!
                    </span>
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => onOrder && onOrder(service)}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: 'linear-gradient(135deg, #c9a84c, #a08535)',
                        color: '#0a0a0f',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        letterSpacing: '0.3px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(201, 168, 76, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    Order Now →
                </button>
            </div>
        </div>
    );
}
