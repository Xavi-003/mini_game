import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import GameIntro from '../../components/GameIntro';
import WinnerModal from '../../components/WinnerModal';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';
import GameContainer from '../../components/GameContainer';
import useGameScale from '../../hooks/useGameScale';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PEG_RADIUS = 8;
const BALL_RADIUS = 10;
const GRAVITY = 0.3;
const BOUNCE_DAMPING = 0.8;

const Peggle = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [pegs, setPegs] = useState([]);
    const [ball, setBall] = useState(null);
    const [ballsLeft, setBallsLeft] = useState(10);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('peggleHighScore')) || 0);
    const [gameOver, setGameOver] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [aimAngle, setAimAngle] = useState(0);
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, GAME_WIDTH, GAME_HEIGHT);

    const initPegs = () => {
        const newPegs = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 7; col++) {
                const x = 50 + col * 50 + (row % 2) * 25;
                const y = 80 + row * 40;
                const isOrange = Math.random() < 0.3;
                newPegs.push({ x, y, isOrange, hit: false });
            }
        }
        return newPegs;
    };

    const resetGame = () => {
        setPegs(initPegs());
        setBall(null);
        setBallsLeft(10);
        setScore(0);
        setGameOver(false);
        setShowWinnerModal(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        setPegs(initPegs());
    }, []);

    const shootBall = () => {
        if (ball || gameOver || ballsLeft <= 0) return;

        const speed = 8;
        setBall({
            x: GAME_WIDTH / 2,
            y: 40,
            vx: Math.cos(aimAngle) * speed,
            vy: Math.sin(aimAngle) * speed
        });
        setBallsLeft(prev => prev - 1);
        SoundManager.playClick();
    };

    useEffect(() => {
        if (!ball || gameOver) return;

        const interval = setInterval(() => {
            setBall(prev => {
                if (!prev) return null;

                let newX = prev.x + prev.vx;
                let newY = prev.y + prev.vy;
                let newVx = prev.vx;
                let newVy = prev.vy + GRAVITY;

                // Wall bounces
                if (newX <= BALL_RADIUS || newX >= GAME_WIDTH - BALL_RADIUS) {
                    newVx = -newVx * BOUNCE_DAMPING;
                    newX = newX <= BALL_RADIUS ? BALL_RADIUS : GAME_WIDTH - BALL_RADIUS;
                }

                // Bottom - remove ball
                if (newY >= GAME_HEIGHT) {
                    if (ballsLeft === 0) {
                        const orangesLeft = pegs.filter(p => p.isOrange && !p.hit).length;
                        if (orangesLeft === 0) {
                            setGameOver(true);
                            SoundManager.playWin();
                            addPoints(50);
                            incrementStreak();
                            setShowWinnerModal(true);
                        } else {
                            setGameOver(true);
                            SoundManager.playLose();
                            if (score > 0) addPoints(Math.floor(score / 10));
                            resetStreak();
                        }
                        if (score > highScore) {
                            setHighScore(score);
                            localStorage.setItem('peggleHighScore', score.toString());
                        }
                    }
                    return null;
                }

                return { x: newX, y: newY, vx: newVx, vy: newVy };
            });

            // Peg collisions
            setPegs(prev => prev.map(peg => {
                if (peg.hit || !ball) return peg;

                const dx = ball.x - peg.x;
                const dy = ball.y - peg.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < BALL_RADIUS + PEG_RADIUS) {
                    setBall(b => {
                        if (!b) return null;
                        const angle = Math.atan2(dy, dx);
                        return {
                            ...b,
                            vx: Math.cos(angle) * 5,
                            vy: Math.sin(angle) * 5
                        };
                    });
                    setScore(s => s + (peg.isOrange ? 10 : 5));
                    SoundManager.playPoint();
                    return { ...peg, hit: true };
                }
                return peg;
            }));
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [ball, ballsLeft, gameOver, pegs, score, highScore, addPoints, incrementStreak, resetStreak]);

    if (showIntro) {
        return <GameIntro gameId="peggle" onComplete={() => setShowIntro(false)} />;
    }

    const headerContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                <ArrowLeft size={20} /> Back
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Balls: {ballsLeft}</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--accent)' }}>{score}</div>
                </div>
                <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn btn-secondary" style={{ padding: 'var(--space-sm)' }}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    );

    return (
        <GameContainer header={headerContent}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Peggle"
                instructions={[
                    "Move your mouse to aim, click to shoot the ball.",
                    "Hit all orange pegs to win!",
                    "Blue pegs give 5 points, orange give 10 points.",
                    "You have 10 balls to clear all orange pegs.",
                    "The ball bounces off pegs and walls."
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
                        if (gameOver || ball) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const scaleX = GAME_WIDTH / rect.width;
                        const scaleY = GAME_HEIGHT / rect.height;
                        const x = (e.clientX - rect.left) * scaleX - GAME_WIDTH / 2;
                        const y = (e.clientY - rect.top) * scaleY - 40;
                        setAimAngle(Math.atan2(y, x));
                    }}
                    onClick={shootBall}
                    style={{
                        position: 'relative',
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        width: `${GAME_WIDTH}px`,
                        height: `${GAME_HEIGHT}px`,
                        background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                        border: '2px solid var(--border-subtle)',
                        borderRadius: 'var(--radius)',
                        overflow: 'hidden',
                        cursor: ball || gameOver ? 'default' : 'crosshair',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Aim line */}
                    {!ball && !gameOver && (
                        <div style={{
                            position: 'absolute',
                            left: GAME_WIDTH / 2,
                            top: 40,
                            width: '100px',
                            height: '2px',
                            background: 'var(--accent)',
                            transformOrigin: 'left center',
                            transform: `rotate(${aimAngle}rad)`
                        }} />
                    )}

                    {/* Pegs */}
                    {pegs.map((peg, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: peg.x - PEG_RADIUS,
                                top: peg.y - PEG_RADIUS,
                                width: PEG_RADIUS * 2,
                                height: PEG_RADIUS * 2,
                                background: peg.hit ? '#6b7280' : (peg.isOrange ? '#f97316' : '#3b82f6'),
                                borderRadius: '50%',
                                border: `2px solid ${peg.hit ? '#4b5563' : (peg.isOrange ? '#ea580c' : '#2563eb')}`,
                                opacity: peg.hit ? 0.3 : 1,
                                transition: 'opacity 0.3s'
                            }}
                        />
                    ))}

                    {/* Ball */}
                    {ball && (
                        <div style={{
                            position: 'absolute',
                            left: ball.x - BALL_RADIUS,
                            top: ball.y - BALL_RADIUS,
                            width: BALL_RADIUS * 2,
                            height: BALL_RADIUS * 2,
                            background: '#facc15',
                            borderRadius: '50%',
                            border: '2px solid var(--border-subtle)',
                            boxShadow: '0 0 15px rgba(250, 204, 21, 0.6)'
                        }} />
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
                            <h3 style={{
                                fontSize: 'var(--text-2xl)',
                                color: pegs.filter(p => p.isOrange && !p.hit).length === 0 ? 'var(--success)' : 'var(--danger)',
                                marginBottom: 'var(--space-md)'
                            }}>
                                {pegs.filter(p => p.isOrange && !p.hit).length === 0 ? 'You Win!' : 'Game Over'}
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

export default Peggle;
