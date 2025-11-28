import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Settings, Palette, X, Moon, Sun, Trash2, Download } from 'lucide-react';
import SoundManager from '../utils/SoundManager';

const THEMES = [
    { color: '#a855f7', name: 'Purple' },
    { color: '#38bdf8', name: 'Blue' },
    { color: '#22c55e', name: 'Green' },
    { color: '#ef4444', name: 'Red' },
    { color: '#f97316', name: 'Orange' },
    { color: '#ec4899', name: 'Pink' },
    { color: '#facc15', name: 'Yellow' },
    { color: '#14b8a6', name: 'Teal' },
];

/* ===================================
   SETTINGS BAR COMPONENT
   =================================== */

const SettingsBar = () => {
    const { theme, mode, updateTheme, toggleMode, resetProfile } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const toggleSettings = () => {
        setIsOpen(!isOpen);
        SoundManager.playClick();
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: 'clamp(1rem, 3vw, 3rem)',
            right: 'clamp(1rem, 3vw, 3rem)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 'var(--space-md)'
        }}>
            {/* Settings Panel */}
            {isOpen && (
                <div
                    className="animate-fade-in-scale"
                    style={{
                        background: 'var(--bg-secondary)',
                        backdropFilter: 'blur(12px)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--accent)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        minWidth: 'min(320px, calc(100vw - 2rem))',
                        maxWidth: '400px',
                        transformOrigin: 'bottom right'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-subtle)',
                        paddingBottom: 'var(--space-sm)'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: 'var(--text-lg)',
                            fontWeight: '700',
                            color: 'var(--text-primary)'
                        }}>
                            Settings
                        </h3>
                        <button
                            onClick={toggleSettings}
                            style={{
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
                                minWidth: '32px',
                                minHeight: '32px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            aria-label="Close settings"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Install App Button (Only visible if installable) */}
                    {deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: 'var(--space-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-sm)',
                                fontSize: 'var(--text-sm)'
                            }}
                        >
                            <Download size={18} />
                            Install App
                        </button>
                    )}

                    {/* Mode Toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-sm)',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            {mode === 'dark' ? <Moon size={20} color="var(--accent)" /> : <Sun size={20} color="var(--accent)" />}
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                toggleMode();
                                SoundManager.playClick();
                            }}
                            className="btn"
                            style={{
                                padding: 'var(--space-xs) var(--space-sm)',
                                background: 'var(--bg-elevated)',
                                fontSize: 'var(--text-sm)'
                            }}
                        >
                            Switch to {mode === 'dark' ? 'Light' : 'Dark'}
                        </button>
                    </div>

                    {/* Theme Color Selector */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            marginBottom: 'var(--space-sm)',
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '600'
                        }}>
                            <Palette size={16} />
                            <span>Theme Color</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                            gap: 'var(--space-sm)'
                        }}>
                            {THEMES.map((t) => (
                                <button
                                    key={t.color}
                                    onClick={() => {
                                        updateTheme(t.color);
                                        SoundManager.playPoint();
                                    }}
                                    title={t.name}
                                    aria-label={`Select ${t.name} theme`}
                                    style={{
                                        aspectRatio: '1',
                                        minHeight: '44px',
                                        minWidth: '44px',
                                        borderRadius: '50%',
                                        backgroundColor: t.color,
                                        border: theme === t.color ? '3px solid var(--bg-primary)' : '3px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-base)',
                                        transform: theme === t.color ? 'scale(1.1)' : 'scale(1)',
                                        boxShadow: theme === t.color
                                            ? `0 0 0 2px ${t.color}`
                                            : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (theme !== t.color) {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (theme !== t.color) {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            marginBottom: 'var(--space-sm)',
                            color: 'var(--danger)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '600'
                        }}>
                            <Trash2 size={16} />
                            <span>Danger Zone</span>
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to reset your profile? This will clear all points, streaks, and favorites. This action cannot be undone.')) {
                                    resetProfile();
                                    SoundManager.playLose(); // Play a sound to indicate significant action
                                    setIsOpen(false);
                                } else {
                                    SoundManager.playClick();
                                }
                            }}
                            className="btn"
                            style={{
                                width: '100%',
                                padding: 'var(--space-sm)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--danger)',
                                border: '1px solid var(--danger)',
                                fontSize: 'var(--text-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-sm)'
                            }}
                        >
                            <Trash2 size={16} />
                            Reset Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Settings Toggle Button */}
            <button
                onClick={toggleSettings}
                className="btn btn-primary"
                style={{
                    borderRadius: '50%',
                    width: 'clamp(50px, 12vw, 60px)',
                    height: 'clamp(50px, 12vw, 60px)',
                    padding: 0,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform var(--transition-base)',
                    border: '2px solid var(--accent)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
                aria-label="Toggle settings"
                aria-expanded={isOpen}
            >
                <Settings size={28} />
            </button>
        </div>
    );
};

export default SettingsBar;
