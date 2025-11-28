import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';
import GameContainer from '../../components/GameContainer';
import useGameScale from '../../hooks/useGameScale';

const CARD_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const CARD_PAIRS = [...CARD_EMOJIS, ...CARD_EMOJIS];

/* ===================================
   MEMORY MATCH GAME
   =================================== */

const MemoryMatch = () => {
    const { addPoints, incrementStreak } = useGame();
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [moves, setMoves] = useState(0);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const containerRef = useRef(null);
    const scale = useGameScale(containerRef, 600, 800); // Approximate dimensions

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

    if (showIntro) {
        return <GameIntro gameId="memory" onComplete={() => setShowIntro(false)} />;
    }

    const headerContent = (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
        }}>
            <Link
                to="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)'
                }}
                onClick={() => SoundManager.playClick()}
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'bold',
                    color: 'var(--accent)'
                }}>
                    Moves: {moves}
                </div>
                <button
                    onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }}
                    className="btn btn-secondary"
                    style={{ padding: 'var(--space-sm)', minWidth: '44px' }}
                    aria-label="Help"
                >
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    );

    const footerContent = (
        <button
            onClick={shuffleCards}
            className="btn btn-primary"
            style={{
                width: '100%',
                fontSize: 'var(--text-base)',
                padding: 'var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-xs)'
            }}
        >
            <RefreshCw size={20} />
            <span>Restart Game</span>
        </button>
    );

    return (
        <GameContainer header={headerContent} footer={footerContent}>
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
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    textAlign: 'center',
                    padding: 'var(--space-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-md)',
                    width: '600px' // Fixed width for scaling
                }}>
                    <h2 className="title" style={{
                        fontSize: 'var(--text-xl)',
                        marginBottom: '0'
                    }}>
                        Memory Match
                    </h2>

                    {isWon && (
                        <div style={{
                            color: 'var(--success)',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'bold',
                            animation: 'bounce 0.5s ease'
                        }}>
                            🎉 You Won in {moves} moves!
                        </div>
                    )}

                    {/* Card Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 'var(--space-sm)',
                        aspectRatio: '1',
                        width: '100%',
                        margin: '0 auto'
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
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isFlipped ? 'default' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                                        boxShadow: isFlipped ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.3)',
                                        minHeight: '44px',
                                        minWidth: '44px'
                                    }}
                                    disabled={isFlipped}
                                    aria-label={isFlipped ? `Card ${card.id + 1}: ${card.icon}` : `Card ${card.id + 1}`}
                                >
                                    {isFlipped && (
                                        <span style={{
                                            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                                            transform: 'rotateY(180deg)'
                                        }}>
                                            {card.icon}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </GameContainer>
    );
};

export default MemoryMatch;
