import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, Save, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const AVATARS = ['😎', '🤖', '👽', '👻', '🦄', '🐱', '🐶', '🦊', '🦁', '🐯'];

const Profile = () => {
    const { profile, points, streak, updateProfile } = useGame();
    const [name, setName] = useState(profile.name);
    const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        updateProfile({ name, avatar: selectedAvatar });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '4rem', maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h1 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Your Profile</h1>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius)', minWidth: '120px' }}>
                        <Trophy size={32} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{points}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total Points</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius)', minWidth: '120px' }}>
                        <Flame size={32} color="#f97316" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{streak}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Current Streak</div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Display Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--bg-card)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '1.1rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Choose Avatar</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                        {AVATARS.map(avatar => (
                            <button
                                key={avatar}
                                onClick={() => setSelectedAvatar(avatar)}
                                style={{
                                    fontSize: '2rem',
                                    padding: '0.5rem',
                                    background: selectedAvatar === avatar ? 'var(--accent)' : 'var(--bg-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.1rem' }}
                >
                    {isSaved ? 'Saved!' : <><Save size={20} style={{ marginRight: '0.5rem' }} /> Save Profile</>}
                </button>
            </div>
        </div>
    );
};

export default Profile;
