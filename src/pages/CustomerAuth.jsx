import { useState } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function CustomerAuth({ onNavigate, addToast }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegistering) {
                // 1. Create User
                const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

                // 2. Add profile to Firestore customers collection so CRM sees them
                await setDoc(doc(db, "customers", user.uid), {
                    id: user.uid,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    city: 'Unknown',
                    totalOrders: 0,
                    totalSpent: 0,
                    status: 'active',
                    notes: 'Registered via Customer Portal',
                    joinDate: new Date().toISOString().split('T')[0],
                    tags: []
                });

                addToast({ type: 'success', title: 'Welcome!', message: 'Registration successful.' });
            } else {
                // Login User
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                addToast({ type: 'success', title: 'Welcome Back!', message: 'Login successful.' });
            }
            onNavigate('dashboard');
        } catch (error) {
            console.error("Auth Error:", error);
            // Translate common Firebase errors
            let msg = 'Authentication failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please login.';
            if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
            if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';

            addToast({ type: 'error', title: 'Error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(17, 17, 24, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#f0ece2',
        fontSize: '0.95rem',
        outline: 'none',
        marginBottom: '16px',
        transition: 'all 0.3s'
    };

    return (
        <div className="page-enter" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            paddingTop: '60px'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '40px 32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative BG element */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: '#f0ece2',
                        marginBottom: '8px'
                    }}>
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        color: '#a09e96',
                        fontSize: '0.9rem',
                        marginBottom: '32px'
                    }}>
                        {isRegistering
                            ? 'Manage your orders, tickets, and profile.'
                            : 'Sign in to access your customer dashboard.'}
                    </p>

                    <form onSubmit={handleSubmit}>
                        {isRegistering && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    style={inputStyle}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number (e.g. 0300-1234567)"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    style={inputStyle}
                                />
                            </>
                        )}
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            style={inputStyle}
                        />

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : (isRegistering ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        color: '#a09e96'
                    }}>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            className="btn-link"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#c9a84c',
                                fontWeight: 600,
                                padding: 0,
                                marginLeft: '8px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                            onClick={() => setIsRegistering(!isRegistering)}
                        >
                            {isRegistering ? 'Log in' : 'Register here'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
