import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Settings, Minus, Plus, Palette, X } from 'lucide-react';
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
    const { theme, scale, updateTheme, updateScale } = useGame();
    const [isOpen, setIsOpen] = useState(false);

    const handleScaleChange = (delta) => {
        const newScale = Math.max(0.8, Math.min(1.5, scale + delta));
        updateScale(newScale);
        SoundManager.playClick();
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
                        background: 'rgba(15, 23, 42, 0.98)',
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
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        paddingBottom: 'var(--space-sm)'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: 'var(--text-lg)',
                            fontWeight: '700'
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
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
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
                                        border: theme === t.color ? '3px solid white' : '3px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-base)',
                                        transform: theme === t.color ? 'scale(1.1)' : 'scale(1)',
                                        boxShadow: theme === t.color
                                            ? `0 0 0 4px ${t.color}40`
                                            : '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (theme !== t.color) {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.borderColor = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (theme !== t.color) {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Zoom/Scale Control */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-sm)',
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '600'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                                <Settings size={16} />
                                <span>Zoom</span>
                            </div>
                            <span style={{
                                color: 'var(--accent)',
                                fontWeight: '700',
                                fontSize: 'var(--text-base)'
                            }}>
                                {(scale * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                        }}>
                            <button
                                onClick={() => handleScaleChange(-0.1)}
                                className="btn"
                                style={{
                                    padding: 'var(--space-xs)',
                                    background: 'var(--bg-primary)',
                                    minHeight: '44px',
                                    minWidth: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                aria-label="Decrease zoom"
                                disabled={scale <= 0.8}
                            >
                                <Minus size={16} />
                            </button>
                            <input
                                type="range"
                                min="0.8"
                                max="1.5"
                                step="0.1"
                                value={scale}
                                onChange={(e) => {
                                    updateScale(parseFloat(e.target.value));
                                    SoundManager.playClick();
                                }}
                                style={{
                                    flex: 1,
                                    accentColor: 'var(--accent)',
                                    cursor: 'pointer',
                                    minHeight: '24px'
                                }}
                                aria-label="Zoom slider"
                            />
                            <button
                                onClick={() => handleScaleChange(0.1)}
                                className="btn"
                                style={{
                                    padding: 'var(--space-xs)',
                                    background: 'var(--bg-primary)',
                                    minHeight: '44px',
                                    minWidth: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                aria-label="Increase zoom"
                                disabled={scale >= 1.5}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
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
