import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';
import GameContainer from '../../components/GameContainer';

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
    const [gameStarted, setGameStarted] = useState(false);
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
        setGameStarted(true);
        SoundManager.playClick();
    };

    useEffect(() => {
        // Initialize cards but don't start the game until button press
        const shuffled = CARD_PAIRS
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                icon: emoji,
            }));
        setCards(shuffled);
    }, []);

    const handleClick = (id) => {
        if (!gameStarted || disabled || flipped.includes(id) || solved.includes(id)) return;

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
                className="btn"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                    padding: 'var(--space-xs) var(--space-sm)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)'
                }}
                onClick={() => SoundManager.playClick()}
            >
                <ArrowLeft size={16} />
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
            onClick={gameStarted ? shuffleCards : shuffleCards}
            className="btn btn-primary"
            style={{
                width: '100%',
                maxWidth: '400px',
                fontSize: 'var(--text-base)',
                padding: 'var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-xs)'
            }}
        >
            {gameStarted ? (
                <>
                    <RefreshCw size={20} />
                    <span>Restart Game</span>
                </>
            ) : (
                <>
                    <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>✨</span>
                    <span>Start Game</span>
                </>
            )}
        </button>
    );

    return (
        <>
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

            <GameContainer header={headerContent} footer={footerContent}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-md)'
                }}>
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                        <h2 className="title title-gradient" style={{
                            fontSize: 'var(--text-2xl)',
                            marginBottom: '0'
                        }}>
                            Memory Match
                        </h2>

                        {isWon && (
                            <div className="animate-bounce-slow" style={{
                                color: 'var(--success)',
                                fontSize: 'var(--text-lg)',
                                fontWeight: 'bold',
                                marginTop: 'var(--space-sm)',
                                textShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                            }}>
                                🎉 You Won in {moves} moves!
                            </div>
                        )}
                    </div>

                    {/* Intrinsic Responsiveness Card Grid container */}
                    <div style={{
                        flex: 1,
                        width: '100%',
                        minHeight: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            height: '100%',
                            maxHeight: '500px',
                            maxWidth: '100%',
                            aspectRatio: '1',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 'var(--space-sm)',
                        }}>
                            {cards.map((card) => {
                                const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
                                return (
                                    <button
                                        key={card.id}
                                        onClick={() => handleClick(card.id)}
                                        style={{
                                            aspectRatio: '1',
                                            backgroundColor: isFlipped ? 'var(--bg-panel)' : 'var(--accent)',
                                            border: isFlipped ? '2px solid var(--border-glass)' : 'none',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: isFlipped ? 'default' : 'pointer',
                                            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0) scale(1)',
                                            boxShadow: isFlipped ? 'var(--shadow-sm)' : 'var(--shadow-md)',
                                            minHeight: '44px',
                                            minWidth: '44px',
                                            padding: '0'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFlipped && !disabled) e.currentTarget.style.transform = 'rotateY(0) scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFlipped) e.currentTarget.style.transform = 'rotateY(0) scale(1)';
                                        }}
                                        disabled={isFlipped || disabled}
                                        aria-label={isFlipped ? `Card ${card.id + 1}: ${card.icon}` : `Card ${card.id + 1}`}
                                    >
                                        {isFlipped && (
                                            <span style={{
                                                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                                transform: 'rotateY(180deg)',
                                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
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
        </>
    );
};

export default MemoryMatch;
