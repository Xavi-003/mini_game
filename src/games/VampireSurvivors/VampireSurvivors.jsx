import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import WinnerModal from '../../components/WinnerModal';
import { useGame } from '../../context/GameContext';
import useGameScale from '../../hooks/useGameScale';
import SoundManager from '../../utils/SoundManager';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 25;
const ENEMY_SIZE = 20;
const ORB_SIZE = 8;
const GAME_DURATION = 180; // 3 minutes

const VampireSurvivors = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 0, vy: 0 });
    const [enemies, setEnemies] = useState([]);
    const [orbs, setOrbs] = useState([]);
    const [projectiles, setProjectiles] = useState([]);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('vampireHighScore')) || 0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [keys, setKeys] = useState({});
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, GAME_WIDTH, GAME_HEIGHT);

    const resetGame = () => {
        setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 0, vy: 0 });
        setEnemies([]);
        setOrbs([]);
        setProjectiles([]);
        setTimeLeft(GAME_DURATION);
        setScore(0);
        setLevel(1);
        setGameStarted(true);
        setGameOver(false);
        setIsPaused(false);
        setShowWinnerModal(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            setKeys(prev => ({ ...prev, [e.key]: true }));
        };
        const handleKeyUp = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            setKeys(prev => ({ ...prev, [e.key]: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (!gameStarted || gameOver || showIntro || isPaused) return;

        const gameLoop = setInterval(() => {
            // Move player
            setPlayer(prev => {
                let vx = 0, vy = 0;
                if (keys['ArrowLeft'] || keys['a']) vx = -3;
                if (keys['ArrowRight'] || keys['d']) vx = 3;
                if (keys['ArrowUp'] || keys['w']) vy = -3;
                if (keys['ArrowDown'] || keys['s']) vy = 3;

                const newX = Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, prev.x + vx));
                const newY = Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, prev.y + vy));
                return { ...prev, x: newX, y: newY, vx, vy };
            });

            // Auto-shoot
            if (Math.random() < 0.15 && enemies.length > 0) {
                setProjectiles(prev => {
                    const nearestEnemy = enemies.reduce((nearest, enemy) => {
                        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
                        return dist < nearest.dist ? { enemy, dist } : nearest;
                    }, { enemy: enemies[0], dist: Infinity }).enemy;

                    const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
                    return [...prev, {
                        x: player.x,
                        y: player.y,
                        vx: Math.cos(angle) * 6,
                        vy: Math.sin(angle) * 6
                    }];
                });
            }

            // Move projectiles
            setProjectiles(prev => prev
                .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy }))
                .filter(p => p.x > 0 && p.x < GAME_WIDTH && p.y > 0 && p.y < GAME_HEIGHT)
            );

            // Spawn enemies
            if (Math.random() < 0.05 + level * 0.01) {
                const side = Math.floor(Math.random() * 4);
                let x, y;
                switch (side) {
                    case 0: x = Math.random() * GAME_WIDTH; y = -ENEMY_SIZE; break;
                    case 1: x = GAME_WIDTH + ENEMY_SIZE; y = Math.random() * GAME_HEIGHT; break;
                    case 2: x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT + ENEMY_SIZE; break;
                    default: x = -ENEMY_SIZE; y = Math.random() * GAME_HEIGHT;
                }
                setEnemies(prev => [...prev, { x, y, hp: 1 }]);
            }

            // Move enemies toward player
            setEnemies(prev => prev.map(enemy => {
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const speed = 1.5;
                return {
                    ...enemy,
                    x: enemy.x + Math.cos(angle) * speed,
                    y: enemy.y + Math.sin(angle) * speed
                };
            }));

            // Check projectile-enemy collisions
            setProjectiles(prevProj => {
                const remaining = [...prevProj];
                setEnemies(prevEnem => {
                    const updated = [...prevEnem];

                    for (let i = remaining.length - 1; i >= 0; i--) {
                        for (let j = updated.length - 1; j >= 0; j--) {
                            const dist = Math.hypot(remaining[i].x - updated[j].x, remaining[i].y - updated[j].y);
                            if (dist < ENEMY_SIZE) {
                                updated.splice(j, 1);
                                remaining.splice(i, 1);
                                setScore(s => s + 10);
                                SoundManager.playPoint();

                                // Drop orb
                                if (Math.random() < 0.3) {
                                    setOrbs(prev => [...prev, { x: updated[j]?.x || 0, y: updated[j]?.y || 0 }]);
                                }
                                break;
                            }
                        }
                    }

                    return updated;
                });
                return remaining;
            });

            // Collect orbs
            setOrbs(prev => prev.filter(orb => {
                const dist = Math.hypot(player.x - orb.x, player.y - orb.y);
                if (dist < PLAYER_SIZE) {
                    setScore(s => s + 5);
                    SoundManager.playPoint();
                    return false;
                }
                return true;
            }));

            // Enemy-player collision
            for (let enemy of enemies) {
                const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                if (dist < PLAYER_SIZE / 2 + ENEMY_SIZE / 2) {
                    setGameOver(true);
                    setGameStarted(false);
                    SoundManager.playLose();
                    if (score > 0) addPoints(Math.floor(score / 10));
                    if (timeLeft < 60) incrementStreak();
                    else resetStreak();
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('vampireHighScore', score.toString());
                    }
                    return;
                }
            }
        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [gameStarted, gameOver, showIntro, isPaused, keys, player, enemies, level, timeLeft, score, highScore, addPoints, incrementStreak, resetStreak]);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver || showIntro || isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameStarted(false);
                    setGameOver(true);
                    SoundManager.playWin();
                    addPoints(100);
                    incrementStreak();
                    setShowWinnerModal(true);
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('vampireHighScore', score.toString());
                    }
                    return 0;
                }

                if (prev % 30 === 0) setLevel(l => l + 1);

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, gameOver, showIntro, isPaused, score, highScore, addPoints, incrementStreak]);

    if (showIntro) {
        return <GameIntro gameId="vampire" onComplete={() => setShowIntro(false)} />;
    }

    const headerContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                <ArrowLeft size={20} /> Back
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--accent)' }}>{score}</div>
                </div>
                <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn btn-secondary" style={{ padding: 'var(--space-sm)' }}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    );

    const footerContent = (
        !gameStarted && !gameOver ? (
            <button onClick={resetGame} className="btn btn-primary" style={{ width: '100%', maxWidth: '200px' }}>
                Start Game
            </button>
        ) : gameStarted && !gameOver ? (
            <button
                onClick={() => { setIsPaused(!isPaused); SoundManager.playClick(); }}
                className="btn"
                style={{ width: '100%', maxWidth: '200px' }}
                disabled={gameOver}
            >
                {isPaused ? <><Play size={20} style={{ marginRight: 'var(--space-xs)' }} /> Start</> : <><Pause size={20} style={{ marginRight: 'var(--space-xs)' }} /> Pause</>}
            </button>
        ) : null
    );

    return (
        <GameContainer header={headerContent} footer={footerContent}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Vampire Survivors"
                instructions={[
                    "Use ARROW KEYS or WASD to move.",
                    "Your character auto-attacks nearby enemies.",
                    "Survive for 3 minutes to win!",
                    "Collect green orbs for extra points.",
                    "Enemies spawn faster as time goes on!"
                ]}
            />

            <WinnerModal
                isOpen={showWinnerModal}
                onClose={() => setShowWinnerModal(false)}
                winner="You"
                pointsEarned={100}
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
                <div style={{
                    width: `${GAME_WIDTH}px`,
                    height: `${GAME_HEIGHT}px`,
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    border: '2px solid var(--border-subtle)',
                    borderRadius: 'var(--radius)',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    {/* Player */}
                    <div style={{
                        position: 'absolute',
                        left: player.x - PLAYER_SIZE / 2,
                        top: player.y - PLAYER_SIZE / 2,
                        width: PLAYER_SIZE,
                        height: PLAYER_SIZE,
                        background: '#3b82f6',
                        borderRadius: '50%',
                        border: '2px solid #60a5fa',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
                    }} />

                    {/* Projectiles */}
                    {projectiles.map((proj, i) => (
                        <div key={`proj-${i}`} style={{
                            position: 'absolute',
                            left: proj.x - 3,
                            top: proj.y - 3,
                            width: 6,
                            height: 6,
                            background: '#facc15',
                            borderRadius: '50%',
                            boxShadow: '0 0 5px #facc15'
                        }} />
                    ))}

                    {/* Enemies */}
                    {enemies.map((enemy, i) => (
                        <div key={`enemy-${i}`} style={{
                            position: 'absolute',
                            left: enemy.x - ENEMY_SIZE / 2,
                            top: enemy.y - ENEMY_SIZE / 2,
                            width: ENEMY_SIZE,
                            height: ENEMY_SIZE,
                            background: '#ef4444',
                            borderRadius: '50%',
                            border: '2px solid #dc2626'
                        }} />
                    ))}

                    {/* Orbs */}
                    {orbs.map((orb, i) => (
                        <div key={`orb-${i}`} style={{
                            position: 'absolute',
                            left: orb.x - ORB_SIZE / 2,
                            top: orb.y - ORB_SIZE / 2,
                            width: ORB_SIZE,
                            height: ORB_SIZE,
                            background: '#22c55e',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px #22c55e'
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
                            <h3 style={{
                                fontSize: 'var(--text-2xl)',
                                color: timeLeft === 0 ? 'var(--success)' : 'var(--danger)',
                                marginBottom: 'var(--space-md)'
                            }}>
                                {timeLeft === 0 ? 'You Survived!' : 'Game Over'}
                            </h3>
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

export default VampireSurvivors;
