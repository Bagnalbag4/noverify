import { useState, useEffect } from 'react';

export default function Toast({ toasts, onRemove }) {
    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none'
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration || 3000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const typeStyles = {
        success: {
            bg: 'rgba(52, 211, 153, 0.12)',
            border: 'rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            icon: '✅'
        },
        error: {
            bg: 'rgba(248, 113, 113, 0.12)',
            border: 'rgba(248, 113, 113, 0.3)',
            color: '#f87171',
            icon: '❌'
        },
        warning: {
            bg: 'rgba(251, 191, 36, 0.12)',
            border: 'rgba(251, 191, 36, 0.3)',
            color: '#fbbf24',
            icon: '⚠️'
        },
        info: {
            bg: 'rgba(96, 165, 250, 0.12)',
            border: 'rgba(96, 165, 250, 0.3)',
            color: '#60a5fa',
            icon: 'ℹ️'
        }
    };

    const s = typeStyles[toast.type] || typeStyles.info;

    return (
        <div
            onClick={() => {
                setIsExiting(true);
                setTimeout(() => onRemove(toast.id), 300);
            }}
            style={{
                pointerEvents: 'auto',
                minWidth: '300px',
                maxWidth: '420px',
                padding: '16px 20px',
                borderRadius: '14px',
                background: s.bg,
                border: `1px solid ${s.border}`,
                backdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                animation: isExiting
                    ? 'slideOutRight 0.3s ease forwards'
                    : 'slideInRight 0.3s ease',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
        >
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>
                {toast.icon || s.icon}
            </span>
            <div style={{ flex: 1 }}>
                {toast.title && (
                    <div style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: '#f0ece2',
                        marginBottom: '2px'
                    }}>
                        {toast.title}
                    </div>
                )}
                <div style={{
                    fontSize: '0.85rem',
                    color: s.color,
                    lineHeight: 1.4
                }}>
                    {toast.message}
                </div>
            </div>
            <span style={{
                fontSize: '0.8rem',
                color: '#6b6963',
                cursor: 'pointer',
                flexShrink: 0,
                marginTop: '2px'
            }}>✕</span>
        </div>
    );
}
