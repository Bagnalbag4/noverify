import { useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import TestimonialCard from '../components/TestimonialCard';
import CountdownTimer from '../components/CountdownTimer';
import { testimonials, faqItems } from '../data';

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '923141603089';

export default function LandingPage({ services, onNavigate, onSelectService }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFaq, setOpenFaq] = useState(null);

    const filteredServices = activeCategory === 'all'
        ? services
        : services.filter(s => s.category === activeCategory);



    const handleOrder = (service) => {
        onSelectService(service);
        onNavigate('checkout');
    };

    const trustStats = [
        { value: '10,000+', label: 'Orders Delivered' },
        { value: '100%', label: 'Success Rate' },
        { value: '5.0', label: 'Star Rating' },
        { value: '24/7', label: 'Live Support' }
    ];

    return (
        <div className="page-enter">

            {/* ─── Hero Section ─── */}
            <section style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                paddingTop: '72px'
            }}>
                {/* Animated gradient background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201, 168, 76, 0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(201, 168, 76, 0.06) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(201, 168, 76, 0.04) 0%, transparent 50%)',
                    animation: 'gradientShift 15s ease infinite',
                    backgroundSize: '200% 200%'
                }} />

                {/* Floating orbs */}
                <div style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(201, 168, 76, 0.04) 0%, transparent 70%)',
                    top: '10%',
                    right: '-10%',
                    animation: 'float 8s ease-in-out infinite',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(201, 168, 76, 0.03) 0%, transparent 70%)',
                    bottom: '10%',
                    left: '-5%',
                    animation: 'float 10s ease-in-out infinite reverse',
                    pointerEvents: 'none'
                }} />

                <div className="container" style={{
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                    padding: '60px 20px'
                }}>
                    {/* Top badge */}
                    <div style={{
                        animation: 'fadeInDown 0.8s ease both',
                        marginBottom: '32px'
                    }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 20px',
                            borderRadius: '100px',
                            background: 'rgba(201, 168, 76, 0.08)',
                            border: '1px solid rgba(201, 168, 76, 0.2)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: '#c9a84c',
                            letterSpacing: '0.3px'
                        }}>
                            <span style={{ animation: 'pulse 2s infinite' }}>●</span>
                            47 creators bought services today
                        </span>
                    </div>

                    {/* Main heading */}
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        animation: 'fadeInUp 0.8s ease 0.2s both',
                        color: '#f0ece2'
                    }}>
                        Your Growth.<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #e3c96e, #c9a84c, #a08535)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            One Number Away.
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                        color: '#a09e96',
                        lineHeight: 1.7,
                        maxWidth: '600px',
                        margin: '0 auto 40px',
                        animation: 'fadeInUp 0.8s ease 0.4s both'
                    }}>
                        Pakistan's most trusted source for verified accounts & real numbers.
                        Delivered in minutes. Trusted by 10,000+ creators.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        animation: 'fadeInUp 0.8s ease 0.6s both'
                    }}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Browse Services
                        </button>
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => window.open(`https://wa.me/${WHATSAPP}`, '_blank')}
                        >
                            💬 WhatsApp Us
                        </button>
                    </div>

                    {/* Trust bar */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '20px',
                        maxWidth: '700px',
                        margin: '70px auto 0',
                        animation: 'fadeInUp 0.8s ease 0.8s both'
                    }}>
                        {trustStats.map((stat, i) => (
                            <div key={i} style={{
                                textAlign: 'center',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.04)'
                            }}>
                                <div style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: '#c9a84c',
                                    marginBottom: '4px'
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: '0.78rem',
                                    color: '#6b6963',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'fadeIn 1s ease 1.5s both'
                }}>
                    <span style={{ fontSize: '0.72rem', color: '#6b6963', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Scroll
                    </span>
                    <div style={{
                        width: '1px',
                        height: '30px',
                        background: 'linear-gradient(to bottom, rgba(201, 168, 76, 0.5), transparent)',
                        animation: 'pulse 2s infinite'
                    }} />
                </div>
            </section>

            {/* ─── Services Section ─── */}
            <section id="services-section" className="page-section" style={{ position: 'relative' }}>
                <div className="container">
                    <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                        <span className="badge badge-gold" style={{ marginBottom: '16px', display: 'inline-block' }}>
                            Our Services
                        </span>
                        <h2 className="section-title">
                            Premium Digital Services
                        </h2>
                        <p className="section-subtitle">
                            Everything you need to grow your online presence. Verified, trusted, and delivered fast.
                        </p>
                    </div>

                    {/* Category filter */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '40px',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { key: 'all', label: 'All Services' },
                            { key: 'numbers', label: 'Phone Numbers' },
                            { key: 'accounts', label: 'Accounts & Channels' }
                        ].map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '100px',
                                    fontSize: '0.88rem',
                                    fontWeight: 500,
                                    border: '1px solid',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: activeCategory === cat.key ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                                    color: activeCategory === cat.key ? '#c9a84c' : '#a09e96',
                                    borderColor: activeCategory === cat.key ? 'rgba(201, 168, 76, 0.3)' : 'rgba(255, 255, 255, 0.06)'
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Services grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredServices.map((service, i) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onOrder={handleOrder}
                                index={i}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Flash Sale Section ─── */}
            <section className="page-section" style={{
                background: 'linear-gradient(180deg, transparent, rgba(201, 168, 76, 0.03), transparent)'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span className="badge badge-danger" style={{ marginBottom: '16px', display: 'inline-block' }}>
                        ⏰ Flash Sale
                    </span>
                    <h2 className="section-title">
                        Today's Deal Ends In
                    </h2>
                    <p className="section-subtitle">
                        Grab discounted prices before time runs out. Stock is extremely limited.
                    </p>
                    <CountdownTimer />
                    <div style={{ marginTop: '40px' }}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Grab The Deal →
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Social Proof Strip ─── */}
            <section style={{
                padding: '40px 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                background: 'rgba(255, 255, 255, 0.01)'
            }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'clamp(24px, 5vw, 60px)',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { icon: '🛡️', text: 'Verified & Trusted' },
                            { icon: '⚡', text: 'Instant Delivery' },
                            { icon: '🔒', text: '100% Secure Payments' },
                            { icon: '🔄', text: 'Money-Back Guarantee' },
                            { icon: '💬', text: '24/7 WhatsApp Support' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.88rem',
                                fontWeight: 500,
                                color: '#a09e96'
                            }}>
                                <span>{item.icon}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Testimonials Section ─── */}
            <section className="page-section">
                <div className="container">
                    <span className="badge badge-gold" style={{ marginBottom: '16px', display: 'inline-block', margin: '0 auto 16px', textAlign: 'center', width: 'fit-content' }}>
                        Customer Reviews
                    </span>
                    <h2 className="section-title">
                        What Our Customers Say
                    </h2>
                    <p className="section-subtitle">
                        Real reviews from real customers. No fake testimonials — we don't need them.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '24px'
                    }}>
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={i} testimonial={t} index={i} />
                        ))}
                    </div>
                </div>
            </section>



            {/* ─── FAQ Section ─── */}
            <section className="page-section">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <span className="badge badge-gold" style={{ marginBottom: '16px', display: 'inline-block', margin: '0 auto 16px', textAlign: 'center', width: 'fit-content' }}>
                        FAQ
                    </span>
                    <h2 className="section-title">
                        Frequently Asked Questions
                    </h2>
                    <p className="section-subtitle">
                        Got questions? We've got answers. If you need more help, WhatsApp us anytime.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {faqItems.map((faq, i) => (
                            <div
                                key={i}
                                style={{
                                    background: openFaq === i ? 'rgba(201, 168, 76, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${openFaq === i ? 'rgba(201, 168, 76, 0.15)' : 'rgba(255, 255, 255, 0.04)'}`,
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '20px 24px',
                                        background: 'none',
                                        border: 'none',
                                        color: openFaq === i ? '#c9a84c' : '#f0ece2',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'color 0.3s ease'
                                    }}
                                >
                                    <span>{faq.question}</span>
                                    <span style={{
                                        fontSize: '1.2rem',
                                        color: '#c9a84c',
                                        transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s ease',
                                        flexShrink: 0,
                                        marginLeft: '12px'
                                    }}>
                                        +
                                    </span>
                                </button>
                                {openFaq === i && (
                                    <div style={{
                                        padding: '0 24px 20px',
                                        fontSize: '0.9rem',
                                        color: '#a09e96',
                                        lineHeight: 1.7,
                                        animation: 'fadeIn 0.3s ease'
                                    }}>
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ─── */}
            <section style={{
                padding: '80px 0',
                background: 'linear-gradient(180deg, transparent, rgba(201, 168, 76, 0.04), rgba(201, 168, 76, 0.06))',
                borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                        fontWeight: 700,
                        marginBottom: '16px',
                        color: '#f0ece2'
                    }}>
                        Ready to Start Your Journey?
                    </h2>
                    <p style={{
                        fontSize: '1.05rem',
                        color: '#a09e96',
                        marginBottom: '36px',
                        maxWidth: '500px',
                        margin: '0 auto 36px'
                    }}>
                        Join 10,000+ creators who trust us. Get your service delivered in minutes.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}>
                            Browse Services →
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={() => window.open('https://wa.me/923141603089', '_blank')}>
                            💬 Chat on WhatsApp
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer style={{
                padding: '60px 0 30px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(255, 255, 255, 0.01)'
            }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '40px',
                        marginBottom: '50px'
                    }}>
                        {/* Brand Column */}
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: 'linear-gradient(135deg, #c9a84c, #a08535)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    color: '#0a0a0f',
                                    fontFamily: "'Playfair Display', serif"
                                }}>N</div>
                                <span style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    color: '#f0ece2'
                                }}>
                                    No<span style={{ color: '#c9a84c' }}>Verify</span>
                                </span>
                            </div>
                            <p style={{
                                fontSize: '0.88rem',
                                color: '#6b6963',
                                lineHeight: 1.7
                            }}>
                                Pakistan's most trusted digital services platform. Real numbers, verified accounts, instant delivery.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', color: '#f0ece2' }}>Quick Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['Services', 'Pricing', 'Reviews', 'FAQ'].map(link => (
                                    <span key={link} style={{ fontSize: '0.88rem', color: '#6b6963', cursor: 'pointer', transition: 'color 0.3s' }}
                                        onMouseEnter={(e) => e.target.style.color = '#c9a84c'}
                                        onMouseLeave={(e) => e.target.style.color = '#6b6963'}
                                    >
                                        {link}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', color: '#f0ece2' }}>Payment Methods</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.04)'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>📱</span>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0ece2' }}>JazzCash</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b6963' }}>Instant Payment</div>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.04)'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>💳</span>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0ece2' }}>EasyPaisa</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b6963' }}>Instant Payment</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', color: '#f0ece2' }}>Contact Us</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ fontSize: '0.88rem', color: '#6b6963' }}>💬 WhatsApp: +92 300 1234567</span>
                                <span style={{ fontSize: '0.88rem', color: '#6b6963' }}>📧 Email: support@noverify.pk</span>
                                <span style={{ fontSize: '0.88rem', color: '#6b6963' }}>🕐 Available: 24/7</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        paddingTop: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '0.82rem', color: '#6b6963' }}>
                            © 2026 NoVerify. All rights reserved.
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#6b6963' }}>
                            Made with ♥ in Pakistan
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
