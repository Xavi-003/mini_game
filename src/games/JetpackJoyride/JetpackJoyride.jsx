import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 30;
const OBSTACLE_WIDTH = 60;
const COIN_SIZE = 20;
const GRAVITY = 0.4;
const BOOST_STRENGTH = -6;

const JetpackJoyride = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [playerY, setPlayerY] = useState(GAME_HEIGHT / 2);
    const [velocity, setVelocity] = useState(0);
    const [boosting, setBoosting] = useState(false);
    const [obstacles, setObstacles] = useState([]);
    const [coins, setCoins] = useState([]);
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('jetpackHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);
    const gameSpeed = 4;

    const resetGame = () => {
        setPlayerY(GAME_HEIGHT / 2);
        setVelocity(0);
        setBoosting(false);
        setObstacles([]);
        setCoins([]);
        setScore(0);
        setDistance(0);
        setGameOver(false);
        setIsPaused(false);
        SoundManager.playClick();
    };

    const handleBoost = (active) => {
        if (!gameOver && !isPaused && !showIntro) {
            setBoosting(active);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleBoost(true);
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleBoost(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameOver, isPaused, showIntro]);

    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        const gameLoop = setInterval(() => {
            // Update velocity and position
            setVelocity(prev => boosting ? BOOST_STRENGTH : prev + GRAVITY);
            setPlayerY(prev => {
                const newY = prev + velocity;
                if (newY < 0 || newY > GAME_HEIGHT - PLAYER_SIZE) {
                    setGameOver(true);
                    SoundManager.playLose();
                    if (score > 0) addPoints(Math.floor(score / 10));
                    if (distance > 500) incrementStreak();
                    else resetStreak();
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('jetpackHighScore', score.toString());
                    }
                    return prev;
                }
                return newY;
            });

            // Update obstacles
            setObstacles(prev => {
                let updated = prev.map(obs => ({ ...obs, x: obs.x - gameSpeed })).filter(obs => obs.x > -OBSTACLE_WIDTH);

                if (updated.length === 0 || updated[updated.length - 1].x < GAME_WIDTH - 250) {
                    const height = 100 + Math.random() * 200;
                    const fromTop = Math.random() > 0.5;
                    updated.push({
                        x: GAME_WIDTH,
                        y: fromTop ? 0 : GAME_HEIGHT - height,
                        width: OBSTACLE_WIDTH,
                        height
                    });
                }

                return updated;
            });

            // Update coins
            setCoins(prev => {
                let updated = prev.map(coin => ({ ...coin, x: coin.x - gameSpeed })).filter(coin => coin.x > -COIN_SIZE);

                if (Math.random() < 0.02) {
                    updated.push({
                        x: GAME_WIDTH,
                        y: 50 + Math.random() * (GAME_HEIGHT - 100),
                        collected: false
                    });
                }

                return updated;
            });

            setDistance(prev => prev + 1);
        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [gameOver, isPaused, showIntro, boosting, velocity, score, distance, highScore, addPoints, incrementStreak, resetStreak]);

    // Collision detection
    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        const playerBox = { x: 50, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE };

        // Check obstacles
        for (let obs of obstacles) {
            if (
                playerBox.x < obs.x + obs.width &&
                playerBox.x + playerBox.width > obs.x &&
                playerBox.y < obs.y + obs.height &&
                playerBox.y + playerBox.height > obs.y
            ) {
                setGameOver(true);
                SoundManager.playLose();
                if (score > 0) addPoints(Math.floor(score / 10));
                if (distance > 500) incrementStreak();
                else resetStreak();
                if (score > highScore) {
                    setHighScore(score);
                    localStorage.setItem('jetpackHighScore', score.toString());
                }
                return;
            }
        }

        // Check coins
        setCoins(prev => prev.map(coin => {
            if (
                !coin.collected &&
                playerBox.x < coin.x + COIN_SIZE &&
                playerBox.x + playerBox.width > coin.x &&
                playerBox.y < coin.y + COIN_SIZE &&
                playerBox.y + playerBox.height > coin.y
            ) {
                setScore(s => s + 5);
                SoundManager.playPoint();
                return { ...coin, collected: true };
            }
            return coin;
        }));
    }, [obstacles, coins, playerY, gameOver, isPaused, showIntro, score, distance, highScore, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="jetpack" onComplete={() => setShowIntro(false)} />;
    }

    const headerContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                <ArrowLeft size={20} /> Back
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Best: {highScore}</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--accent)' }}>{score}</div>
                </div>
                <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn btn-secondary" style={{ padding: 'var(--space-sm)' }}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    );

    const footerContent = (
        <button
            onClick={() => { setIsPaused(!isPaused); SoundManager.playClick(); }}
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '200px' }}
            disabled={gameOver}
        >
            {isPaused ? <><Play size={20} style={{ marginRight: 'var(--space-xs)' }} /> Start</> : <><Pause size={20} style={{ marginRight: 'var(--space-xs)' }} /> Pause</>}
        </button>
    );

    return (
        <GameContainer header={headerContent} footer={footerContent}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Jetpack Joyride"
                instructions={[
                    "Hold SPACE or CLICK to boost upward.",
                    "Release to fall down with gravity.",
                    "Dodge the obstacles coming from the right.",
                    "Collect coins for extra points!",
                    "Don't hit the walls or obstacles!"
                ]}
            />

            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}
            >
                <div
                    onMouseDown={() => handleBoost(true)}
                    onMouseUp={() => handleBoost(false)}
                    onMouseLeave={() => handleBoost(false)}
                    onTouchStart={() => handleBoost(true)}
                    onTouchEnd={() => handleBoost(false)}
                    style={{
                        width: `${GAME_WIDTH}px`,
                        height: `${GAME_HEIGHT}px`,
                        background: 'linear-gradient(to right, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                        border: '2px solid var(--border-subtle)',
                        borderRadius: 'var(--radius)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transformOrigin: 'center center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Player */}
                    <div style={{
                        position: 'absolute',
                        left: '50px',
                        top: `${playerY}px`,
                        width: `${PLAYER_SIZE}px`,
                        height: `${PLAYER_SIZE}px`,
                        background: boosting ? '#f59e0b' : '#3b82f6',
                        borderRadius: '50%',
                        boxShadow: boosting ? '0 0 20px rgba(245, 158, 11, 0.8)' : '0 0 10px rgba(59, 130, 246, 0.5)',
                        transition: 'background 0.1s'
                    }}>
                        {boosting && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '20px'
                            }}>🔥</div>
                        )}
                    </div>

                    {/* Obstacles */}
                    {obstacles.map((obs, i) => (
                        <div key={`obs-${i}`} style={{
                            position: 'absolute',
                            left: `${obs.x}px`,
                            top: `${obs.y}px`,
                            width: `${obs.width}px`,
                            height: `${obs.height}px`,
                            background: '#ef4444',
                            border: '2px solid #dc2626',
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                        }} />
                    ))}

                    {/* Coins */}
                    {coins.filter(c => !c.collected).map((coin, i) => (
                        <div key={`coin-${i}`} style={{
                            position: 'absolute',
                            left: `${coin.x}px`,
                            top: `${coin.y}px`,
                            width: `${COIN_SIZE}px`,
                            height: `${COIN_SIZE}px`,
                            background: '#facc15',
                            borderRadius: '50%',
                            border: '2px solid #fbbf24',
                            boxShadow: '0 0 10px rgba(250, 204, 21, 0.6)'
                        }} />
                    ))}

                    {gameOver && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'var(--bg-overlay)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--danger)', marginBottom: 'var(--space-md)' }}>Crash!</h3>
                            <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-lg)' }}>Score: {score}</p>
                            <button onClick={resetGame} className="btn btn-primary">
                                <RefreshCw size={20} style={{ marginRight: 'var(--space-xs)' }} /> Play Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </GameContainer>
    );
};

export default JetpackJoyride;
