import { useState, useEffect } from 'react';
import { liveActivities } from '../data';

export default function PurchaseNotification() {
    const [visible, setVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activities] = useState(liveActivities);

    useEffect(() => {
        const showNotification = () => {
            setVisible(true);
            setTimeout(() => {
                setVisible(false);
                setTimeout(() => {
                    setCurrentIndex(prev => (prev + 1) % activities.length);
                }, 500);
            }, 5000);
        };

        const initialDelay = setTimeout(showNotification, 3000);
        const interval = setInterval(showNotification, 10000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [activities.length]);

    const activity = activities[currentIndex];

    return (
        <div style={{
            position: 'fixed',
            bottom: visible ? '24px' : '-120px',
            left: '24px',
            zIndex: 1500,
            background: 'rgba(17, 17, 24, 0.95)',
            border: '1px solid rgba(201, 168, 76, 0.2)',
            borderRadius: '16px',
            padding: '16px 22px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(201, 168, 76, 0.1)',
            transition: 'bottom 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '360px',
            width: 'calc(100vw - 48px)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
            }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.05))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                }}>
                    ✓
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#f0ece2',
                        marginBottom: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {activity.name} from {activity.city}
                    </div>
                    <div style={{
                        fontSize: '0.78rem',
                        color: '#a09e96',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        just bought <span style={{ color: '#c9a84c' }}>{activity.service}</span>
                    </div>
                    <div style={{
                        fontSize: '0.7rem',
                        color: '#6b6963',
                        marginTop: '2px'
                    }}>
                        {activity.time}
                    </div>
                </div>
            </div>
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.5), transparent)',
                borderRadius: '16px 16px 0 0'
            }} />
        </div>
    );
}
