import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, RefreshCw, HelpCircle, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import GameContainer from '../../components/GameContainer';
import { useGame } from '../../context/GameContext';
import useGameScale from '../../hooks/useGameScale';
import SoundManager from '../../utils/SoundManager';

const GRID_SIZE = 12;
const CELL_SIZE = 40;

const CrossyRoad = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [playerPos, setPlayerPos] = useState({ x: Math.floor(GRID_SIZE / 2), y: GRID_SIZE - 1 });
    const [cars, setCars] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('crossyHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    const initializeCars = () => {
        const newCars = [];
        for (let row = 2; row < GRID_SIZE - 2; row++) {
            if (Math.random() > 0.3) {
                const direction = Math.random() > 0.5 ? 1 : -1;
                const startX = direction === 1 ? -1 : GRID_SIZE;
                newCars.push({
                    x: startX,
                    y: row,
                    direction,
                    speed: 0.5 + Math.random() * 0.5
                });
            }
        }
        return newCars;
    };

    const resetGame = () => {
        setPlayerPos({ x: Math.floor(GRID_SIZE / 2), y: GRID_SIZE - 1 });
        setCars(initializeCars());
        setScore(0);
        setGameOver(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        setCars(initializeCars());
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameOver || showIntro) return;

            let newPos = { ...playerPos };
            switch (e.key) {
                case 'ArrowUp':
                    newPos.y = Math.max(0, playerPos.y - 1);
                    if (newPos.y < playerPos.y) {
                        setScore(prev => prev + 1);
                        SoundManager.playPoint();
                    }
                    break;
                case 'ArrowDown':
                    newPos.y = Math.min(GRID_SIZE - 1, playerPos.y + 1);
                    break;
                case 'ArrowLeft':
                    newPos.x = Math.max(0, playerPos.x - 1);
                    break;
                case 'ArrowRight':
                    newPos.x = Math.min(GRID_SIZE - 1, playerPos.x + 1);
                    break;
                default:
                    return;
            }

            if (newPos.x !== playerPos.x || newPos.y !== playerPos.y) {
                setPlayerPos(newPos);
                SoundManager.playClick();
            }

            if (newPos.y === 0) {
                SoundManager.playWin();
                addPoints(10);
                incrementStreak();
                setTimeout(() => {
                    setPlayerPos({ x: Math.floor(GRID_SIZE / 2), y: GRID_SIZE - 1 });
                    setCars(initializeCars());
                    setScore(0);
                }, 500);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [playerPos, gameOver, showIntro, addPoints, incrementStreak]);

    useEffect(() => {
        if (gameOver || showIntro) return;

        const interval = setInterval(() => {
            setCars(prev => prev.map(car => {
                let newX = car.x + (car.direction * car.speed);

                if ((car.direction === 1 && newX > GRID_SIZE + 2) ||
                    (car.direction === -1 && newX < -2)) {
                    newX = car.direction === 1 ? -1 : GRID_SIZE;
                }

                return { ...car, x: newX };
            }));
        }, 50);

        return () => clearInterval(interval);
    }, [gameOver, showIntro]);

    useEffect(() => {
        if (gameOver || showIntro) return;

        for (let car of cars) {
            const carCells = [Math.floor(car.x), Math.ceil(car.x)];
            if (carCells.includes(playerPos.x) && car.y === playerPos.y) {
                setGameOver(true);
                SoundManager.playLose();
                if (score > 0) {
                    addPoints(score);
                    if (score >= 5) incrementStreak();
                    else resetStreak();
                }
                if (score > highScore) {
                    setHighScore(score);
                    localStorage.setItem('crossyHighScore', score.toString());
                }
                break;
            }
        }
    }, [cars, playerPos, gameOver, showIntro, isPaused, score, highScore, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="crossy" onComplete={() => setShowIntro(false)} />;
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
                title="Crossy Road"
                instructions={[
                    "Use ARROW KEYS to move.",
                    "Dodge the moving cars to reach the top.",
                    "Each forward step earns you points.",
                    "Reach the top to win and start a new round!",
                    "Don't get hit by the cars!"
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
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border-subtle)',
                    borderRadius: 'var(--radius)',
                    padding: '1px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);

                        const isPlayer = playerPos.x === x && playerPos.y === y;
                        const isCar = cars.some(car => {
                            const carCells = [Math.floor(car.x), Math.ceil(car.x)];
                            return carCells.includes(x) && car.y === y;
                        });
                        const isRoad = y > 1 && y < GRID_SIZE - 2;
                        const isGoal = y === 0;

                        return (
                            <div
                                key={i}
                                style={{
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    background: isPlayer ? '#facc15' : (isCar ? '#ef4444' : (isGoal ? '#22c55e' : (isRoad ? 'var(--bg-elevated)' : 'var(--bg-secondary)'))),
                                    borderRadius: isPlayer || isCar ? '50%' : '2px',
                                    boxShadow: isPlayer ? '0 0 10px rgba(250, 204, 21, 0.8)' : (isCar ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none'),
                                    border: isGoal ? '2px solid #16a34a' : 'none'
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
                            backdropFilter: 'blur(4px)',
                            zIndex: 20
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

export default CrossyRoad;
