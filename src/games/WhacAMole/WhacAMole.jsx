import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const GRID_SIZE = 3;
const GAME_DURATION = 60; // seconds
const MOLE_APPEAR_INTERVAL = 800;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;

const WhacAMole = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [moles, setMoles] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('whacHighScore')) || 0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);

    const resetGame = () => {
        setMoles(Array(GRID_SIZE * GRID_SIZE).fill(false));
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setGameStarted(true);
        setGameOver(false);
        setIsPaused(false);
        SoundManager.playClick();
    };

    const whackMole = (index) => {
        if (!gameStarted || gameOver || isPaused || !moles[index]) return;

        const newMoles = [...moles];
        newMoles[index] = false;
        setMoles(newMoles);
        setScore(prev => prev + 1);
        SoundManager.playPoint();
    };

    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;

        const moleInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
            setMoles(prev => {
                const newMoles = [...prev];
                newMoles[randomIndex] = true;

                setTimeout(() => {
                    setMoles(current => {
                        const updated = [...current];
                        updated[randomIndex] = false;
                        return updated;
                    });
                }, 1500);

                return newMoles;
            });
        }, MOLE_APPEAR_INTERVAL);

        return () => clearInterval(moleInterval);
    }, [gameStarted, gameOver, isPaused]);

    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;

        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameStarted(false);
                    setGameOver(true);
                    SoundManager.playWin();
                    addPoints(score);
                    if (score >= 20) incrementStreak();
                    else if (score > 0) resetStreak();

                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('whacHighScore', score.toString());
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [gameStarted, gameOver, isPaused, score, highScore, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="whac" onComplete={() => setShowIntro(false)} />;
    }

    const headerContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                <ArrowLeft size={20} /> Back
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Time: {timeLeft}s</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--accent)' }}>Score: {score}</div>
                </div>
                <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn btn-secondary" style={{ padding: 'var(--space-sm)' }}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    );

    const footerContent = (
        <button
            onClick={() => {
                if (!gameStarted && !gameOver) {
                    resetGame();
                } else {
                    setIsPaused(!isPaused);
                }
                SoundManager.playClick();
            }}
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '200px' }}
            disabled={gameOver}
        >
            {!gameStarted && !gameOver ? (
                <>Start Game</>
            ) : isPaused ? (
                <><Play size={20} style={{ marginRight: 'var(--space-xs)' }} /> Resume</>
            ) : (
                <><Pause size={20} style={{ marginRight: 'var(--space-xs)' }} /> Pause</>
            )}
        </button>
    );

    return (
        <GameContainer header={headerContent} footer={footerContent}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Whac-A-Mole"
                instructions={[
                    "Click on the moles when they pop up!",
                    "You have 60 seconds to whack as many as you can.",
                    "Moles disappear after a short time.",
                    "Each successful whack earns 1 point.",
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
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gap: 'var(--space-md)',
                    width: `${GAME_WIDTH}px`,
                    height: `${GAME_WIDTH}px`, // Square grid
                    maxWidth: '100%',
                    aspectRatio: '1',
                    transformOrigin: 'center center'
                }}>
                    {moles.map((isMoleUp, index) => (
                        <button
                            key={index}
                            onClick={() => whackMole(index)}
                            disabled={!gameStarted || gameOver || isPaused}
                            style={{
                                aspectRatio: '1',
                                background: isMoleUp ?
                                    'linear-gradient(145deg, #a855f7, #9333ea)' :
                                    'var(--bg-elevated)',
                                border: isMoleUp ? '3px solid #c084fc' : '2px solid var(--border-subtle)',
                                borderRadius: 'var(--radius)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                cursor: isMoleUp && gameStarted && !isPaused ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                transform: isMoleUp ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isMoleUp ? '0 0 20px rgba(168, 85, 247, 0.5)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (isMoleUp && gameStarted && !isPaused) {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = isMoleUp ? 'scale(1.05)' : 'scale(1)';
                            }}
                        >
                            {isMoleUp && '🐹'}
                        </button>
                    ))}

                    {gameOver && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'var(--success-light)',
                            border: '1px solid var(--success)',
                            borderRadius: 'var(--radius)',
                            padding: 'var(--space-lg)',
                            textAlign: 'center',
                            zIndex: 20,
                            width: '80%',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ color: 'var(--success)', marginBottom: 'var(--space-sm)' }}>Time's Up!</h3>
                            <p style={{ marginBottom: 'var(--space-sm)' }}>Final Score: {score}</p>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                                High Score: {highScore}
                            </p>
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

export default WhacAMole;
