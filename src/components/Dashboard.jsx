import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Brain, Ghost, Hand, Music, Heart } from 'lucide-react';
import { useGame } from '../context/GameContext';
import SoundManager from '../utils/SoundManager';
import BackgroundParticles from './BackgroundParticles';

/* ===================================
   GAMES DATA
   =================================== */

const games = [
    {
        id: 'tictactoe',
        title: 'Tic Tac Toe',
        description: 'Classic strategy game. Play against AI or a friend!',
        icon: <Gamepad2 size={48} color="#38bdf8" />,
        path: '/tictactoe',
        color: 'rgba(56, 189, 248, 0.1)',
        borderColor: '#38bdf8'
    },
    {
        id: 'memory',
        title: 'Memory Match',
        description: 'Test your memory by matching pairs of cards.',
        icon: <Brain size={48} color="#a855f7" />,
        path: '/memory',
        color: 'rgba(168, 85, 247, 0.1)',
        borderColor: '#a855f7'
    },
    {
        id: 'snake',
        title: 'Snake',
        description: 'Eat apples, grow longer, and avoid hitting the walls!',
        icon: <Ghost size={48} color="#22c55e" />,
        path: '/snake',
        color: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e'
    },
    {
        id: 'rps',
        title: 'Rock Paper Scissors',
        description: 'The ultimate game of chance and strategy.',
        icon: <Hand size={48} color="#f472b6" />,
        path: '/rps',
        color: 'rgba(244, 114, 182, 0.1)',
        borderColor: '#f472b6'
    },
    {
        id: 'simon',
        title: 'Simon Says',
        description: 'Follow the pattern of lights and sounds.',
        icon: <Music size={48} color="#facc15" />,
        path: '/simon',
        color: 'rgba(250, 204, 21, 0.1)',
        borderColor: '#facc15'
    }
];

/* ===================================
   DASHBOARD COMPONENT
   =================================== */

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
        <div className="container animate-fade-in" style={{
            paddingTop: 'var(--space-xl)',
            paddingBottom: 'var(--space-xl)',
            position: 'relative',
            minHeight: '100vh'
        }}>
            <BackgroundParticles />

            {/* Hero Section */}
            <div style={{
                textAlign: 'center',
                marginBottom: 'var(--space-xl)',
                maxWidth: '800px',
                margin: '0 auto var(--space-xl) auto'
            }}>
                <h1 className="title" style={{
                    fontSize: 'var(--text-3xl)',
                    marginBottom: 'var(--space-md)'
                }}>
                    🎮 Arcade Hub
                </h1>
                <p style={{
                    fontSize: 'var(--text-lg)',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7'
                }}>
                    Select a game to start playing. Earn points, build your streak, and challenge yourself!
                </p>
            </div>

            {/* Games Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: 'var(--space-lg)',
                maxWidth: 'var(--max-width)',
                margin: '0 auto'
            }}>
                {sortedGames.map((game, index) => (
                    <div
                        key={game.id}
                        className="card animate-fade-in"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: 'var(--space-lg)',
                            background: `linear-gradient(145deg, var(--bg-card) 0%, ${game.color} 100%)`,
                            border: `1px solid ${game.borderColor}20`,
                            position: 'relative',
                            overflow: 'hidden',
                            isolation: 'isolate',
                            animationDelay: `${index * 0.1}s`
                        }}
                        onMouseEnter={() => SoundManager.playHover()}
                    >
                        {/* Favorite Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(game.id);
                                SoundManager.playClick();
                            }}
                            style={{
                                position: 'absolute',
                                top: 'var(--space-sm)',
                                right: 'var(--space-sm)',
                                background: 'none',
                                border: 'none',
                                color: favorites.includes(game.id) ? '#ef4444' : 'rgba(255,255,255,0.3)',
                                transition: 'transform var(--transition-base), color var(--transition-base)',
                                zIndex: 10,
                                padding: 'var(--space-xs)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-full)',
                                minWidth: '44px',
                                minHeight: '44px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title={favorites.includes(game.id) ? "Remove from Favorites" : "Add to Favorites"}
                            aria-label={favorites.includes(game.id) ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Heart
                                fill={favorites.includes(game.id) ? "#ef4444" : "none"}
                                size={24}
                            />
                        </button>

                        {/* Game Icon */}
                        <div style={{
                            marginBottom: 'var(--space-md)',
                            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))',
                            transform: 'scale(1)',
                            transition: 'transform var(--transition-base)'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {game.icon}
                        </div>

                        {/* Game Title */}
                        <h2 style={{
                            fontSize: 'var(--text-xl)',
                            marginBottom: 'var(--space-sm)',
                            color: '#fff',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            fontWeight: '700'
                        }}>
                            {game.title}
                        </h2>

                        {/* Game Description */}
                        <p style={{
                            color: 'rgba(255,255,255,0.8)',
                            marginBottom: 'var(--space-lg)',
                            lineHeight: '1.6',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            fontSize: 'var(--text-sm)',
                            flexGrow: 1
                        }}>
                            {game.description}
                        </p>

                        {/* Play Button */}
                        <Link
                            to={game.path}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                fontSize: 'var(--text-base)',
                                padding: 'var(--space-md)',
                                position: 'relative',
                                zIndex: 2,
                                fontWeight: '600',
                                justifyContent: 'center'
                            }}
                            onClick={() => SoundManager.playClick()}
                        >
                            Play Now
                        </Link>
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-xl)',
                padding: 'var(--space-lg)',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-sm)'
            }}>
                <p>Click the <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> to favorite your games!</p>
            </div>
        </div>
    );
};

export default Dashboard;
