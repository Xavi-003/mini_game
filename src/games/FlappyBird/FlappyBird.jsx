import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import useGameScale from '../../hooks/useGameScale';
import SoundManager from '../../utils/SoundManager';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_SPEED = 3;

const FlappyBird = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipes, setPipes] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('flappyHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, GAME_WIDTH, GAME_HEIGHT);

    const flap = useCallback(() => {
        if (!gameOver && !isPaused && !showIntro) {
            setBirdVelocity(FLAP_STRENGTH);
            SoundManager.playClick();
        }
    }, [gameOver, isPaused, showIntro]);

    const resetGame = () => {
        setBirdY(GAME_HEIGHT / 2);
        setBirdVelocity(0);
        setPipes([]);
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                flap();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [flap]);

    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        const gameLoop = setInterval(() => {
            setBirdVelocity(prev => prev + GRAVITY);
            setBirdY(prev => {
                const newY = prev + birdVelocity;
                if (newY < 0 || newY > GAME_HEIGHT - BIRD_SIZE) {
                    setGameOver(true);
                    SoundManager.playLose();
                    if (score > 0) {
                        addPoints(score);
                        if (score >= 5) incrementStreak();
                        else resetStreak();
                    }
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('flappyHighScore', score.toString());
                    }
                    return prev;
                }
                return newY;
            });

            setPipes(prev => {
                let updated = prev.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));

                if (updated.length === 0 || updated[updated.length - 1].x < GAME_WIDTH - 200) {
                    const gapY = 100 + Math.random() * (GAME_HEIGHT - 300);
                    updated.push({ x: GAME_WIDTH, gapY, passed: false });
                }

                updated = updated.filter(pipe => pipe.x > -PIPE_WIDTH);

                updated.forEach(pipe => {
                    if (!pipe.passed && pipe.x + PIPE_WIDTH < GAME_WIDTH / 2 - BIRD_SIZE / 2) {
                        pipe.passed = true;
                        setScore(s => s + 1);
                        SoundManager.playPoint();
                    }
                });

                return updated;
            });
        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [gameOver, isPaused, showIntro, birdVelocity, score, highScore, addPoints, incrementStreak, resetStreak]);

    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        const birdX = GAME_WIDTH / 2 - BIRD_SIZE / 2;
        for (let pipe of pipes) {
            if (
                birdX + BIRD_SIZE > pipe.x &&
                birdX < pipe.x + PIPE_WIDTH &&
                (birdY < pipe.gapY || birdY + BIRD_SIZE > pipe.gapY + PIPE_GAP)
            ) {
                setGameOver(true);
                SoundManager.playLose();
                if (score > 0) {
                    addPoints(score);
                    if (score >= 5) incrementStreak();
                    else resetStreak();
                }
                if (score > highScore) {
                    setHighScore(score);
                    localStorage.setItem('flappyHighScore', score.toString());
                }
                break;
            }
        }
    }, [pipes, birdY, gameOver, isPaused, showIntro, score, highScore, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="flappy" onComplete={() => setShowIntro(false)} />;
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
            className="btn"
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
                title="Flappy Bird"
                instructions={[
                    "Click or press SPACE to flap your wings.",
                    "Navigate through the gaps in the pipes.",
                    "Don't hit the pipes or the ground/ceiling!",
                    "Each pipe you pass earns 1 point.",
                    "Try to beat your high score!"
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
                    onClick={flap}
                    style={{
                        width: `${GAME_WIDTH}px`,
                        height: `${GAME_HEIGHT}px`,
                        background: 'linear-gradient(to bottom, #3b82f6 0%, #1e40af 100%)',
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
                    {/* Bird */}
                    <div style={{
                        position: 'absolute',
                        left: `${GAME_WIDTH / 2 - BIRD_SIZE / 2}px`,
                        top: `${birdY}px`,
                        width: `${BIRD_SIZE}px`,
                        height: `${BIRD_SIZE}px`,
                        background: '#facc15',
                        borderRadius: '50%',
                        boxShadow: '0 0 15px rgba(250, 204, 21, 0.6)',
                        border: '3px solid #fbbf24'
                    }} />

                    {/* Pipes */}
                    {pipes.map((pipe, i) => (
                        <React.Fragment key={i}>
                            <div style={{
                                position: 'absolute',
                                left: `${pipe.x}px`,
                                top: 0,
                                width: `${PIPE_WIDTH}px`,
                                height: `${pipe.gapY}px`,
                                background: '#22c55e',
                                border: '2px solid #16a34a'
                            }} />
                            <div style={{
                                position: 'absolute',
                                left: `${pipe.x}px`,
                                top: `${pipe.gapY + PIPE_GAP}px`,
                                width: `${PIPE_WIDTH}px`,
                                height: `${GAME_HEIGHT - pipe.gapY - PIPE_GAP}px`,
                                background: '#22c55e',
                                border: '2px solid #16a34a'
                            }} />
                        </React.Fragment>
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

export default FlappyBird;
