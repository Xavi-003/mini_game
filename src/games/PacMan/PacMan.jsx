import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import WinnerModal from '../../components/WinnerModal';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';
import GameContainer from '../../components/GameContainer';
import useGameScale from '../../hooks/useGameScale';

const GRID_SIZE = 15;
const CELL_SIZE = 25;

const PacMan = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [pacman, setPacman] = useState({ x: 7, y: 11 });
    const [ghosts, setGhosts] = useState([
        { x: 7, y: 5, color: '#ef4444' },
        { x: 6, y: 6, color: '#3b82f6' },
        { x: 8, y: 6, color: '#f97316' },
        { x: 7, y: 6, color: '#ec4899' }
    ]);
    const [dots, setDots] = useState([]);
    const [walls, setWalls] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('pacmanHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    const initMaze = () => {
        const newWalls = [];
        const newDots = [];

        // Simple maze pattern
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                // Border walls
                if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) {
                    newWalls.push({ x, y });
                }
                // Inner walls
                else if ((x === 3 || x === 11) && y > 3 && y < 11) {
                    newWalls.push({ x, y });
                }
                else if ((y === 3 || y === 11) && x > 3 && x < 11) {
                    newWalls.push({ x, y });
                }
                // Dots
                else {
                    newDots.push({ x, y, eaten: false });
                }
            }
        }

        return { walls: newWalls, dots: newDots };
    };

    const resetGame = () => {
        const { walls: newWalls, dots: newDots } = initMaze();
        setPacman({ x: 7, y: 11 });
        setGhosts([
            { x: 7, y: 5, color: '#ef4444' },
            { x: 6, y: 6, color: '#3b82f6' },
            { x: 8, y: 6, color: '#f97316' },
            { x: 7, y: 6, color: '#ec4899' }
        ]);
        setDots(newDots);
        setWalls(newWalls);
        setScore(0);
        setGameOver(false);
        setShowWinnerModal(false);
        setDirection({ x: 0, y: 0 });
        setIsPaused(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        const { walls: newWalls, dots: newDots } = initMaze();
        setWalls(newWalls);
        setDots(newDots);
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (gameOver || showIntro || isPaused) return;

            switch (e.key) {
                case 'ArrowUp': setDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': setDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': setDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': setDirection({ x: 1, y: 0 }); break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameOver, showIntro, isPaused]);

    useEffect(() => {
        if (gameOver || showIntro || isPaused) return;

        const interval = setInterval(() => {
            setPacman(prev => {
                const newX = prev.x + direction.x;
                const newY = prev.y + direction.y;

                // Check wall collision
                if (walls.some(w => w.x === newX && w.y === newY)) {
                    return prev;
                }

                // Update if valid
                if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
                    // Check dot collection
                    const dotIndex = dots.findIndex(d => !d.eaten && d.x === newX && d.y === newY);
                    if (dotIndex !== -1) {
                        setDots(prevDots => {
                            const updated = [...prevDots];
                            updated[dotIndex] = { ...updated[dotIndex], eaten: true };
                            return updated;
                        });
                        setScore(s => s + 10);
                        SoundManager.playPoint();

                        // Check win
                        if (dots.filter(d => !d.eaten).length === 1) {
                            setGameOver(true);
                            SoundManager.playWin();
                            addPoints(50);
                            incrementStreak();
                            setShowWinnerModal(true);
                            if (score > highScore) {
                                setHighScore(score);
                                localStorage.setItem('pacmanHighScore', score.toString());
                            }
                        }
                    }

                    return { x: newX, y: newY };
                }
                return prev;
            });

            // Move ghosts
            setGhosts(prev => prev.map(ghost => {
                const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
                const validMoves = directions.filter(dir => {
                    const newX = ghost.x + dir.x;
                    const newY = ghost.y + dir.y;
                    return !walls.some(w => w.x === newX && w.y === newY) &&
                        newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE;
                });

                if (validMoves.length > 0) {
                    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                    return { ...ghost, x: ghost.x + move.x, y: ghost.y + move.y };
                }
                return ghost;
            }));
        }, 200);

        return () => clearInterval(interval);
    }, [gameOver, showIntro, isPaused, direction, walls, dots, score, highScore, addPoints, incrementStreak]);

    // Check ghost collision
    useEffect(() => {
        if (gameOver || showIntro || isPaused) return;

        if (ghosts.some(g => g.x === pacman.x && g.y === pacman.y)) {
            setGameOver(true);
            SoundManager.playLose();
            if (score > 0) addPoints(Math.floor(score / 10));
            resetStreak();
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('pacmanHighScore', score.toString());
            }
        }
    }, [pacman, ghosts, gameOver, showIntro, isPaused, score, highScore, addPoints, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="pacman" onComplete={() => setShowIntro(false)} />;
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
                title="Pac-Man"
                instructions={[
                    "Use ARROW KEYS to move Pac-Man.",
                    "Collect all the dots to win!",
                    "Avoid the ghosts - they'll end your game.",
                    "Each dot is worth 10 points.",
                    "Navigate through the maze carefully!"
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
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gap: '1px',
                    padding: '1px',
                    background: '#000',
                    borderRadius: 'var(--radius)',
                    border: '3px solid #2563eb',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    aspectRatio: '1/1'
                }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isWall = walls.some(w => w.x === x && w.y === y);
                        const isPacman = pacman.x === x && pacman.y === y;
                        const ghost = ghosts.find(g => g.x === x && g.y === y);
                        const dot = dots.find(d => !d.eaten && d.x === x && d.y === y);

                        return (
                            <div
                                key={i}
                                style={{
                                    width: `${CELL_SIZE}px`,
                                    height: `${CELL_SIZE}px`,
                                    background: isWall ? '#2563eb' : '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: isPacman || ghost ? '18px' : '8px'
                                }}
                            >
                                {isPacman && '🟡'}
                                {ghost && <div style={{ width: '20px', height: '20px', background: ghost.color, borderRadius: '50% 50% 0 0' }} />}
                                {dot && <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }} />}
                            </div>
                        );
                    })}

                    {gameOver && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: showWinnerModal ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                            border: `2px solid ${showWinnerModal ? 'var(--success)' : 'var(--danger)'}`,
                            borderRadius: 'var(--radius)',
                            padding: 'var(--space-lg)',
                            textAlign: 'center',
                            zIndex: 20,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <h3 style={{ color: '#fff', marginBottom: 'var(--space-sm)' }}>
                                {showWinnerModal ? 'You Win!' : 'Game Over!'}
                            </h3>
                            <p style={{ marginBottom: 'var(--space-md)', color: '#fff' }}>Score: {score}</p>
                            <button onClick={resetGame} className="btn btn-primary" style={{ background: '#fff', color: '#000' }}>
                                <RefreshCw size={20} style={{ marginRight: 'var(--space-xs)' }} /> Play Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </GameContainer>
    );
};

export default PacMan;
