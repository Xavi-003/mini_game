import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Settings, Minus, Plus, Palette, X } from 'lucide-react';

const THEMES = [
    { color: '#a855f7', name: 'Purple' },
    { color: '#38bdf8', name: 'Blue' },
    { color: '#22c55e', name: 'Green' },
    { color: '#ef4444', name: 'Red' },
    { color: '#f97316', name: 'Orange' },
    { color: '#ec4899', name: 'Pink' },
];

const SettingsBar = () => {
    const { theme, scale, updateTheme, updateScale } = useGame();
    const [isOpen, setIsOpen] = useState(false);

    const handleScaleChange = (delta) => {
        const newScale = Math.max(0.8, Math.min(1.5, scale + delta));
        updateScale(newScale);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '3rem',
            right: '3rem',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1rem'
        }}>
            {isOpen && (
                <div className="animate-fade-in" style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(12px)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--accent)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    minWidth: '280px',
                    marginBottom: '1rem',
                    transformOrigin: 'bottom right'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Settings</h3>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <Palette size={16} /> Theme Color
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                            {THEMES.map((t) => (
                                <button
                                    key={t.color}
                                    onClick={() => updateTheme(t.color)}
                                    title={t.name}
                                    style={{
                                        aspectRatio: '1',
                                        borderRadius: '50%',
                                        backgroundColor: t.color,
                                        border: theme === t.color ? '2px solid white' : '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        transform: theme === t.color ? 'scale(1.1)' : 'scale(1)',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <Settings size={16} /> Window Size ({(scale * 100).toFixed(0)}%)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleScaleChange(-0.1)}
                                className="btn"
                                style={{ padding: '0.5rem', background: 'var(--bg-primary)', height: '36px', width: '36px' }}
                            >
                                <Minus size={16} />
                            </button>
                            <input
                                type="range"
                                min="0.8"
                                max="1.5"
                                step="0.1"
                                value={scale}
                                onChange={(e) => updateScale(parseFloat(e.target.value))}
                                style={{ flex: 1, accentColor: 'var(--accent)', height: '4px' }}
                            />
                            <button
                                onClick={() => handleScaleChange(0.1)}
                                className="btn"
                                style={{ padding: '0.5rem', background: 'var(--bg-primary)', height: '36px', width: '36px' }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-primary"
                style={{
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    padding: 0,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
            >
                <Settings size={28} />
            </button>
        </div>
    );
};

export default SettingsBar;
