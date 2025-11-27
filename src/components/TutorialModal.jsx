import React from 'react';
import { X, HelpCircle } from 'lucide-react';

const TutorialModal = ({ isOpen, onClose, title, instructions }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.3s ease'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'var(--shadow-lg)',
                animation: 'slideUp 0.3s ease'
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <HelpCircle size={32} color="var(--accent)" />
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>How to Play {title}</h2>
                </div>

                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
                    {instructions.map((step, index) => (
                        <div key={index} style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                            <span style={{
                                background: 'rgba(255,255,255,0.1)',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                flexShrink: 0,
                                marginTop: '2px'
                            }}>{index + 1}</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1.5rem' }}
                >
                    Got it!
                </button>
            </div>
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
