import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import WinnerModal from '../../components/WinnerModal';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';
import GameContainer from '../../components/GameContainer';

const GRID_SIZE = 8;
const CELL_SIZE = 45;
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#ec4899'];

const BubbleShooter = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [grid, setGrid] = useState([]);
    const [currentBubble, setCurrentBubble] = useState({ color: COLORS[0], angle: 0 });
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('bubbleHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);

    const initGrid = () => {
        const newGrid = Array(GRID_SIZE).fill(null).map((_, row) =>
            Array(GRID_SIZE).fill(null).map((_, col) => {
                if (row < 4) {
                    return Math.random() < 0.7 ? COLORS[Math.floor(Math.random() * COLORS.length)] : null;
                }
                return null;
            })
        );
        return newGrid;
    };

    const resetGame = () => {
        setGrid(initGrid());
        setCurrentBubble({ color: COLORS[Math.floor(Math.random() * COLORS.length)], angle: 0 });
        setScore(0);
        setGameOver(false);
        setShowWinnerModal(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        setGrid(initGrid());
        setCurrentBubble({ color: COLORS[Math.floor(Math.random() * COLORS.length)], angle: 0 });
    }, []);

    const findConnectedBubbles = (row, col, color, visited = new Set()) => {
        const key = `${row},${col}`;
        if (visited.has(key)) return [];
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return [];
        if (grid[row][col] !== color) return [];

        visited.add(key);
        let connected = [{ row, col }];

        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
            connected = connected.concat(findConnectedBubbles(row + dr, col + dc, color, visited));
        });

        return connected;
    };

    const shootBubble = (col) => {
        if (gameOver) return;

        let row = GRID_SIZE - 1;
        while (row >= 0 && grid[row][col] === null) row--;
        row++;

        if (row >= GRID_SIZE) return;

        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = currentBubble.color;

        const connected = findConnectedBubbles(row, col, currentBubble.color);

        if (connected.length >= 3) {
            connected.forEach(({ row, col }) => {
                newGrid[row][col] = null;
            });
            setScore(prev => prev + connected.length * 10);
            SoundManager.playPoint();
        } else {
            SoundManager.playClick();
        }

        setGrid(newGrid);
        setCurrentBubble({ color: COLORS[Math.floor(Math.random() * COLORS.length)], angle: 0 });

        const remaining = newGrid.flat().filter(cell => cell !== null).length;
        if (remaining === 0) {
            setGameOver(true);
            SoundManager.playWin();
            addPoints(50);
            incrementStreak();
            setShowWinnerModal(true);
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('bubbleHighScore', score.toString());
            }
        }

        const bottomRowFilled = newGrid[GRID_SIZE - 1].some(cell => cell !== null);
        if (bottomRowFilled) {
            setGameOver(true);
            SoundManager.playLose();
            if (score > 0) addPoints(Math.floor(score / 10));
            resetStreak();
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('bubbleHighScore', score.toString());
            }
        }
    };

    if (showIntro) {
        return <GameIntro gameId="bubble" onComplete={() => setShowIntro(false)} />;
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
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            width: '100%'
        }}>
            <span>Next:</span>
            <div style={{
                width: '40px',
                height: '40px',
                background: currentBubble.color,
                borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.5)',
                boxShadow: '0 0 15px rgba(255,255,255,0.3)'
            }} />
        </div>
    );

    return (
        <GameContainer header={headerContent} footer={footerContent}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Bubble Shooter"
                instructions={[
                    "Click on a column to shoot a bubble.",
                    "Match 3 or more bubbles of the same color to pop them.",
                    "Clear all bubbles to win!",
                    "Don't let the bubbles reach the bottom.",
                    "Each popped bubble earns 10 points."
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
                    position: 'relative',
                    transformOrigin: 'center center',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gap: '2px',
                    padding: 'var(--space-sm)',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    border: '2px solid var(--border-subtle)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    {grid.map((row, rowIdx) => (
                        row.map((cell, colIdx) => (
                            <button
                                key={`${rowIdx}-${colIdx}`}
                                onClick={() => shootBubble(colIdx)}
                                disabled={gameOver}
                                style={{
                                    width: `${CELL_SIZE}px`,
                                    height: `${CELL_SIZE}px`,
                                    background: cell || 'var(--bg-elevated)',
                                    border: cell ? '2px solid rgba(255,255,255,0.3)' : '1px solid var(--border-subtle)',
                                    borderRadius: '50%',
                                    cursor: gameOver ? 'default' : 'pointer',
                                    transition: 'transform 0.1s',
                                    boxShadow: cell ? '0 0 10px rgba(255,255,255,0.2)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!gameOver) e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            />
                        ))
                    ))}
                </div>

                {gameOver && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--bg-card)',
                        border: `2px solid ${grid.flat().every(cell => cell === null) ? 'var(--success)' : 'var(--danger)'}`,
                        borderRadius: 'var(--radius)',
                        padding: 'var(--space-lg)',
                        textAlign: 'center',
                        zIndex: 20,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        minWidth: '200px'
                    }}>
                        <h3 style={{ color: grid.flat().every(cell => cell === null) ? 'var(--success)' : 'var(--danger)', marginBottom: 'var(--space-sm)' }}>
                            {grid.flat().every(cell => cell === null) ? 'You Win!' : 'Game Over!'}
                        </h3>
                        <p style={{ marginBottom: 'var(--space-md)' }}>Score: {score}</p>
                        <button onClick={resetGame} className="btn btn-primary">
                            <RefreshCw size={20} style={{ marginRight: 'var(--space-xs)' }} /> Play Again
                        </button>
                    </div>
                )}
            </div>
        </GameContainer>
    );
};

export default BubbleShooter;
