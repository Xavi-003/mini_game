import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [points, setPoints] = useState(() => parseInt(localStorage.getItem('miniGamePoints')) || 0);
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('miniGameStreak')) || 0);
    const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('miniGameProfile')) || { name: 'Player', avatar: '😎' });
    const [theme, setTheme] = useState(() => localStorage.getItem('miniGameTheme') || '#a855f7'); // Default Purple
    const [scale, setScale] = useState(() => parseFloat(localStorage.getItem('miniGameScale')) || 1);
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('miniGameFavorites')) || []);

    useEffect(() => {
        localStorage.setItem('miniGamePoints', points);
    }, [points]);

    useEffect(() => {
        localStorage.setItem('miniGameStreak', streak);
    }, [streak]);

    useEffect(() => {
        localStorage.setItem('miniGameProfile', JSON.stringify(profile));
    }, [profile]);

    useEffect(() => {
        localStorage.setItem('miniGameTheme', theme);
        document.documentElement.style.setProperty('--accent', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('miniGameScale', scale);
    }, [scale]);

    useEffect(() => {
        localStorage.setItem('miniGameFavorites', JSON.stringify(favorites));
    }, [favorites]);

    const addPoints = (amount) => {
        setPoints(prev => prev + amount);
    };

    const incrementStreak = () => {
        setStreak(prev => prev + 1);
    };

    const resetStreak = () => {
        setStreak(0);
    };

    const updateProfile = (newProfile) => {
        setProfile(prev => ({ ...prev, ...newProfile }));
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
    };

    const updateScale = (newScale) => {
        setScale(newScale);
    };

    const toggleFavorite = (gameId) => {
        setFavorites(prev => {
            if (prev.includes(gameId)) {
                return prev.filter(id => id !== gameId);
            } else {
                return [...prev, gameId];
            }
        });
    };

    return (
        <GameContext.Provider value={{
            points,
            streak,
            profile,
            theme,
            scale,
            favorites,
            addPoints,
            incrementStreak,
            resetStreak,
            updateProfile,
            updateTheme,
            updateScale,
            toggleFavorite
        }}>
            {children}
        </GameContext.Provider>
    );
};
