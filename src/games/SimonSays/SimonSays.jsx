import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro'; // Added GameIntro import
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

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
    const [showIntro, setShowIntro] = useState(true); // Added showIntro state

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

    return (
        <div className="game-container animate-fade-in">
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

            {showIntro && <GameIntro gameId="simon" onComplete={() => setShowIntro(false)} />}

            <div style={{ width: '100%', maxWidth: 'min(650px, 100%)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                        <ArrowLeft size={20} /> Back
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--accent)' }}>Score: {score}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>Best: {highScore}</span>
                        </div>
                        <button onClick={() => { setShowTutorial(true); SoundManager.playClick(); }} className="btn" style={{ padding: '0.5rem' }}><HelpCircle size={20} /></button>
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', position: 'relative', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.75rem, 3vw, 1.5rem)', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', justifyContent: 'space-between' }}>
                    <h2 className="title" style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: 'clamp(0.75rem, 3vw, 1.5rem)', flexShrink: 0 }}>Simon Says</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                        marginBottom: 'clamp(0.75rem, 3vw, 1.5rem)',
                        padding: '0.5rem',
                        pointerEvents: (!userTurn || gameOver) ? 'none' : 'auto',
                        opacity: (!userTurn && !playingSequence && !gameOver) ? 0.6 : 1,
                        flex: '0 1 auto',
                        aspectRatio: '1',
                        maxWidth: 'min(450px, 60vh)',
                        width: '100%',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        {COLORS.map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleColorClick(btn.id)}
                                style={{
                                    aspectRatio: '1',
                                    backgroundColor: activeColor === btn.id ? btn.active : btn.color,
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                    transform: activeColor === btn.id ? 'scale(0.95)' : 'scale(1)',
                                    boxShadow: activeColor === btn.id ? `0 0 40px ${btn.active}` : '0 4px 6px rgba(0,0,0,0.2)'
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ height: '3rem', marginBottom: '1.5rem', flexShrink: 0 }}>
                        {gameOver ? (
                            <div style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>Game Over!</div>
                        ) : playingSequence ? (
                            <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Watch Sequence...</div>
                        ) : userTurn ? (
                            <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Your Turn!</div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Press Start to Play</div>
                        )}
                    </div>

                    <button onClick={startGame} className="btn btn-primary" style={{ width: '100%', padding: 'clamp(0.75rem, 2.5vw, 1rem)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}>
                        {gameOver ? <RefreshCw size={22} style={{ marginRight: '0.5rem', flexShrink: 0 }} /> : <Play size={22} style={{ marginRight: '0.5rem', flexShrink: 0 }} />}
                        <span>{gameOver ? 'Try Again' : 'Start Game'}</span>
                    </button>
                </div>
            </div >
        </div >
    );
};

export default SimonSays;
