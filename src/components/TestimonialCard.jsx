export default function TestimonialCard({ testimonial, index = 0 }) {
    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '20px',
                padding: '28px 24px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            }}
        >
            {/* Quote mark */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                fontSize: '3rem',
                fontFamily: "'Playfair Display', serif",
                color: 'rgba(201, 168, 76, 0.1)',
                lineHeight: 1
            }}>
                "
            </div>

            {/* Stars */}
            <div style={{
                display: 'flex',
                gap: '3px',
                marginBottom: '16px'
            }}>
                {Array(5).fill(0).map((_, i) => (
                    <span key={i} style={{
                        fontSize: '0.9rem',
                        color: i < testimonial.rating ? '#c9a84c' : '#333'
                    }}>
                        ★
                    </span>
                ))}
            </div>

            {/* Review text */}
            <p style={{
                fontSize: '0.92rem',
                color: '#a09e96',
                lineHeight: 1.7,
                marginBottom: '24px',
                fontStyle: 'italic'
            }}>
                "{testimonial.review}"
            </p>

            {/* Author */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.15), rgba(201, 168, 76, 0.05))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#c9a84c',
                    flexShrink: 0,
                    border: '1px solid rgba(201, 168, 76, 0.15)'
                }}>
                    {testimonial.avatar}
                </div>
                <div>
                    <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#f0ece2',
                        marginBottom: '2px'
                    }}>
                        {testimonial.name}
                    </div>
                    <div style={{
                        fontSize: '0.78rem',
                        color: '#6b6963'
                    }}>
                        {testimonial.city} · {testimonial.service}
                    </div>
                </div>
            </div>
        </div>
    );
}
