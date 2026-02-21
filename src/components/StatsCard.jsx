export default function StatsCard({ icon, label, value, change, changeType = 'positive', index = 0 }) {
    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
                padding: '24px',
                animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(201, 168, 76, 0.08)',
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                }}>
                    {icon}
                </div>
                {change && (
                    <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: changeType === 'positive' ? '#34d399' : '#f87171',
                        background: changeType === 'positive' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '8px'
                    }}>
                        {changeType === 'positive' ? '↑' : '↓'} {change}
                    </span>
                )}
            </div>

            <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#f0ece2',
                marginBottom: '4px',
                lineHeight: 1.2
            }}>
                {value}
            </div>

            <div style={{
                fontSize: '0.85rem',
                color: '#a09e96',
                fontWeight: 500
            }}>
                {label}
            </div>

            {/* Subtle corner glow */}
            <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201, 168, 76, 0.06) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
}
