import { useState, useEffect } from 'react';

export default function CountdownTimer() {
    const getEndOfDay = () => {
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return end;
    };

    const calcTimeLeft = () => {
        const diff = getEndOfDay() - new Date();
        if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
        };
    };

    const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calcTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (n) => String(n).padStart(2, '0');

    const boxStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
    };

    const numberStyle = {
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
        fontWeight: 700,
        color: '#c9a84c',
        lineHeight: 1,
        minWidth: '60px',
        textAlign: 'center',
        background: 'rgba(201, 168, 76, 0.08)',
        border: '1px solid rgba(201, 168, 76, 0.2)',
        borderRadius: '12px',
        padding: '12px 16px'
    };

    const labelStyle = {
        fontSize: '0.7rem',
        fontWeight: 600,
        color: '#a09e96',
        textTransform: 'uppercase',
        letterSpacing: '1.5px'
    };

    const separatorStyle = {
        fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
        fontWeight: 700,
        color: 'rgba(201, 168, 76, 0.4)',
        alignSelf: 'flex-start',
        paddingTop: '12px'
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(8px, 2vw, 16px)'
        }}>
            <div style={boxStyle}>
                <div style={numberStyle}>{pad(timeLeft.hours)}</div>
                <span style={labelStyle}>Hours</span>
            </div>
            <span style={separatorStyle}>:</span>
            <div style={boxStyle}>
                <div style={numberStyle}>{pad(timeLeft.minutes)}</div>
                <span style={labelStyle}>Minutes</span>
            </div>
            <span style={separatorStyle}>:</span>
            <div style={boxStyle}>
                <div style={numberStyle}>{pad(timeLeft.seconds)}</div>
                <span style={labelStyle}>Seconds</span>
            </div>
        </div>
    );
}
