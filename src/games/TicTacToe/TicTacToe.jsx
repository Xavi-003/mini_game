
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowLeft, User, Bot, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

const TicTacToe = () => {
    const { addPoints, incrementStreak, resetStreak } = useGame();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [mode, setMode] = useState(null); // 'PVP' or 'PVE'
    const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleWin = useCallback((result) => {
        if (result === 'Draw') {
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
            SoundManager.playLose(); // Or a draw sound
            resetStreak();
        } else if (result === 'X') {
            setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
            SoundManager.playWin();
            addPoints(10);
            incrementStreak();
            setShowWinnerModal(true);
        } else {
            setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
            SoundManager.playLose();
            resetStreak();
        }
    }, [addPoints, incrementStreak, resetStreak]);

    const makeAiMove = useCallback((currentBoard) => {
        setIsAiThinking(true);
        setTimeout(() => {
            const availableMoves = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

            // Simple AI: Try to win, then block, then random
            let move = -1;

            // 1. Try to win
            for (let i of availableMoves) {
                const tempBoard = [...currentBoard];
                tempBoard[i] = 'O';
                if (checkWinner(tempBoard) === 'O') {
                    move = i;
                    break;
                }
            }

            // 2. Block player
            if (move === -1) {
                for (let i of availableMoves) {
                    const tempBoard = [...currentBoard];
                    tempBoard[i] = 'X';
                    if (checkWinner(tempBoard) === 'X') {
                        move = i;
                        break;
                    }
                }
            }

            // 3. Random
            if (move === -1) {
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }

            const newBoard = [...currentBoard];
            newBoard[move] = 'O';
            setBoard(newBoard);
            SoundManager.playHover(); // AI move sound

            const gameWinner = checkWinner(newBoard);
            if (gameWinner) {
                setWinner(gameWinner);
                handleWin(gameWinner);
            } else if (!newBoard.includes(null)) {
                setWinner('Draw');
                handleWin('Draw');
            } else {
                setIsXNext(true);
            }
            setIsAiThinking(false);
        }, 500);
    }, [handleWin]);

    const handleClick = (i) => {
        if (winner || board[i] || (mode === 'PVE' && !isXNext && !winner)) return;

        SoundManager.playClick();
        const newBoard = [...board];
        newBoard[i] = isXNext ? 'X' : 'O';
        setBoard(newBoard);

        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
            setWinner(gameWinner);
            handleWin(gameWinner);
        } else if (!newBoard.includes(null)) {
            setWinner('Draw');
            handleWin('Draw');
        } else {
            setIsXNext(!isXNext);
        }
    };

    useEffect(() => {
        if (mode === 'PVE' && !isXNext && !winner) {
            makeAiMove(board);
        }
    }, [isXNext, mode, winner, board, makeAiMove]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setShowWinnerModal(false);
        SoundManager.playClick();
    };

    const resetScores = () => {
        setScores({ p1: 0, p2: 0, draws: 0 });
        resetGame();
    };

    if (!mode) {
        return (
            <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)', maxHeight: '100vh', padding: '0.5rem 1rem', overflow: 'hidden' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '600px', width: '100%', padding: '3rem' }}>
                    <h2 className="title" style={{ fontSize: '3rem', marginBottom: '3rem' }}>Tic Tac Toe</h2>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <button onClick={() => { setMode('PVE'); SoundManager.playClick(); }} className="btn btn-primary" style={{ fontSize: '1.5rem', padding: '2rem' }}>
                            <Bot size={40} style={{ marginRight: '1rem' }} />
                            1 Player (vs AI)
                        </button>
                        <button onClick={() => { setMode('PVP'); SoundManager.playClick(); }} className="btn" style={{ fontSize: '1.5rem', padding: '2rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                            <User size={40} style={{ marginRight: '1rem' }} />
                            2 Players
                        </button>
                    </div>
                    <Link to="/" className="btn" style={{ marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }} onClick={() => SoundManager.playClick()}>
                        <ArrowLeft size={24} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            maxHeight: '100vh',
            padding: '1rem',
            overflow: 'hidden'
        }}>
            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                title="Tic Tac Toe"
                instructions={[
                    "Choose your game mode: 1 Player (vs AI) or 2 Players.",
                    "Player 1 is X, Player 2 (or AI) is O.",
                    "Take turns placing your mark in an empty square.",
                    "The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner.",
                    "If all 9 squares are full and no player has 3 marks in a row, the game is a draw."
                ]}
            />

            <WinnerModal
                isOpen={showWinnerModal}
                onClose={() => setShowWinnerModal(false)}
                winner={winner === 'X' ? 'Player 1' : (mode === 'PVE' ? 'AI' : 'Player 2')}
                pointsEarned={winner === 'X' ? 10 : 0}
            />

            <div style={{
                width: '100%',
                maxWidth: '650px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '900px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexShrink: 0
                }}>
                    <Link to="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem'
                    }} onClick={() => SoundManager.playClick()}>
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => { setMode(null); SoundManager.playClick(); }}
                            className="btn"
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                        >
                            Change Mode
                        </button>
                        <button
                            onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }}
                            className="btn"
                            style={{ padding: '0.5rem' }}
                        >
                            <HelpCircle size={18} />
                        </button>
                    </div>
                </div>

                {/* Game Card */}
                <div className="card" style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    minHeight: 0,
                    justifyContent: 'space-between'
                }}>
                    {/* Score Board */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 'var(--radius)',
                        flexShrink: 0
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Player 1 (X)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent)' }}>{scores.p1}</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Draws</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{scores.draws}</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{mode === 'PVE' ? 'AI (O)' : 'Player 2 (O)'}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--danger)' }}>{scores.p2}</div>
                        </div>
                    </div>

                    {/* Turn Indicator */}
                    <div style={{
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: winner ? (winner === 'Draw' ? 'var(--text-primary)' : 'var(--success)') : 'var(--text-primary)',
                        minHeight: '1.75rem',
                        flexShrink: 0
                    }}>
                        {winner ? (winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner === 'X' ? 'Player 1' : (mode === 'PVE' ? 'AI' : 'Player 2')}!`) : (isAiThinking ? 'AI is thinking...' : `Turn: ${isXNext ? 'Player 1 (X)' : (mode === 'PVE' ? 'AI (O)' : 'Player 2 (O)')}`)}
                    </div>

                    {/* Game Board */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        flex: '0 1 auto',
                        aspectRatio: '1',
                        maxWidth: '500px',
                        width: '100%',
                        margin: '0 auto 1rem auto'
                    }}>
                        {board.map((square, i) => (
                            <button
                                key={i}
                                onClick={() => handleClick(i)}
                                style={{
                                    aspectRatio: '1',
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '2px solid rgba(56, 189, 248, 0.3)',
                                    borderRadius: '1rem',
                                    color: square === 'X' ? 'var(--accent)' : (square === 'O' ? 'var(--danger)' : 'var(--text-secondary)'),
                                    cursor: (winner || square || (mode === 'PVE' && !isXNext)) ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: square ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                                    opacity: (winner || square || (mode === 'PVE' && !isXNext)) ? (square ? '1' : '0.7') : '1'
                                }}
                                onMouseEnter={(e) => {
                                    if (!winner && !square && !(mode === 'PVE' && !isXNext)) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {square}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexShrink: 0,
                        marginTop: 'auto',
                        width: '100%'
                    }}>
                        <button
                            onClick={resetGame}
                            className="btn btn-primary"
                            style={{
                                flex: '1 1 0',
                                fontSize: '1rem',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 0
                            }}
                        >
                            <RefreshCw size={20} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                            <span>Play Again</span>
                        </button>
                        <button
                            onClick={resetScores}
                            className="btn"
                            style={{
                                flex: '1 1 0',
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--bg-card)',
                                fontSize: '1rem',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 0
                            }}
                        >
                            <span>Reset Scores</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicTacToe;
