import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const GRID_SIZE = 30;
const CELL_SIZE = 15;

const Tron = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [player, setPlayer] = useState({ x: 10, y: 15, direction: { x: 1, y: 0 }, trail: [] });
    const [ai, setAi] = useState({ x: 20, y: 15, direction: { x: -1, y: 0 }, trail: [] });
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('tronHighScore')) || 0);

    const resetGame = () => {
        setPlayer({ x: 10, y: 15, direction: { x: 1, y: 0 }, trail: [] });
        setAi({ x: 20, y: 15, direction: { x: -1, y: 0 }, trail: [] });
        setGameOver(false);
        setWinner(null);
        setIsPaused(false);
        setScore(0);
        SoundManager.playClick();
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (gameOver || isPaused || showIntro) return;

            setPlayer(prev => {
                let newDir = prev.direction;
                switch (e.key) {
                    case 'ArrowUp': if (prev.direction.y !== 1) newDir = { x: 0, y: -1 }; break;
                    case 'ArrowDown': if (prev.direction.y !== -1) newDir = { x: 0, y: 1 }; break;
                    case 'ArrowLeft': if (prev.direction.x !== 1) newDir = { x: -1, y: 0 }; break;
                    case 'ArrowRight': if (prev.direction.x !== -1) newDir = { x: 1, y: 0 }; break;
                    default: return prev;
                }
                SoundManager.playClick();
                return { ...prev, direction: newDir };
            });
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameOver, isPaused, showIntro]);

    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        const interval = setInterval(() => {
            setPlayer(prev => {
                const newX = prev.x + prev.direction.x;
                const newY = prev.y + prev.direction.y;
                const newTrail = [...prev.trail, { x: prev.x, y: prev.y }];

                // Check collision
                if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE ||
                    prev.trail.some(t => t.x === newX && t.y === newY) ||
                    ai.trail.some(t => t.x === newX && t.y === newY) ||
                    (ai.x === newX && ai.y === newY)) {
                    setGameOver(true);
                    setWinner('AI');
                    SoundManager.playLose();
                    resetStreak();
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('tronHighScore', score.toString());
                    }
                    return prev;
                }

                setScore(s => s + 1);
                return { ...prev, x: newX, y: newY, trail: newTrail };
            });

            setAi(prev => {
                // Simple AI: try to move away from edges and trails
                const possibleMoves = [
                    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
                ].filter(dir =>
                    !(prev.direction.x === -dir.x && prev.direction.y === -dir.y) // Don't reverse
                );

                const safeMoves = possibleMoves.filter(dir => {
                    const newX = prev.x + dir.x;
                    const newY = prev.y + dir.y;
                    return newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE &&
                        !prev.trail.some(t => t.x === newX && t.y === newY) &&
                        !player.trail.some(t => t.x === newX && t.y === newY);
                });

                const chosenDir = safeMoves.length > 0 ?
                    safeMoves[Math.floor(Math.random() * safeMoves.length)] : prev.direction;

                const newX = prev.x + chosenDir.x;
                const newY = prev.y + chosenDir.y;
                const newTrail = [...prev.trail, { x: prev.x, y: prev.y }];

                // Check AI collision
                if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE ||
                    prev.trail.some(t => t.x === newX && t.y === newY) ||
                    player.trail.some(t => t.x === newX && t.y === newY) ||
                    (player.x === newX && player.y === newY)) {
                    setGameOver(true);
                    setWinner('You');
                    SoundManager.playWin();
                    addPoints(30);
                    if (score > 50) incrementStreak();
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('tronHighScore', score.toString());
                    }
                    return prev;
                }

                return { ...prev, x: newX, y: newY, direction: chosenDir, trail: newTrail };
            });
        }, 100);

        return () => clearInterval(interval);
    }, [gameOver, isPaused, showIntro, player.trail, ai.trail, score, highScore, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="tron" onComplete={() => setShowIntro(false)} />;
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
                title="Tron"
                instructions={[
                    "Use ARROW KEYS to change direction.",
                    "You leave a trail behind you.",
                    "Don't hit any trails (yours or the AI's) or walls!",
                    "Force your opponent to crash first to win.",
                    "Last one riding wins!"
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
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    width: `${GRID_SIZE * CELL_SIZE}px`,
                    height: `${GRID_SIZE * CELL_SIZE}px`,
                    background: '#000',
                    border: '2px solid var(--border-subtle)',
                    borderRadius: 'var(--radius)',
                    transformOrigin: 'center center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    position: 'relative' // Added for absolute positioning of game over overlay
                }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isPlayer = player.x === x && player.y === y;
                        const isPlayerTrail = player.trail.some(t => t.x === x && t.y === y);
                        const isAi = ai.x === x && ai.y === y;
                        const isAiTrail = ai.trail.some(t => t.x === x && t.y === y);

                        return (
                            <div
                                key={i}
                                style={{
                                    width: `${CELL_SIZE}px`,
                                    height: `${CELL_SIZE}px`,
                                    background: isPlayer ? '#3b82f6' :
                                        isPlayerTrail ? 'rgba(59, 130, 246, 0.6)' :
                                            isAi ? '#ef4444' :
                                                isAiTrail ? 'rgba(239, 68, 68, 0.6)' :
                                                    '#000',
                                    boxShadow: isPlayer ? '0 0 8px #3b82f6' :
                                        isAi ? '0 0 8px #ef4444' : 'none',
                                    border: '0.5px solid rgba(255,255,255,0.05)'
                                }}
                            />
                        );
                    })}

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
                            <h3 style={{ fontSize: 'var(--text-2xl)', color: winner === 'You' ? 'var(--success)' : 'var(--danger)', marginBottom: 'var(--space-md)' }}>
                                {winner} {winner === 'You' ? 'Wins!' : 'Win!'}
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

export default Tron;
