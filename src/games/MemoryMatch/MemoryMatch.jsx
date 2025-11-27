import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const CARD_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const CARD_PAIRS = [...CARD_EMOJIS, ...CARD_EMOJIS];

const MemoryMatch = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [showWinnerModal, setShowWinnerModal] = useState(false);

    const shuffleCards = () => {
        const shuffled = CARD_PAIRS
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                icon: emoji,
            }));
        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setDisabled(false);
        setShowWinnerModal(false);
        SoundManager.playClick();
    };

    useEffect(() => {
        shuffleCards();
    }, []);

    const handleClick = (id) => {
        if (disabled || flipped.includes(id) || solved.includes(id)) return;

        SoundManager.playClick();

        if (flipped.length === 0) {
            setFlipped([id]);
            return;
        }

        if (flipped.length === 1) {
            setDisabled(true);
            setFlipped([...flipped, id]);
            setMoves((prev) => prev + 1);

            const firstCard = cards.find((card) => card.id === flipped[0]);
            const secondCard = cards.find((card) => card.id === id);

            if (firstCard.icon === secondCard.icon) {
                setSolved([...solved, flipped[0], id]);
                setFlipped([]);
                setDisabled(false);
                SoundManager.playPoint();

                if (solved.length + 2 === cards.length) {
                    setTimeout(() => {
                        SoundManager.playWin();
                        addPoints(20);
                        incrementStreak();
                        setShowWinnerModal(true);
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        }
    };

    const isWon = solved.length === cards.length && cards.length > 0;

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', maxHeight: '100vh', padding: '1rem', overflow: 'hidden' }}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Memory Match"
                instructions={[
                    "Click on a card to flip it over.",
                    "Click on a second card to try and find a match.",
                    "If the icons match, they stay flipped.",
                    "If they don't match, they flip back over.",
                    "Find all matching pairs in the fewest moves possible!"
                ]}
            />

            <WinnerModal
                isOpen={showWinnerModal}
                onClose={() => setShowWinnerModal(false)}
                winner="You"
                pointsEarned={20}
            />

            {showIntro && <GameIntro gameId="memory" onComplete={() => setShowIntro(false)} />}

            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexShrink: 0 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }} onClick={() => SoundManager.playClick()}>
                        <ArrowLeft size={20} /> Back
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                            Moves: {moves}
                        </div>
                        <button onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }} className="btn" style={{ padding: '0.5rem' }}><HelpCircle size={20} /></button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', justifyContent: 'space-between' }}>
                <h2 className="title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', flexShrink: 0 }}>Memory Match</h2>

                {isWon && (
                    <div style={{ marginBottom: '0.5rem', color: 'var(--success)', fontSize: '1rem', fontWeight: 'bold', animation: 'bounce 0.5s ease', flexShrink: 0 }}>
                        🎉 You Won in {moves} moves!
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    flex: '0 1 auto',
                    aspectRatio: '1',
                    maxWidth: '400px',
                    width: '100%',
                    margin: '0 auto 0.75rem auto'
                }}>
                    {cards.map((card) => {
                        const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
                        return (
                            <button
                                key={card.id}
                                onClick={() => handleClick(card.id)}
                                style={{
                                    aspectRatio: '1',
                                    backgroundColor: isFlipped ? 'var(--bg-card)' : 'var(--accent)',
                                    border: isFlipped ? '2px solid var(--accent)' : 'none',
                                    borderRadius: 'var(--radius)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: isFlipped ? 'default' : 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                                    position: 'relative',
                                    perspective: '1000px',
                                    boxShadow: isFlipped ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.3)'
                                }}
                            >
                                {isFlipped && <span style={{ fontSize: '2rem', transform: 'rotateY(180deg)' }}>{card.icon}</span>}
                            </button>
                        );
                    })}
                </div>

                <button onClick={shuffleCards} className="btn btn-primary" style={{ width: '100%', fontSize: '0.95rem', padding: '0.65rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}>
                    <RefreshCw size={20} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                    <span>Restart Game</span>
                </button>
            </div>
            <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
};

export default MemoryMatch;
