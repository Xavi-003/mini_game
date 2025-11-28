import React from 'react';
import { X, Pause, Play, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';

/* ===================================
   PAUSE MODAL COMPONENT
   =================================== */

const PauseModal = ({ isOpen, onResume, onRestart, onQuit }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'var(--bg-overlay)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-md)',
                zIndex: 2000,
                backdropFilter: 'blur(5px)',
                animation: 'fadeIn 0.2s ease'
            }}
            onClick={onResume}
        >
            <div
                style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '2rem',
                    borderRadius: 'var(--radius-xl)',
                    maxWidth: '400px',
                    width: '100%',
                    position: 'relative',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Pause size={32} color="var(--text-primary)" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Game Paused</h2>
                </div>

                {/* Resume Button */}
                <button
                    onClick={() => { SoundManager.playClick(); onResume(); }}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem'
                    }}
                >
                    <Play size={20} />
                    <span>Resume Game</span>
                </button>

                {/* Restart Button */}
                <button
                    onClick={() => { SoundManager.playClick(); onRestart(); }}
                    className="btn btn-secondary"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem'
                    }}
                >
                    <RefreshCw size={20} />
                    <span>Restart Game</span>
                </button>

                {/* Quit Button */}
                <Link
                    to="/"
                    className="btn btn-secondary"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        color: 'var(--danger)',
                        borderColor: 'rgba(239, 68, 68, 0.2)'
                    }}
                    onClick={() => { SoundManager.playClick(); onQuit(); }}
                >
                    <Home size={20} />
                    <span>Quit to Menu</span>
                </Link>
            </div>
        </div>
    );
};

export default PauseModal;
