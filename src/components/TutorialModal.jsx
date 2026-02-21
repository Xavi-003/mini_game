import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import SoundManager from '../utils/SoundManager';

/* ===================================
   TUTORIAL MODAL COMPONENT
   =================================== */

const TutorialModal = ({ isOpen, onClose, title, instructions }) => {
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
                zIndex: 1000,
                backdropFilter: 'blur(5px)',
                animation: 'fadeIn 0.3s ease'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: 'var(--space-lg)',
                    borderRadius: 'var(--radius-xl)',
                    maxWidth: '600px',
                    width: '100%',
                    position: 'relative',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'slideUp 0.3s ease',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => {
                        onClose();
                        SoundManager.playClick();
                    }}
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
                    aria-label="Close tutorial"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-xl)',
                    paddingRight: 'var(--space-xl)' // Space for close button
                }}>
                    <HelpCircle size={40} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <h2 style={{
                        margin: 0,
                        fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                        fontWeight: '800'
                    }}>
                        How to Play {title}
                    </h2>
                </div>

                {/* Instructions */}
                <div style={{
                    color: 'var(--text-secondary)',
                    lineHeight: '1.8',
                    fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)'
                }}>
                    {instructions.map((step, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: 'var(--space-md)',
                                display: 'flex',
                                gap: 'var(--space-md)',
                                alignItems: 'flex-start'
                            }}
                        >
                            <span style={{
                                background: 'var(--accent)',
                                color: 'var(--bg-card)',
                                width: 'clamp(32px, 6vw, 36px)',
                                height: 'clamp(32px, 6vw, 36px)',
                                minWidth: '32px',
                                minHeight: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                fontWeight: '800',
                                flexShrink: 0,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                            }}>
                                {index + 1}
                            </span>
                            <span style={{
                                flex: 1,
                                color: 'var(--text-primary)',
                                paddingTop: '4px',
                                fontWeight: '500'
                            }}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Got It Button */}
                <button
                    onClick={() => {
                        onClose();
                        SoundManager.playClick();
                    }}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        marginTop: 'var(--space-lg)',
                        fontSize: 'var(--text-base)',
                        padding: 'var(--space-md)'
                    }}
                >
                    Got it! Let's Play
                </button>
            </div>

            {/* Animation */}
            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default TutorialModal;
