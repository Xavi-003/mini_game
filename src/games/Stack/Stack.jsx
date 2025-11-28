import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import useGameScale from '../../hooks/useGameScale';
import SoundManager from '../../utils/SoundManager';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 500;
const BLOCK_HEIGHT = 40;
const INITIAL_WIDTH = 200;

const Stack = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [blocks, setBlocks] = useState([{ x: GAME_WIDTH / 2 - INITIAL_WIDTH / 2, width: INITIAL_WIDTH }]);
    const [currentBlock, setCurrentBlock] = useState({ x: 0, width: INITIAL_WIDTH, direction: 1 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('stackHighScore')) || 0);
    const [isPaused, setIsPaused] = useState(true);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [speed, setSpeed] = useState(2);
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, GAME_WIDTH, GAME_HEIGHT);

    const resetGame = () => {
        setBlocks([{ x: GAME_WIDTH / 2 - INITIAL_WIDTH / 2, width: INITIAL_WIDTH }]);
        setCurrentBlock({ x: 0, width: INITIAL_WIDTH, direction: 1 });
        setGameOver(false);
        setScore(0);
        setIsPaused(false);
        setSpeed(2);
        SoundManager.playClick();
    };

    const dropBlock = useCallback(() => {
        if (gameOver || isPaused || showIntro) return;

        const lastBlock = blocks[blocks.length - 1];
        const overlap = Math.min(
            currentBlock.x + currentBlock.width,
            lastBlock.x + lastBlock.width
        ) - Math.max(currentBlock.x, lastBlock.x);

        if (overlap <= 0) {
            setGameOver(true);
            SoundManager.playLose();
            if (score > 0) {
                addPoints(score);
                if (score >= 10) incrementStreak();
                else resetStreak();
            }
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('stackHighScore', score.toString());
            }
            return;
        }

        const newX = Math.max(currentBlock.x, lastBlock.x);
        const newWidth = overlap;

        setBlocks(prev => [...prev, { x: newX, width: newWidth }]);
        setCurrentBlock({
            x: 0,
            width: newWidth,
            direction: Math.random() > 0.5 ? 1 : -1
        });
        setScore(prev => prev + 1);
        setSpeed(prev => Math.min(prev + 0.1, 5));
        SoundManager.playPoint();
    }, [blocks, currentBlock, gameOver, isPaused, showIntro, score, highScore, addPoints, incrementStreak, resetStreak]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                dropBlock();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [dropBlock]);

    useEffect(() => {
        if (gameOver || isPaused || showIntro) return;

        const interval = setInterval(() => {
            setCurrentBlock(prev => {
                let newX = prev.x + (prev.direction * speed);
                let newDirection = prev.direction;

                if (newX <= 0) {
                    newX = 0;
                    newDirection = 1;
                } else if (newX + prev.width >= GAME_WIDTH) {
                    newX = GAME_WIDTH - prev.width;
                    newDirection = -1;
                }

                return { ...prev, x: newX, direction: newDirection };
            });
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [gameOver, isPaused, showIntro, speed]);

    if (showIntro) {
        return <GameIntro gameId="stack" onComplete={() => setShowIntro(false)} />;
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
                title="Stack"
                instructions={[
                    "Press SPACE or CLICK to drop the moving block.",
                    "Stack blocks on top of each other precisely.",
                    "Misaligned parts will be cut off.",
                    "The block gets smaller with each mistake.",
                    "Perfect alignment keeps the full width!"
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
                    onClick={dropBlock}
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
                    {/* Stacked blocks */}
                    {blocks.map((block, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                bottom: `${i * BLOCK_HEIGHT}px`,
                                left: `${block.x}px`,
                                width: `${block.width}px`,
                                height: `${BLOCK_HEIGHT}px`,
                                background: `hsl(${(i * 30) % 360}, 70%, 50%)`,
                                border: '2px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        />
                    ))}

                    {/* Current moving block */}
                    {!gameOver && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: `${blocks.length * BLOCK_HEIGHT}px`,
                                left: `${currentBlock.x}px`,
                                width: `${currentBlock.width}px`,
                                height: `${BLOCK_HEIGHT}px`,
                                background: `hsl(${(blocks.length * 30) % 360}, 70%, 50%)`,
                                border: '2px solid rgba(255,255,255,0.5)',
                                boxShadow: '0 0 15px rgba(255,255,255,0.3)'
                            }}
                        />
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
                            backdropFilter: 'blur(4px)'
                        }}>
                            <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--danger)', marginBottom: 'var(--space-md)' }}>Game Over</h3>
                            <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-lg)' }}>Height: {score}</p>
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

export default Stack;
