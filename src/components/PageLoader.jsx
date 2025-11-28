import React from 'react';
import { Gamepad2, Trophy, Flame, Star } from 'lucide-react';

const PageLoader = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'opacity 0.5s ease-out'
        }}>
            <div className="loader-content" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {/* Animated Icons */}
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Gamepad2
                        size={48}
                        color="var(--accent)"
                        style={{ animation: 'bounce 1s infinite alternate' }}
                    />
                    <Trophy
                        size={48}
                        color="#eab308"
                        style={{ animation: 'bounce 1s infinite alternate 0.2s' }}
                    />
                    <Flame
                        size={48}
                        color="#f97316"
                        style={{ animation: 'bounce 1s infinite alternate 0.4s' }}
                    />
                </div>

                {/* Loading Text */}
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    letterSpacing: '0.1em',
                    animation: 'pulse 1.5s infinite'
                }}>
                    LOADING ARCADE...
                </div>

                {/* Progress Bar (Visual only) */}
                <div style={{
                    width: '200px',
                    height: '4px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--accent)',
                        animation: 'loading 2s infinite ease-in-out',
                        transformOrigin: 'left'
                    }} />
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    from { transform: translateY(0); }
                    to { transform: translateY(-15px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes loading {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.7); }
                    100% { transform: scaleX(1); transform-origin: right; }
                }
            `}</style>
        </div>
    );
};

export default PageLoader;
