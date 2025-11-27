import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Brain, Ghost, Hand, Music, Heart } from 'lucide-react';
import { useGame } from '../context/GameContext';
import SoundManager from '../utils/SoundManager';

const games = [
    {
        id: 'tictactoe',
        title: 'Tic Tac Toe',
        description: 'Classic strategy game. Play against AI or a friend!',
        icon: <Gamepad2 size={48} color="#38bdf8" />,
        path: '/tictactoe',
        color: 'rgba(56, 189, 248, 0.1)',
        borderColor: '#38bdf8',
        bgImage: '/assets/game-bg-tictactoe.png'
    },
    {
        id: 'memory',
        title: 'Memory Match',
        description: 'Test your memory by matching pairs of cards.',
        icon: <Brain size={48} color="#a855f7" />,
        path: '/memory',
        color: 'rgba(168, 85, 247, 0.1)',
        borderColor: '#a855f7',
        bgImage: '/assets/game-bg-memory.png'
    },
    {
        id: 'snake',
        title: 'Snake',
        description: 'Eat apples, grow longer, and avoid hitting the walls!',
        icon: <Ghost size={48} color="#22c55e" />,
        path: '/snake',
        color: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e',
        bgImage: '/assets/game-bg-snake.png'
    },
    {
        id: 'rps',
        title: 'Rock Paper Scissors',
        description: 'The ultimate game of chance and strategy.',
        icon: <Hand size={48} color="#f472b6" />,
        path: '/rps',
        color: 'rgba(244, 114, 182, 0.1)',
        borderColor: '#f472b6',
        bgImage: '/assets/game-bg-rps.png'
    },
    {
        id: 'simon',
        title: 'Simon Says',
        description: 'Follow the pattern of lights and sounds.',
        icon: <Music size={48} color="#facc15" />,
        path: '/simon',
        color: 'rgba(250, 204, 21, 0.1)',
        borderColor: '#facc15',
        bgImage: '/assets/game-bg-simon.png'
    }
];

import BackgroundParticles from './BackgroundParticles';

const Dashboard = () => {
    const { favorites, toggleFavorite } = useGame();

    // Sort games: Favorites first
    const sortedGames = [...games].sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
    });

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '4rem', position: 'relative' }}>
            <BackgroundParticles />

            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Arcade Hub</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Select a game to start playing. Earn points, build your streak, and challenge yourself!
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                padding: '1rem'
            }}>
                {sortedGames.map((game) => (
                    <div
                        key={game.id}
                        className="card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '2.5rem',
                            background: `linear-gradient(145deg, var(--bg-card) 0%, ${game.color} 100%)`,
                            border: `1px solid ${game.borderColor}`,
                            position: 'relative',
                            overflow: 'hidden',
                            isolation: 'isolate'
                        }}
                        onMouseEnter={() => SoundManager.playHover()}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `url(${game.bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.2,
                            zIndex: -1,
                            transition: 'transform 0.5s ease'
                        }} className="card-bg" />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(game.id);
                                SoundManager.playClick();
                            }}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                color: favorites.includes(game.id) ? '#ef4444' : 'rgba(255,255,255,0.3)',
                                transition: 'transform 0.2s',
                                zIndex: 10
                            }}
                            className="fav-btn"
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={favorites.includes(game.id) ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Heart fill={favorites.includes(game.id) ? "#ef4444" : "none"} size={24} />
                        </button>

                        <div style={{
                            marginBottom: '1.5rem',
                            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))',
                            transform: 'scale(1.2)'
                        }}>
                            {game.icon}
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{game.title}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', lineHeight: '1.6', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            {game.description}
                        </p>
                        <Link
                            to={game.path}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                fontSize: '1.1rem',
                                padding: '1rem',
                                position: 'relative',
                                zIndex: 2
                            }}
                            onClick={() => SoundManager.playClick()}
                        >
                            Play Now
                        </Link>
                    </div>
                ))}
            </div>

        </div >
    );
};

export default Dashboard;
