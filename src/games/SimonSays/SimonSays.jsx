import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';
import GameContainer from '../../components/GameContainer';

const COLORS = [
    { id: 'green', color: '#22c55e', active: '#4ade80', freq: 300 },
    { id: 'red', color: '#ef4444', active: '#f87171', freq: 400 },
    { id: 'yellow', color: '#eab308', active: '#facc15', freq: 500 },
    { id: 'blue', color: '#3b82f6', active: '#60a5fa', freq: 600 }
];

const SimonSays = () => {
    const [sequence, setSequence] = useState([]);
    const [playingSequence, setPlayingSequence] = useState(false);
    const [userTurn, setUserTurn] = useState(false);
    const [userStep, setUserStep] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [activeColor, setActiveColor] = useState(null);
    const [highScore, setHighScore] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef(null);

    const { addPoints, incrementStreak, resetStreak } = useGame();

    const startGame = () => {
        setSequence([]);
        setScore(0);
        setGameOver(false);
        setUserTurn(false);
        setUserStep(0);
        addToSequence([]);
        SoundManager.playClick();
    };

    const addToSequence = (currentSequence) => {
        const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
        const newSequence = [...currentSequence, nextColor];
        setSequence(newSequence);
        playSequence(newSequence);
    };

    const playSequence = async (seq) => {
        setPlayingSequence(true);
        setUserTurn(false);

        for (let i = 0; i < seq.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const colorObj = COLORS.find(c => c.id === seq[i]);
            setActiveColor(seq[i]);
            SoundManager.playTone(colorObj.freq, 'sine', 0.2);
            await new Promise(resolve => setTimeout(resolve, 500));
            setActiveColor(null);
        }

        setPlayingSequence(false);
        setUserTurn(true);
        setUserStep(0);
    };

    const handleColorClick = (colorId) => {
        if (!userTurn || playingSequence || gameOver) return;

        const colorObj = COLORS.find(c => c.id === colorId);
        setActiveColor(colorId);
        SoundManager.playTone(colorObj.freq, 'sine', 0.2);
        setTimeout(() => setActiveColor(null), 200);

        if (colorId === sequence[userStep]) {
            if (userStep === sequence.length - 1) {
                setScore(prev => prev + 1);
                setUserTurn(false);
                addPoints(2);
                if (score > 0 && score % 5 === 0) incrementStreak();
                setTimeout(() => addToSequence(sequence), 1000);
            } else {
                setUserStep(prev => prev + 1);
            }
        } else {
            setGameOver(true);
            if (score > highScore) {
                setHighScore(score);
                if (score >= 5) setShowWinnerModal(true);
            }
            SoundManager.playLose();
            resetStreak();
        }
    };

    if (showIntro) {
        return <GameIntro gameId="simon" onComplete={() => setShowIntro(false)} />;
    }

    const headerContent = (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
        }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                <ArrowLeft size={20} /> Back
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--accent)' }}>Score: {score}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Best: {highScore}</span>
                </div>
                <button onClick={() => { setShowTutorial(true); SoundManager.playClick(); }} className="btn" style={{ padding: '0.5rem' }}><HelpCircle size={20} /></button>
            </div>
        </div>
    );

    const footerContent = (
        <button onClick={startGame} className="btn btn-primary" style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {gameOver ? <RefreshCw size={22} style={{ marginRight: '0.5rem' }} /> : <Play size={22} style={{ marginRight: '0.5rem' }} />}
            <span>{gameOver ? 'Try Again' : 'Start Game'}</span>
        </button>
    );

    return (
        <GameContainer header={headerContent} footer={footerContent}>
            <TutorialModal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                title="Simon Says"
                instructions={[
                    "Watch the sequence of lights.",
                    "Repeat the sequence by clicking the buttons in the same order.",
                    "The sequence gets one step longer each round.",
                    "One mistake and the game is over!",
                    "How long of a sequence can you remember?"
                ]}
            />

            <WinnerModal
                isOpen={showWinnerModal}
                onClose={() => setShowWinnerModal(false)}
                winner="You"
                pointsEarned={score * 2}
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
                <div className="card" style={{
                    position: 'relative',
                    transformOrigin: 'center center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    gap: '1rem',
                    width: '600px',
                    height: '600px'
                }}>
                    <h2 className="title" style={{
                        fontSize: '2rem',
                        margin: 0,
                        flexShrink: 0
                    }}>Simon Says</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px',
                        width: '100%',
                        maxWidth: '400px',
                        aspectRatio: '1/1',
                        pointerEvents: (!userTurn || gameOver) ? 'none' : 'auto',
                        opacity: (!userTurn && !playingSequence && !gameOver) ? 0.6 : 1,
                    }}>
                        {COLORS.map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleColorClick(btn.id)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: activeColor === btn.id ? btn.active : btn.color,
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                    transform: activeColor === btn.id ? 'scale(0.95)' : 'scale(1)',
                                    boxShadow: activeColor === btn.id ? `0 0 40px ${btn.active}` : '0 4px 6px rgba(0,0,0,0.2)',
                                    touchAction: 'manipulation' // Prevents double-tap zoom
                                }}
                            />
                        ))}
                    </div>

                    <div style={{
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {gameOver ? (
                            <div style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>Game Over!</div>
                        ) : playingSequence ? (
                            <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.1rem' }}>Watch Sequence...</div>
                        ) : userTurn ? (
                            <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem' }}>Your Turn!</div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Press Start to Play</div>
                        )}
                    </div>
                </div>
            </div>
        </GameContainer>
    );
};

export default SimonSays;
