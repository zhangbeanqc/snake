import { createContext, useContext, useState, useEffect } from 'react';

const GameDataContext = createContext(null);

const STORAGE_KEY = 'snake_scores';

export function GameDataProvider({ children }) {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        // Load scores from localStorage on mount
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setScores(JSON.parse(stored));
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const addScore = (score, username) => {
        const newEntry = {
            id: Date.now(),
            score,
            username,
            datetime: new Date().toISOString(),
        };
        const updated = [newEntry, ...scores].slice(0, 50); // Keep last 50 scores
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setScores(updated);
    };

    const getHighScore = () => {
        if (scores.length === 0) return 0;
        return Math.max(...scores.map((s) => s.score));
    };

    const clearScores = () => {
        localStorage.removeItem(STORAGE_KEY);
        setScores([]);
    };

    return (
        <GameDataContext.Provider value={{ scores, addScore, getHighScore, clearScores }}>
            {children}
        </GameDataContext.Provider>
    );
}

export function useGameData() {
    const context = useContext(GameDataContext);
    if (!context) {
        throw new Error('useGameData must be used within GameDataProvider');
    }
    return context;
}
