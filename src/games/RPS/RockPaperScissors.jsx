
import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Hand, Scissors, Scroll, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const CHOICES = [
    { name: 'rock', icon: '✊', beats: 'scissors' },
    { name: 'paper', icon: '✋', beats: 'rock' },
    { name: 'scissors', icon: '✌️', beats: 'paper' },
];

const RockPaperScissors = () => {
    const [playerChoice, setPlayerChoice] = useState(null);
    const [computerChoice, setComputerChoice] = useState(null);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0); // Changed from object to number
    const [isAnimating, setIsAnimating] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false); // Renamed from showTutorial
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [showIntro, setShowIntro] = useState(true); // New state

    const { addPoints, incrementStreak, resetStreak } = useGame();

    const handleChoice = (choice) => {
        if (isAnimating) return;

        SoundManager.playClick();
        setIsAnimating(true);
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult(null);

        setTimeout(() => {
            const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
            setPlayerChoice(choice);
            setComputerChoice(randomChoice);

            if (choice.name === randomChoice.name) {
                setResult('Draw');
                SoundManager.playHover();
            } else if (choice.beats === randomChoice.name) {
                setResult('You Win!');
                setScore(prev => prev + 1);
                SoundManager.playWin();
                addPoints(5);
                incrementStreak();
                if (score + 1 === 5) setShowWinnerModal(true);
            } else {
                setResult('Computer Wins!');
                SoundManager.playLose();
                resetStreak();
            }
            setIsAnimating(false);
        }, 1000);
    };

    const resetGame = () => {
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult(null);
        setScore(0);
        setShowWinnerModal(false);
        SoundManager.playClick();
    };

    return (
        <div className="game-container animate-fade-in">
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Rock Paper Scissors"
                instructions={[
                    "Choose Rock, Paper, or Scissors.",
                    "Rock beats Scissors.",
                    "Scissors beats Paper.",
                    "Paper beats Rock.",
                    "Try to beat the computer and get the highest score!"
                ]}
            />

            <WinnerModal
                isOpen={showWinnerModal}
                onClose={() => setShowWinnerModal(false)}
                winner="You"
                pointsEarned={25}
            />

            {showIntro && <GameIntro gameId="rps" onComplete={() => setShowIntro(false)} />}

            <div style={{ width: '100%', maxWidth: 'min(700px, 80vh)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                        <ArrowLeft size={20} /> Back
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '2rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--success)' }}>You: {score}</span>
                        </div>
                        <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn" style={{ padding: '0.5rem' }}><HelpCircle size={20} /></button>
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.75rem, 3vw, 1.5rem)', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', justifyContent: 'space-between' }}>
                    <h2 className="title" style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: 'clamp(0.75rem, 3vw, 1.5rem)', flexShrink: 0 }}>Rock Paper Scissors</h2>

                    <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', flex: '0 1 auto' }}>
                        {isAnimating ? (
                            <div style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 'bold', animation: 'bounce 0.5s infinite' }}>
                                ✊ ✋ ✌️
                            </div>
                        ) : result ? (
                            <div className="animate-fade-in">
                                <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: 'clamp(0.75rem, 3vw, 1.5rem)', color: result === 'You Win!' ? 'var(--success)' : (result === 'Draw' ? 'var(--text-primary)' : 'var(--danger)') }}>
                                    {result}
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 5vw, 3rem)', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'var(--bg-card)', borderRadius: '50%', border: '3px solid var(--success)', boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}>
                                            <span style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>{playerChoice.icon}</span>
                                        </div>
                                        <span style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 'bold' }}>You</span>
                                    </div>
                                    <div style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>VS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'var(--bg-card)', borderRadius: '50%', border: '3px solid var(--danger)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}>
                                            <span style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>{computerChoice.icon}</span>
                                        </div>
                                        <span style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 'bold' }}>CPU</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', color: 'var(--text-secondary)' }}>Choose your weapon!</p>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        {CHOICES.map((choice) => (
                            <button
                                key={choice.id}
                                onClick={() => handleChoice(choice)}
                                disabled={isAnimating}
                                className="btn"
                                style={{
                                    flexDirection: 'column',
                                    padding: '1.5rem',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '2px solid rgba(56, 189, 248, 0.3)',
                                    gap: '0.75rem',
                                    opacity: isAnimating ? 0.5 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => !isAnimating && (e.currentTarget.style.transform = 'translateY(-5px)')}
                                onMouseOut={(e) => !isAnimating && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <span style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>{choice.icon}</span>
                                <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', textTransform: 'capitalize' }}>{choice.name}</span>
                            </button>
                        ))}
                    </div>

                    <button onClick={resetGame} className="btn btn-primary" style={{ width: '100%', padding: 'clamp(0.75rem, 2.5vw, 1rem)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}>
                        <RefreshCw size={20} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                        <span>Reset Score</span>
                    </button>
                </div>
            </div >
            <style>{`
@keyframes bounce {
    0 %, 100 % { transform: translateY(0); }
    50 % { transform: translateY(-20px); }
}
`}</style>
        </div >
    );
};

export default RockPaperScissors;
