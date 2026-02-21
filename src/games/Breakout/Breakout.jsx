import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import WinnerModal from '../../components/WinnerModal';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 12;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = GAME_WIDTH / BRICK_COLS - 4;
const BRICK_HEIGHT = 20;
const PADDLE_Y = GAME_HEIGHT - PADDLE_HEIGHT - 10;

const Breakout = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, dx: 3, dy: -3 });
    const [bricks, setBricks] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('breakoutHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);

    const initBricks = () => {
        const newBricks = [];
        for (let row = 0; row < BRICK_ROWS; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
                newBricks.push({
                    x: col * (BRICK_WIDTH + 4) + 2,
                    y: row * (BRICK_HEIGHT + 4) + 40,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    destroyed: false,
                    color: `hsl(${row * 60}, 70%, 50%)`
                });
            }
        }
        return newBricks;
    };

    const resetGame = () => {
        setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
        setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, dx: 3, dy: -3 });
        setBricks(initBricks());
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
        setShowWinnerModal(false);
        setIsPaused(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        setBricks(initBricks());
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!gameStarted || gameOver || isPaused) return;

            if (e.key === 'ArrowLeft') {
                setPaddleX(prev => Math.max(0, prev - 20));
            } else if (e.key === 'ArrowRight') {
                setPaddleX(prev => Math.min(GAME_WIDTH - PADDLE_WIDTH, prev + 20));
            }
        };

        const handleMouseMove = (e) => {
            if (!gameStarted || gameOver || isPaused) return;
            const rect = e.currentTarget.getBoundingClientRect?.();
            if (rect) {
                const x = e.clientX - rect.left;
                setPaddleX(Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
            }
        };

        const handleTouchMove = (e) => {
            if (!gameStarted || gameOver || isPaused) return;
            const rect = e.currentTarget.getBoundingClientRect?.();
            if (rect && e.touches[0]) {
                const x = e.touches[0].clientX - rect.left;
                setPaddleX(Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStarted, gameOver, isPaused]);

    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;

        const gameLoop = setInterval(() => {
            setBall(prev => {
                let newX = prev.x + prev.dx;
                let newY = prev.y + prev.dy;
                let newDx = prev.dx;
                let newDy = prev.dy;

                // Wall collision
                if (newX <= 0 || newX >= GAME_WIDTH - BALL_SIZE) {
                    newDx = -newDx;
                    newX = newX <= 0 ? 0 : GAME_WIDTH - BALL_SIZE;
                }
                if (newY <= 0) {
                    newDy = -newDy;
                    newY = 0;
                }

                // Paddle collision
                if (
                    newY + BALL_SIZE >= PADDLE_Y &&
                    newX + BALL_SIZE >= paddleX &&
                    newX <= paddleX + PADDLE_WIDTH
                ) {
                    newDy = -Math.abs(newDy);
                    const hitPos = (newX - paddleX) / PADDLE_WIDTH;
                    newDx = (hitPos - 0.5) * 8;
                    SoundManager.playClick();
                }

                // Bottom wall - game over
                if (newY >= GAME_HEIGHT) {
                    setGameOver(true);
                    setGameStarted(false);
                    SoundManager.playLose();
                    if (score > 0) {
                        addPoints(Math.floor(score / 10));
                        resetStreak();
                    }
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('breakoutHighScore', score.toString());
                    }
                    return prev;
                }

                return { x: newX, y: newY, dx: newDx, dy: newDy };
            });

            // Brick collision
            setBricks(prev => {
                let hit = false;
                const updated = prev.map(brick => {
                    if (brick.destroyed) return brick;

                    if (
                        ball.x + BALL_SIZE >= brick.x &&
                        ball.x <= brick.x + brick.width &&
                        ball.y + BALL_SIZE >= brick.y &&
                        ball.y <= brick.y + brick.height
                    ) {
                        hit = true;
                        setScore(s => s + 10);
                        SoundManager.playPoint();
                        setBall(b => ({ ...b, dy: -b.dy }));
                        return { ...brick, destroyed: true };
                    }
                    return brick;
                });

                const remaining = updated.filter(b => !b.destroyed).length;
                if (remaining === 0) {
                    setGameStarted(false);
                    SoundManager.playWin();
                    addPoints(50);
                    incrementStreak();
                    setShowWinnerModal(true);
                }

                return updated;
            });
        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [gameStarted, gameOver, isPaused, ball, paddleX, score, highScore, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="breakout" onComplete={() => setShowIntro(false)} />;
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
            onClick={() => {
                if (!gameStarted && !gameOver) {
                    resetGame(); // Start game if not started
                } else {
                    setIsPaused(!isPaused); // Toggle pause if game is running
                }
                SoundManager.playClick();
            }}
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '200px' }}
            disabled={gameOver && !bricks.every(b => b.destroyed)} // Disable if game over and not a win
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
                title="Breakout"
                instructions={[
                    "Use your mouse or touch to move the paddle.",
                    "Bounce the ball to break all the bricks.",
                    "Don't let the ball fall off the bottom!",
                    "Different colored bricks give different points.",
                    "Clear all bricks to win!"
                ]}
            />

            <WinnerModal
                isOpen={showWinnerModal}
                onClose={() => setShowWinnerModal(false)}
                winner="You"
                pointsEarned={50}
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
                    onMouseMove={(e) => {
                        if (!gameStarted || gameOver || isPaused) return;
                        const rect = e.currentTarget.getBoundingClientRect?.();
                        if (rect) {
                            const x = e.clientX - rect.left;
                            setPaddleX(Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
                        }
                    }}
                    onTouchMove={(e) => {
                        if (!gameStarted || gameOver || isPaused) return;
                        const rect = e.currentTarget.getBoundingClientRect?.();
                        if (rect && e.touches[0]) {
                            const x = e.touches[0].clientX - rect.left;
                            setPaddleX(Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)));
                        }
                    }}
                    style={{
                        width: `${GAME_WIDTH}px`,
                        height: `${GAME_HEIGHT}px`,
                        background: 'linear-gradient(to bottom, #1e293b 0%, #0f172a 100%)',
                        border: '2px solid var(--border-subtle)',
                        borderRadius: 'var(--radius)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'none',
                        transformOrigin: 'center center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Bricks */}
                    {bricks.map((brick, i) => (
                        !brick.destroyed && (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: `${brick.x}px`,
                                    top: `${brick.y}px`,
                                    width: `${BRICK_WIDTH - 4}px`,
                                    height: `${BRICK_HEIGHT - 4}px`,
                                    background: brick.color,
                                    borderRadius: '4px',
                                    boxShadow: `0 0 10px ${brick.color}80`
                                }}
                            />
                        )
                    ))}

                    {/* Paddle */}
                    <div style={{
                        position: 'absolute',
                        left: `${paddleX}px`,
                        top: `${PADDLE_Y}px`,
                        width: `${PADDLE_WIDTH}px`,
                        height: `${PADDLE_HEIGHT}px`,
                        background: '#3b82f6',
                        borderRadius: '10px',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
                    }} />

                    {/* Ball */}
                    <div style={{
                        position: 'absolute',
                        left: `${ball.x}px`,
                        top: `${ball.y}px`,
                        width: `${BALL_SIZE}px`,
                        height: `${BALL_SIZE}px`,
                        background: '#ffffff',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                    }} />

                    {/* Pause Overlay */}
                    {isPaused && gameStarted && !gameOver && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            cursor: 'default',
                            color: 'white',
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'bold'
                        }}>
                            PAUSED
                        </div>
                    )}

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
                            backdropFilter: 'blur(4px)',
                            cursor: 'default'
                        }}>
                            <h3 style={{ fontSize: 'var(--text-2xl)', color: bricks.every(b => b.destroyed) ? 'var(--success)' : 'var(--danger)', marginBottom: 'var(--space-md)' }}>
                                {bricks.every(b => b.destroyed) ? 'You Win!' : 'Game Over'}
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

export default Breakout;
