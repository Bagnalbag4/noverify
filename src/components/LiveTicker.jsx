import { useState, useEffect } from 'react';
import { liveActivities } from '../data';

export default function LiveTicker() {
    const [activities] = useState(liveActivities);

    const tickerContent = activities.map((a, i) => (
        `✦ ${a.name} from ${a.city} bought ${a.service} — ${a.time}`
    )).join('     ');

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(90deg, rgba(201,168,76,0.12), rgba(201,168,76,0.05), rgba(201,168,76,0.12))',
            borderBottom: '1px solid rgba(201,168,76,0.15)',
            padding: '10px 0',
            zIndex: 999
        }}>
            <div style={{
                display: 'flex',
                animation: 'ticker 40s linear infinite',
                whiteSpace: 'nowrap'
            }}>
                <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: '#c9a84c',
                    letterSpacing: '0.3px',
                    paddingRight: '60px'
                }}>
                    {tickerContent}
                </span>
                <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: '#c9a84c',
                    letterSpacing: '0.3px',
                    paddingRight: '60px'
                }}>
                    {tickerContent}
                </span>
            </div>
        </div>
    );
}
