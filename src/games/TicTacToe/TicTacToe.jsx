import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowLeft, User, Bot, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialModal from '../../components/TutorialModal';
import WinnerModal from '../../components/WinnerModal';
import GameIntro from '../../components/GameIntro';
import { useGame } from '../../context/GameContext';
import SoundManager from '../../utils/SoundManager';

/* ===================================
   TIC TAC TOE GAME
   =================================== */

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
            const availableMoves = currentBoard
                .map((val, idx) => val === null ? idx : null)
                .filter(val => val !== null);

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
            SoundManager.playHover();

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

    // Game Intro Screen
    if (showIntro) {
        return <GameIntro gameId="tictactoe" onComplete={() => setShowIntro(false)} />;
    }

    // Mode Selection Screen
    if (!mode) {
        return (
            <div className="game-container animate-fade-in">
                <div
                    className="card"
                    style={{
                        textAlign: 'center',
                        maxWidth: '600px',
                        width: '100%',
                    }}
                >
                    <h2 className="title" style={{
                        fontSize: 'var(--text-2xl)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Tic Tac Toe
                    </h2>
                    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                        <button
                            onClick={() => { setMode('PVE'); SoundManager.playClick(); }}
                            className="btn btn-primary"
                            style={{
                                fontSize: 'var(--text-base)',
                                padding: 'var(--space-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-sm)'
                            }}
                        >
                            <Bot size={24} />
                            <span>1 Player (vs AI)</span>
                        </button>
                        <button
                            onClick={() => { setMode('PVP'); SoundManager.playClick(); }}
                            className="btn btn-secondary"
                            style={{
                                fontSize: 'var(--text-base)',
                                padding: 'var(--space-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: ' var(--space-sm)'
                            }}
                        >
                            <User size={24} />
                            <span>2 Players</span>
                        </button>
                    </div>
                    <Link
                        to="/"
                        className="btn"
                        style={{
                            marginTop: 'var(--space-lg)',
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)'
                        }}
                        onClick={() => SoundManager.playClick()}
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Main Game Screen
    return (
        <div className="game-container animate-fade-in">
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
                gap: 'var(--space-md)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-sm)'
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
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </Link>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button
                            onClick={() => { setMode(null); SoundManager.playClick(); }}
                            className="btn btn-secondary"
                            style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--text-sm)' }}
                        >
                            Change Mode
                        </button>
                        <button
                            onClick={() => { setIsTutorialOpen(true); SoundManager.playClick(); }}
                            className="btn btn-secondary"
                            style={{ padding: 'var(--space-sm)', minWidth: '44px' }}
                            aria-label="Help"
                        >
                            <HelpCircle size={18} />
                        </button>
                    </div>
                </div>

                {/* Game Card */}
                <div className="card" style={{
                    textAlign: 'center',
                    padding: 'var(--space-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-md)'
                }}>
                    {/* Score Board */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-sm)',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                                Player 1 (X)
                            </div>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--accent)' }}>
                                {scores.p1}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                                Draws
                            </div>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>
                                {scores.draws}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                                {mode === 'PVE' ? 'AI (O)' : 'Player 2 (O)'}
                            </div>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--danger)' }}>
                                {scores.p2}
                            </div>
                        </div>
                    </div>

                    {/* Turn Indicator */}
                    <div style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'bold',
                        color: winner ? (winner === 'Draw' ? 'var(--text-primary)' : 'var(--success)') : 'var(--accent)',
                        minHeight: '28px'
                    }}>
                        {winner
                            ? (winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner === 'X' ? 'Player 1' : (mode === 'PVE' ? 'AI' : 'Player 2')}!`)
                            : (isAiThinking ? 'AI is thinking...' : `Turn: ${isXNext ? 'Player 1 (X)' : (mode === 'PVE' ? 'AI (O)' : 'Player 2 (O)')}`)}
                    </div>

                    {/* Game Board */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--space-sm)',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: 'var(--space-sm)',
                        borderRadius: 'var(--radius-lg)',
                        aspectRatio: '1',
                        maxWidth: 'min(500px, 60vh)',
                        width: '100%',
                        margin: '0 auto'
                    }}>
                        {board.map((square, i) => (
                            <button
                                key={i}
                                onClick={() => handleClick(i)}
                                style={{
                                    aspectRatio: '1',
                                    fontSize: 'clamp(2rem, 8vw, 3rem)',
                                    fontWeight: 'bold',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '2px solid rgba(56, 189, 248, 0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    color: square === 'X' ? 'var(--accent)' : (square === 'O' ? 'var(--danger)' : 'transparent'),
                                    cursor: (winner || square || (mode === 'PVE' && !isXNext)) ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all var(--transition-base)',
                                    boxShadow: square ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                                    opacity: (winner || square || (mode === 'PVE' && !isXNext)) ? (square ? '1' : '0.7') : '1',
                                    minHeight: '44px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!winner && !square && !(mode === 'PVE' && !isXNext)) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                disabled={!!(winner || square || (mode === 'PVE' && !isXNext))}
                                aria-label={`Cell ${i + 1}, ${square || 'empty'}`}
                            >
                                {square}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--space-sm)',
                        width: '100%'
                    }}>
                        <button
                            onClick={resetGame}
                            className="btn btn-primary"
                            style={{
                                fontSize: 'var(--text-base)',
                                padding: 'var(--space-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-xs)'
                            }}
                        >
                            <RefreshCw size={20} />
                            <span>Play Again</span>
                        </button>
                        <button
                            onClick={resetScores}
                            className="btn btn-secondary"
                            style={{
                                fontSize: 'var(--text-base)',
                                padding: 'var(--space-md)'
                            }}
                        >
                            Reset Scores
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TicTacToe;
