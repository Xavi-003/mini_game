import React, { useEffect, useState } from 'react';
import { Gamepad2, Brain, Ghost, Hand, Music } from 'lucide-react';

/* ===================================
   GAME INTRO COMPONENT
   =================================== */

const GameIntro = ({ gameId, onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 500); // Wait for fade out
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    const getIcon = () => {
        const iconSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 80 : 120;
        switch (gameId) {
            case 'tictactoe': return <Gamepad2 size={iconSize} color="#38bdf8" />;
            case 'memory': return <Brain size={iconSize} color="#a855f7" />;
            case 'snake': return <Ghost size={iconSize} color="#22c55e" />;
            case 'rps': return <Hand size={iconSize} color="#f472b6" />;
            case 'simon': return <Music size={iconSize} color="#facc15" />;
            default: return <Gamepad2 size={iconSize} color="white" />;
        }
    };

    const getTitle = () => {
        switch (gameId) {
            case 'tictactoe': return 'TIC TAC TOE';
            case 'memory': return 'MEMORY MATCH';
            case 'snake': return 'SNAKE';
            case 'rps': return 'ROCK PAPER SCISSORS';
            case 'simon': return 'SIMON SAYS';
            default: return 'GAME START';
        }
    };

    const getColor = () => {
        switch (gameId) {
            case 'tictactoe': return '#38bdf8';
            case 'memory': return '#a855f7';
            case 'snake': return '#22c55e';
            case 'rps': return '#f472b6';
            case 'simon': return '#facc15';
            default: return 'white';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
            animation: visible ? 'fadeIn 0.5s ease-out' : 'fadeOut 0.5s ease-in forwards'
        }}>
            <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes loading {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

            {/* Icon with Pulse Ring */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-lg)' }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'clamp(150px, 30vw, 200px)',
                    height: 'clamp(150px, 30vw, 200px)',
                    borderRadius: '50%',
                    border: `4px solid ${getColor()}`,
                    animation: 'pulse-ring 2s infinite'
                }} />
                <div style={{ animation: 'bounce 1s infinite alternate' }}>
                    {getIcon()}
                </div>
            </div>

            {/* Title */}
            <h1 style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: '900',
                color: 'white',
                textAlign: 'center',
                textShadow: `0 0 20px ${getColor()}`,
                animation: 'slide-up 0.5s ease-out 0.2s backwards',
                letterSpacing: 'clamp(2px, 1vw, 4px)',
                maxWidth: '90vw'
            }}>
                {getTitle()}
            </h1>

            {/* Loading Bar */}
            <div style={{
                width: 'clamp(150px, 40vw, 200px)',
                height: '4px',
                background: 'rgba(255,255,255,0.1)',
                marginTop: 'var(--space-lg)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: getColor(),
                    animation: 'loading 2s linear'
                }} />
            </div>
        </div>
    );
};

export default GameIntro;
