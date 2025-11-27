
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, RefreshCw, Pause, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import WinnerModal from '../../components/WinnerModal';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const GRID_SIZE = 20;
// Dynamic cell size based on viewport would be ideal, but for now let's reduce it to fit standard screens
// Was 25, reducing to 20 or 18 to fit 20x20 grid + UI in < 600px height
const CELL_SIZE = 20;
const getInitialSnake = () => [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const Snake = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [snake, setSnake] = useState(getInitialSnake());
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snakeHighScore')) || 0);
    const [isPaused, setIsPaused] = useState(true);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const generateFood = useCallback(() => {
        return {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    }, []);

    const resetGame = () => {
        console.log('Resetting game...');
        setSnake(getInitialSnake());
        setFood(generateFood());
        setDirection(INITIAL_DIRECTION);
        setGameOver(false);
        setScore(0);
        setIsPaused(false);
        console.log('Game Reset Complete');
        SoundManager.playClick();
    };

    const moveSnake = useCallback(() => {
        if (gameOver || isPaused || showIntro) return;

        console.log('Moving snake:', snake[0], direction);

        const newSnake = [...snake];
        const head = { ...newSnake[0] };

        head.x += direction.x;
        head.y += direction.y;

        // Check collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            console.log('Wall collision:', head, GRID_SIZE);
            setGameOver(true);
            if (score > highScore) setHighScore(score);
            SoundManager.playLose();
            resetStreak();
            return;
        }

        // Check collision with self
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
            console.log('Self collision:', head, newSnake);
            setGameOver(true);
            if (score > highScore) setHighScore(score);
            SoundManager.playLose();
            resetStreak();
            return;
        }

        newSnake.unshift(head);

        // Check collision with food
        if (head.x === food.x && head.y === food.y) {
            setScore(prev => prev + 1);
            setFood(generateFood());
            SoundManager.playPoint();
            addPoints(1);
            if (score > 0 && score % 10 === 0) incrementStreak();
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
    }, [snake, direction, food, gameOver, isPaused, showIntro, generateFood, score, highScore, addPoints, incrementStreak, resetStreak]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            switch (e.key) {
                case 'ArrowUp': if (direction.y !== 1) setDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (direction.y !== -1) setDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (direction.x !== 1) setDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (direction.x !== -1) setDirection({ x: 1, y: 0 }); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction]);

    useEffect(() => {
        const gameLoop = setInterval(moveSnake, 150);
        return () => clearInterval(gameLoop);
    }, [moveSnake]);

    return (
        <div className="game-container animate-fade-in">
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Snake"
                instructions={[
                    "Use the Arrow Keys to control the snake's direction.",
                    "Eat the red food to grow longer and increase your score.",
                    "Avoid hitting the walls or your own tail.",
                    "The game gets faster as you eat more food!",
                    "Press Pause if you need a break."
                ]}
            />

            {showIntro && <GameIntro gameId="snake" onComplete={() => setShowIntro(false)} />}

            <div style={{ width: '100%', maxWidth: '650px', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                        <ArrowLeft size={20} /> Back
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)', color: 'var(--text-secondary)' }}>High Score: {highScore}</div>
                            <div style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 'bold', color: 'var(--accent)' }}>Score: {score}</div>
                        </div>
                        <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn" style={{ padding: '0.5rem' }}><HelpCircle size={20} /></button>
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', position: 'relative', padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', justifyContent: 'space-between' }}>
                    <h2 className="title" style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)', flexShrink: 0 }}>Snake</h2>

                    {gameOver && (
                        <div style={{
                            position: 'absolute',
                            top: '0', left: '0', right: '0', bottom: '0',
                            background: 'rgba(15, 23, 42, 0.9)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius)',
                            zIndex: 10,
                            backdropFilter: 'blur(4px)'
                        }}>
                            <h3 style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: 'var(--danger)', marginBottom: '1rem' }}>Game Over</h3>
                            <p style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>Final Score: {score}</p>
                            <button onClick={resetGame} className="btn btn-primary" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', padding: 'clamp(1rem, 3vw, 1.5rem) clamp(2rem, 5vw, 3rem)' }}>
                                <RefreshCw size={28} style={{ marginRight: '0.5rem' }} /> Play Again
                            </button>
                        </div>
                    )}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gap: '1px',
                        backgroundColor: 'var(--bg-card)',
                        border: '3px solid var(--bg-card)',
                        marginBottom: '1rem',
                        aspectRatio: '1',
                        borderRadius: 'var(--radius)',
                        overflow: 'hidden',
                        flex: '0 1 auto',
                        maxWidth: 'min(450px, 60vh)',
                        width: '100%',
                        margin: '0 auto 1rem auto'
                    }}>
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                            const x = i % GRID_SIZE;
                            const y = Math.floor(i / GRID_SIZE);
                            const isSnake = snake.some(s => s.x === x && s.y === y);
                            const isFood = food.x === x && food.y === y;
                            const isHead = snake[0].x === x && snake[0].y === y;

                            return (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: isHead ? '#fff' : (isSnake ? 'var(--success)' : (isFood ? 'var(--danger)' : 'rgba(255,255,255,0.03)')),
                                        borderRadius: isFood ? '50%' : (isSnake ? '4px' : '0'),
                                        boxShadow: isHead ? '0 0 15px rgba(255,255,255,0.8)' : (isFood ? '0 0 10px var(--danger)' : 'none'),
                                        transition: isHead || isFood ? 'all 0.1s' : 'none'
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                        <button
                            onClick={() => { setIsPaused(!isPaused); SoundManager.playClick(); }}
                            className="btn"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                flex: '1 1 0',
                                fontSize: '1rem',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 0
                            }}
                            disabled={gameOver}
                        >
                            {isPaused ? <Play size={20} style={{ marginRight: '0.5rem', flexShrink: 0 }} /> : <Pause size={20} style={{ marginRight: '0.5rem', flexShrink: 0 }} />}
                            <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Snake;
