import React, { useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import SoundManager from '../utils/SoundManager';

/* ===================================
   WINNER MODAL COMPONENT
   =================================== */

const WinnerModal = ({ isOpen, onClose, winner, pointsEarned }) => {
    useEffect(() => {
        if (isOpen) {
            // Play win sound
            SoundManager.playWin();

            // Confetti animation
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                }));
                confetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-md)',
                zIndex: 2000,
                backdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.3s ease'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                    borderRadius: 'var(--radius-xl)',
                    maxWidth: '500px',
                    width: '100%',
                    position: 'relative',
                    border: '2px solid var(--accent)',
                    boxShadow: '0 0 50px rgba(56, 189, 248, 0.3)',
                    textAlign: 'center',
                    animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 'var(--space-sm)',
                        right: 'var(--space-sm)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: 'var(--space-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all var(--transition-fast)',
                        minWidth: '36px',
                        minHeight: '36px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                {/* Trophy Icon */}
                <Trophy
                    size={clamp(48, 64, 80)}
                    color="var(--accent)"
                    style={{
                        marginBottom: 'var(--space-md)',
                        filter: 'drop-shadow(0 0 10px var(--accent))',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                />

                {/* Winner Text */}
                <h2 style={{
                    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                    marginBottom: 'var(--space-sm)',
                    background: 'linear-gradient(to right, #fff, #38bdf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '800'
                }}>
                    {winner} Wins!
                </h2>

                {/* Points Earned */}
                {pointsEarned > 0 && (
                    <div style={{
                        fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                        color: 'var(--success)',
                        marginBottom: 'var(--space-lg)',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                    }}>
                        +{pointsEarned} Points! 🎉
                    </div>
                )}

                {/* Celebratory Emoji */}
                <div style={{
                    fontSize: 'clamp(3rem, 10vw, 5rem)',
                    marginBottom: 'var(--space-lg)',
                    animation: 'bounce 0.5s ease-in-out'
                }}>
                    🏆
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        fontSize: 'var(--text-lg)',
                        padding: 'var(--space-md)'
                    }}
                >
                    Awesome!
                </button>
            </div>

            {/* Animations */}
            <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
        </div>
    );
};

export default WinnerModal;
