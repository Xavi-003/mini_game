import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, Save, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import SoundManager from '../utils/SoundManager';

const AVATARS = ['😎', '🤖', '👽', '👻', '🦄', '🐱', '🐶', '🦊', '🦁', '🐯', '🐼', '🐨', '🦝', '🦋', '🌟'];

/* ===================================
   PROFILE COMPONENT
   =================================== */

const Profile = () => {
    const { profile, points, streak, updateProfile } = useGame();
    const [name, setName] = useState(profile.name);
    const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        updateProfile({ name, avatar: selectedAvatar });
        setIsSaved(true);
        SoundManager.playPoint();
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div
            className="container animate-fade-in"
            style={{
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                maxWidth: '700px',
                margin: '0 auto'
            }}
        >
            {/* Back Button */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 'var(--space-lg)'
            }}>
                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-xs)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)',
                        transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onClick={() => SoundManager.playClick()}
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Link>
            </div>

            {/* Profile Card */}
            <div className="card" style={{
                padding: 'var(--space-lg)',
                animation: 'fadeInScale 0.4s ease-out forwards'
            }}>
                <h1 className="title" style={{
                    textAlign: 'center',
                    marginBottom: 'var(--space-lg)',
                    fontSize: 'var(--text-2xl)'
                }}>
                    Your Profile
                </h1>

                {/* Stats Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-xl)'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-md)',
                        background: 'rgba(56, 189, 248, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(56, 189, 248, 0.2)'
                    }}>
                        <Trophy size={32} color="var(--accent)" style={{ marginBottom: 'var(--space-xs)' }} />
                        <div style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'bold',
                            color: 'var(--accent)'
                        }}>
                            {points}
                        </div>
                        <div style={{
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)'
                        }}>
                            Total Points
                        </div>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-md)',
                        background: 'rgba(249, 115, 22, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                    }}>
                        <Flame size={32} color="#f97316" style={{ marginBottom: 'var(--space-xs)' }} />
                        <div style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'bold',
                            color: '#f97316'
                        }}>
                            {streak}
                        </div>
                        <div style={{
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)'
                        }}>
                            Current Streak
                        </div>
                    </div>
                </div>

                {/* Name Input */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 'var(--space-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600'
                    }}>
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={20}
                        placeholder="Enter your name"
                        style={{
                            width: '100%',
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--text-base)',
                            transition: 'border-color var(--transition-base)'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                </div>

                {/* Avatar Selection */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 'var(--space-md)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600'
                    }}>
                        Choose Avatar
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                        gap: 'var(--space-sm)',
                        maxWidth: '100%'
                    }}>
                        {AVATARS.map((avatar) => (
                            <button
                                key={avatar}
                                onClick={() => {
                                    setSelectedAvatar(avatar);
                                    SoundManager.playClick();
                                }}
                                style={{
                                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                    padding: 'var(--space-sm)',
                                    background: selectedAvatar === avatar
                                        ? 'var(--accent)'
                                        : 'var(--bg-primary)',
                                    border: selectedAvatar === avatar
                                        ? '2px solid var(--accent)'
                                        : '2px solid transparent',
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-base)',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '44px',
                                    minWidth: '44px'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedAvatar !== avatar) {
                                        e.currentTarget.style.background = 'var(--bg-elevated)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedAvatar !== avatar) {
                                        e.currentTarget.style.background = 'var(--bg-primary)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }
                                }}
                                aria-label={`Select ${avatar} avatar`}
                                aria-pressed={selectedAvatar === avatar}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        fontSize: 'var(--text-base)',
                        padding: 'var(--space-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-sm)',
                        transition: 'all var(--transition-base)'
                    }}
                    disabled={!name.trim()}
                >
                    {isSaved ? (
                        '✓ Saved Successfully!'
                    ) : (
                        <>
                            <Save size={20} />
                            <span>Save Profile</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Profile;
