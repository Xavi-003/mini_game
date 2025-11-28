import React from 'react';
import './GameContainer.css';

const GameContainer = ({ header, children, footer, className = '' }) => {
    return (
        <div className={`game-wrapper ${className}`}>
            <div className="game-header">
                {header}
            </div>

            <div className="game-board-area">
                {children}
            </div>

            {footer && (
                <div className="game-controls">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default GameContainer;
