import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Brain, Ghost, Hand, Music, Heart, Zap, Bird, Rocket, Car, Box, Hammer, Square, Circle, Target, Sparkles, Swords, Search, Filter, ChevronDown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import SoundManager from '../utils/SoundManager';
import BackgroundParticles from './BackgroundParticles';

/* ===================================
   GAMES DATA
   =================================== */

const games = [
    {
        id: 'memory',
        title: 'Memory Match',
        description: 'Test your memory by matching pairs of cards.',
        category: 'Puzzle',
        icon: <Brain size={48} color="#a855f7" />,
        path: '/memory',
        color: '#a855f7',
        image: 'linear-gradient(135deg, #4c1d95 0%, #a855f7 100%)'
    },
    {
        id: 'snake',
        title: 'Snake',
        description: 'Eat apples, grow longer, and avoid hitting the walls!',
        category: 'Arcade',
        icon: <Ghost size={48} color="#22c55e" />,
        path: '/snake',
        color: '#22c55e',
        image: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)'
    },
    {
        id: 'rps',
        title: 'Rock Paper Scissors',
        description: 'The ultimate game of chance and strategy.',
        category: 'Strategy',
        icon: <Hand size={48} color="#f472b6" />,
        path: '/rps',
        color: '#f472b6',
        image: 'linear-gradient(135deg, #831843 0%, #f472b6 100%)'
    },
    {
        id: 'simon',
        title: 'Simon Says',
        description: 'Follow the pattern of lights and sounds.',
        category: 'Puzzle',
        icon: <Music size={48} color="#facc15" />,
        path: '/simon',
        color: '#facc15',
        image: 'linear-gradient(135deg, #713f12 0%, #facc15 100%)'
    },
    {
        id: 'trex',
        title: 'T-Rex Runner',
        description: 'Jump over obstacles in this endless runner!',
        category: 'Arcade',
        icon: <Zap size={48} color="#22d3ee" />,
        path: '/trex',
        color: '#22d3ee',
        image: 'linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)'
    },
    {
        id: 'flappy',
        title: 'Flappy Bird',
        description: 'Tap to flap and navigate through the pipes.',
        category: 'Arcade',
        icon: <Bird size={48} color="#3b82f6" />,
        path: '/flappy',
        color: '#3b82f6',
        image: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
    },
    {
        id: 'jetpack',
        title: 'Jetpack Joyride',
        description: 'Boost through obstacles and collect coins!',
        category: 'Action',
        icon: <Rocket size={48} color="#f97316" />,
        path: '/jetpack',
        color: '#f97316',
        image: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)'
    },
    {
        id: 'crossy',
        title: 'Crossy Road',
        description: 'Cross the road and dodge the traffic!',
        category: 'Arcade',
        icon: <Car size={48} color="#84cc16" />,
        path: '/crossy',
        color: '#84cc16',
        image: 'linear-gradient(135deg, #365314 0%, #84cc16 100%)'
    },
    {
        id: 'stack',
        title: 'Stack',
        description: 'Stack blocks perfectly to build the highest tower.',
        category: 'Arcade',
        icon: <Box size={48} color="#8b5cf6" />,
        path: '/stack',
        color: '#8b5cf6',
        image: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)'
    },
    {
        id: 'whac',
        title: 'Whac-A-Mole',
        description: 'Whack as many moles as you can in 60 seconds!',
        category: 'Action',
        icon: <Hammer size={48} color="#f43f5e" />,
        path: '/whac-a-mole',
        color: '#f43f5e',
        image: 'linear-gradient(135deg, #881337 0%, #f43f5e 100%)'
    },
    {
        id: 'breakout',
        title: 'Breakout',
        description: 'Break all the bricks with the ball and paddle.',
        category: 'Arcade',
        icon: <Square size={48} color="#14b8a6" />,
        path: '/breakout',
        color: '#14b8a6',
        image: 'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)'
    },
    {
        id: 'bubble',
        title: 'Bubble Shooter',
        description: 'Match 3 bubbles of the same color to pop them!',
        category: 'Puzzle',
        icon: <Circle size={48} color="#06b6d4" />,
        path: '/bubble',
        color: '#06b6d4',
        image: 'linear-gradient(135deg, #164e63 0%, #06b6d4 100%)'
    },
    {
        id: 'peggle',
        title: 'Peggle',
        description: 'Clear all orange pegs by bouncing the ball.',
        category: 'Puzzle',
        icon: <Target size={48} color="#fb923c" />,
        path: '/peggle',
        color: '#fb923c',
        image: 'linear-gradient(135deg, #7c2d12 0%, #fb923c 100%)'
    },
    {
        id: 'pacman',
        title: 'Pac-Man',
        description: 'Collect all dots while avoiding the ghosts!',
        category: 'Arcade',
        icon: <Ghost size={48} color="#fbbf24" />,
        path: '/pacman',
        color: '#fbbf24',
        image: 'linear-gradient(135deg, #78350f 0%, #fbbf24 100%)'
    },
    {
        id: 'tron',
        title: 'Tron',
        description: 'Avoid trails in this light cycle battle!',
        category: 'Action',
        icon: <Zap size={48} color="#3b82f6" />,
        path: '/tron',
        color: '#3b82f6',
        image: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
    },
    {
        id: 'vampire',
        title: 'Vampire Survivors',
        description: 'Survive the horde for 3 minutes!',
        category: 'Action',
        icon: <Swords size={48} color="#dc2626" />,
        path: '/vampire',
        color: '#dc2626',
        image: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)'
    }
];

const CATEGORIES = ['All', 'Arcade', 'Puzzle', 'Action', 'Strategy'];
const SORT_OPTIONS = [
    { label: 'Popular', value: 'popular' },
    { label: 'Newest', value: 'newest' },
    { label: 'A-Z', value: 'az' },
    { label: 'Z-A', value: 'za' }
];

/* ===================================
   DASHBOARD COMPONENT
   =================================== */

const Dashboard = () => {
    const { favorites, toggleFavorite } = useGame();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('popular');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Filter and Sort Games
    const filteredGames = useMemo(() => {
        let result = [...games];

        // Filter by Category
        if (selectedCategory !== 'All') {
            result = result.filter(game => game.category === selectedCategory);
        }

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(game =>
                game.title.toLowerCase().includes(query) ||
                game.description.toLowerCase().includes(query)
            );
        }

        // Sort
        result.sort((a, b) => {
            // Favorites always on top for 'popular' sort
            if (sortBy === 'popular') {
                const aFav = favorites.includes(a.id);
                const bFav = favorites.includes(b.id);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                return 0; // Keep original order otherwise
            }
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            if (sortBy === 'za') return b.title.localeCompare(a.title);
            if (sortBy === 'newest') return 0; // Assuming array order is roughly newest
            return 0;
        });

        return result;
    }, [searchQuery, selectedCategory, sortBy, favorites]);

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

            {/* Search & Filter Section */}
            <div style={{
                maxWidth: 'var(--max-width)',
                margin: '0 auto var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)'
            }}>
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {/* Search Input */}
                    <div style={{
                        flex: '1 1 300px',
                        position: 'relative'
                    }}>
                        <Search size={20} style={{
                            position: 'absolute',
                            left: 'var(--space-md)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }} />
                        <input
                            type="text"
                            placeholder="Search for games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '3rem',
                                background: 'var(--bg-elevated)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-full)',
                                height: '50px',
                                fontSize: 'var(--text-base)',
                                color: 'var(--text-primary)',
                                transition: 'all var(--transition-base)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div style={{ position: 'relative', minWidth: '150px' }}>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            style={{
                                width: '100%',
                                height: '50px',
                                padding: '0 var(--space-md)',
                                background: 'var(--bg-elevated)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-full)',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                fontSize: 'var(--text-sm)',
                                fontWeight: '600'
                            }}
                        >
                            <span>Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                            <ChevronDown size={16} style={{
                                transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s'
                            }} />
                        </button>

                        {isSortOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                left: 0,
                                right: 0,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                zIndex: 50,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                            }}>
                                {SORT_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value);
                                            setIsSortOpen(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-sm) var(--space-md)',
                                            textAlign: 'left',
                                            background: sortBy === option.value ? 'var(--accent-light)' : 'transparent',
                                            color: sortBy === option.value ? 'var(--accent)' : 'var(--text-primary)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 'var(--text-sm)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (sortBy !== option.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (sortBy !== option.value) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Filters */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    overflowX: 'auto',
                    paddingBottom: 'var(--space-xs)',
                    scrollbarWidth: 'none'
                }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: 'var(--space-xs) var(--space-lg)',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid',
                                borderColor: selectedCategory === cat ? 'var(--accent)' : 'var(--border-subtle)',
                                background: selectedCategory === cat ? 'var(--accent)' : 'var(--bg-elevated)',
                                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all var(--transition-base)'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Games Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 'var(--space-lg)',
                maxWidth: 'var(--max-width)',
                margin: '0 auto'
            }}>
                {filteredGames.map((game, index) => (
                    <div
                        key={game.id}
                        className="card animate-fade-in"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 0,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            position: 'relative',
                            overflow: 'hidden',
                            animationDelay: `${index * 0.05}s`,
                            height: '100%',
                            transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = `0 20px 40px -5px ${game.color}40`;
                            e.currentTarget.style.borderColor = game.color;
                            SoundManager.playHover();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        }}
                    >
                        {/* Image Container */}
                        <div style={{
                            height: '200px',
                            background: game.image,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {/* Pattern Overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                opacity: 0.2,
                                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                                backgroundSize: '20px 20px'
                            }} />

                            {/* Icon */}
                            <div style={{
                                transform: 'scale(1.5)',
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                            }}>
                                {game.icon}
                            </div>

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
                                    background: 'rgba(0,0,0,0.3)',
                                    backdropFilter: 'blur(4px)',
                                    border: 'none',
                                    color: favorites.includes(game.id) ? '#ef4444' : 'rgba(255,255,255,0.7)',
                                    transition: 'all var(--transition-base)',
                                    zIndex: 10,
                                    padding: 'var(--space-xs)',
                                    borderRadius: 'var(--radius-full)',
                                    cursor: 'pointer',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={favorites.includes(game.id) ? "Remove from Favorites" : "Add to Favorites"}
                            >
                                <Heart
                                    fill={favorites.includes(game.id) ? "#ef4444" : "none"}
                                    size={20}
                                />
                            </button>

                            {/* Category Badge */}
                            <div style={{
                                position: 'absolute',
                                bottom: 'var(--space-sm)',
                                left: 'var(--space-sm)',
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(4px)',
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {game.category}
                            </div>
                        </div>

                        {/* Content Body */}
                        <div style={{
                            padding: 'var(--space-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: 1,
                            background: 'linear-gradient(to bottom, var(--bg-card), var(--bg-secondary))'
                        }}>
                            <h3 style={{
                                fontSize: 'var(--text-lg)',
                                fontWeight: '700',
                                marginBottom: 'var(--space-xs)',
                                color: 'var(--text-primary)'
                            }}>
                                {game.title}
                            </h3>

                            <p style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--space-md)',
                                lineHeight: '1.5',
                                flexGrow: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {game.description}
                            </p>

                            <Link
                                to={game.path}
                                className="btn"
                                style={{
                                    width: '100%',
                                    background: `linear-gradient(90deg, ${game.color} 0%, ${game.color}dd 100%)`,
                                    color: '#fff',
                                    border: 'none',
                                    padding: 'var(--space-sm)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: '600',
                                    marginTop: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 'var(--space-xs)'
                                }}
                                onClick={() => SoundManager.playClick()}
                            >
                                <Gamepad2 size={16} />
                                Play Now
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredGames.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl)',
                    color: 'var(--text-secondary)'
                }}>
                    <Ghost size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                    <h3>No games found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Footer Info */}
            <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-xl)',
                padding: 'var(--space-lg)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)'
            }}>
                <p>Click the <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> to favorite your games!</p>
            </div>
        </div>
    );
};

export default Dashboard;
