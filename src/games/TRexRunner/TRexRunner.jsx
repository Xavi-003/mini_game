import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import useGameScale from '../../hooks/useGameScale';
import SoundManager from '../../utils/SoundManager';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 200;
const GROUND_HEIGHT = 20;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 50;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_HEIGHT = 40;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const GAME_SPEED_START = 5;
const SPEED_INCREMENT = 0.1;

const TRexRunner = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [dinoY, setDinoY] = useState(GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT);
    const [dinoVelocity, setDinoVelocity] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [obstacles, setObstacles] = useState([]);
    const [gameSpeed, setGameSpeed] = useState(GAME_SPEED_START);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('trexHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, GAME_WIDTH, GAME_HEIGHT);
    const gameLoopRef = useRef(null);

    const jump = useCallback(() => {
        if (!isJumping && !gameOver && !isPaused && !showIntro) {
            setDinoVelocity(JUMP_STRENGTH);
            setIsJumping(true);
            SoundManager.playClick();
        }
    }, [isJumping, gameOver, isPaused, showIntro]);

    const resetGame = () => {
        setDinoY(GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT);
        setDinoVelocity(0);
        setIsJumping(false);
        setObstacles([]);
        setGameSpeed(GAME_SPEED_START);
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
        SoundManager.playClick();
    };

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [jump]);

    // Game loop
    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        gameLoopRef.current = setInterval(() => {
            // Update dino physics
            setDinoVelocity(prev => prev + GRAVITY);
            setDinoY(prev => {
                const newY = prev + dinoVelocity;
                const groundY = GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT;

                if (newY >= groundY) {
                    setIsJumping(false);
                    setDinoVelocity(0);
                    return groundY;
                }
                return newY;
            });

            // Update obstacles
            setObstacles(prev => {
                const updated = prev
                    .map(obs => ({ ...obs, x: obs.x - gameSpeed }))
                    .filter(obs => obs.x > -OBSTACLE_WIDTH);

                // Add new obstacle
                if (updated.length === 0 || updated[updated.length - 1].x < GAME_WIDTH - 300) {
                    const randomGap = 200 + Math.random() * 200;
                    if (updated.length === 0 || GAME_WIDTH - updated[updated.length - 1].x > randomGap) {
                        updated.push({
                            x: GAME_WIDTH,
                            y: GAME_HEIGHT - GROUND_HEIGHT - OBSTACLE_HEIGHT,
                            width: OBSTACLE_WIDTH,
                            height: OBSTACLE_HEIGHT
                        });
                    }
                }

                return updated;
            });

            // Update score and speed
            setScore(prev => {
                const newScore = prev + 1;
                if (newScore > highScore) {
                    setHighScore(newScore);
                    localStorage.setItem('trexHighScore', newScore.toString());
                }
                return newScore;
            });
            setGameSpeed(prev => prev + SPEED_INCREMENT / 100);

        }, 1000 / 60); // 60 FPS

        return () => clearInterval(gameLoopRef.current);
    }, [gameOver, isPaused, showIntro, dinoVelocity, gameSpeed, highScore]);

    // Collision detection
    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        const dinoBox = {
            x: 50,
            y: dinoY,
            width: DINO_WIDTH,
            height: DINO_HEIGHT
        };

        for (let obstacle of obstacles) {
            if (
                dinoBox.x < obstacle.x + obstacle.width &&
                dinoBox.x + dinoBox.width > obstacle.x &&
                dinoBox.y < obstacle.y + obstacle.height &&
                dinoBox.y + dinoBox.height > obstacle.y
            ) {
                setGameOver(true);
                SoundManager.playLose();

                // Award points based on score
                const pointsEarned = Math.floor(score / 100);
                if (pointsEarned > 0) {
                    addPoints(pointsEarned);
                    if (score > 500) incrementStreak();
                } else {
                    resetStreak();
                }
                break;
            }
        }
    }, [obstacles, dinoY, gameOver, isPaused, showIntro, score, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="trex" onComplete={() => setShowIntro(false)} />;
    }

    const headerContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                <ArrowLeft size={20} /> Back
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>HI: {highScore}</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--accent)' }}>{score}</div>
                </div>
                <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn btn-secondary" style={{ padding: 'var(--space-sm)' }}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    );

    const footerContent = (
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', width: '100%' }}>
            <button
                onClick={() => { setIsPaused(!isPaused); SoundManager.playClick(); }}
                className="btn"
                style={{ flex: 1, maxWidth: '200px' }}
                disabled={gameOver}
            >
                {isPaused ? <><Play size={20} style={{ marginRight: 'var(--space-xs)' }} /> Start</> : <><Pause size={20} style={{ marginRight: 'var(--space-xs)' }} /> Pause</>}
            </button>
        </div>
    );

    return (
        <GameContainer header={headerContent} footer={footerContent}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="T-Rex Runner"
                instructions={[
                    "Press SPACE or ARROW UP to jump over obstacles.",
                    "The game gets faster as you progress.",
                    "Your score increases continuously while playing.",
                    "Try to beat your high score!",
                    "Avoid hitting the cacti!"
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
                {/* Game Canvas */}
                <div
                    onClick={jump}
                    style={{
                        width: `${GAME_WIDTH}px`,
                        height: `${GAME_HEIGHT}px`,
                        background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                        border: '2px solid var(--border-subtle)',
                        borderRadius: 'var(--radius)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Ground */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${GROUND_HEIGHT}px`,
                        background: 'var(--accent)',
                        opacity: 0.3
                    }} />

                    {/* Dino */}
                    <div style={{
                        position: 'absolute',
                        left: '50px',
                        bottom: `${GAME_HEIGHT - dinoY - DINO_HEIGHT}px`,
                        width: `${DINO_WIDTH}px`,
                        height: `${DINO_HEIGHT}px`,
                        background: 'var(--success)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                        transition: 'none'
                    }} />

                    {/* Obstacles */}
                    {obstacles.map((obs, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${obs.x}px`,
                            bottom: `${GAME_HEIGHT - obs.y - obs.height}px`,
                            width: `${obs.width}px`,
                            height: `${obs.height}px`,
                            background: 'var(--danger)',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                        }} />
                    ))}

                    {/* Game Over Overlay */}
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
                            <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--danger)', marginBottom: 'var(--space-md)' }}>Game Over</h3>
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

export default TRexRunner;
