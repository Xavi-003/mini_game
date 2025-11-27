import React, { useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const WIN_GIFS = [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp4bW54bW54bW54bW54bW54bW54bW54bW54bW54bW54/g9582DnuQxDKD84/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp4bW54bW54bW54bW54bW54bW54bW54bW54bW54bW54/nXxOjZrbnbRxS/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp4bW54bW54bW54bW54bW54bW54bW54bW54bW54bW54/11sBLVxNs7v6WA/giphy.gif"
];

const WinnerModal = ({ isOpen, onClose, winner, pointsEarned }) => {
    useEffect(() => {
        if (isOpen) {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const randomGif = WIN_GIFS[Math.floor(Math.random() * WIN_GIFS.length)];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
                border: '2px solid var(--accent)',
                boxShadow: '0 0 50px rgba(56, 189, 248, 0.3)',
                textAlign: 'center',
                animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <Trophy size={64} color="var(--accent)" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px var(--accent))' }} />

                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {winner} Wins!
                </h2>

                {pointsEarned > 0 && (
                    <div style={{ fontSize: '1.5rem', color: 'var(--success)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                        +{pointsEarned} Points
                    </div>
                )}

                <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '2rem', border: '2px solid rgba(255,255,255,0.1)' }}>
                    <img src={randomGif} alt="Winner GIF" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>

                <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
                >
                    Awesome!
                </button>
            </div>
            <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default WinnerModal;
