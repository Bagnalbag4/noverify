import { useState } from 'react';

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Small delay for UX feel
        await new Promise(r => setTimeout(r, 600));

        const adminUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'noverify2026';

        if (username === adminUser && password === adminPass) {
            localStorage.setItem('nv_auth', JSON.stringify({
                user: username,
                loginTime: Date.now(),
                token: btoa(`${username}:${Date.now()}`)
            }));
            onLogin(true);
        } else {
            setError('Invalid username or password');
            setLoading(false);
        }
    };

    return (
        <div className="page-enter" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                animation: 'fadeInUp 0.5s ease'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #c9a84c, #a08535)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: '#0a0a0f',
                        fontFamily: "'Playfair Display', serif",
                        boxShadow: '0 8px 32px rgba(201, 168, 76, 0.3)'
                    }}>
                        N
                    </div>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: '#f0ece2',
                        marginBottom: '8px'
                    }}>
                        Admin Login
                    </h1>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#6b6963'
                    }}>
                        Enter your credentials to access the dashboard
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '20px',
                        padding: '32px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: 'rgba(248, 113, 113, 0.08)',
                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                color: '#f87171',
                                fontSize: '0.85rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        {/* Username */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#a09e96',
                                marginBottom: '8px'
                            }}>
                                Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '1rem',
                                    color: '#6b6963'
                                }}>👤</span>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    style={{ paddingLeft: '44px' }}
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#a09e96',
                                marginBottom: '8px'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '1rem',
                                    color: '#6b6963'
                                }}>🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    style={{ paddingLeft: '44px', paddingRight: '44px' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        color: '#6b6963',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'wait' : 'pointer'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid rgba(10, 10, 15, 0.3)',
                                        borderTopColor: '#0a0a0f',
                                        borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite',
                                        display: 'inline-block'
                                    }}></span>
                                    Logging in...
                                </>
                            ) : (
                                <>🔐 Login to Dashboard</>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    color: '#6b6963',
                    marginTop: '24px'
                }}>
                    🛡️ Secure admin access — NoVerify Platform
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
