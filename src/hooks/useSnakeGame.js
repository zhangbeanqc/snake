import { useState, useCallback, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // ms per tick
const SPEED_INCREMENT = 5; // decrease ms every food eaten

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

const getRandomPosition = (gridWidth, gridHeight, exclude = []) => {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight),
        };
    } while (exclude.some((p) => p.x === pos.x && p.y === pos.y));
    return pos;
};

export function useSnakeGame(gridWidth, gridHeight, onGameOver) {
    const [snake, setSnake] = useState([]);
    const [food, setFood] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
    const [gameState, setGameState] = useState('idle'); // idle, playing, paused, gameover
    const [score, setScore] = useState(0);
    const [speed, setSpeed] = useState(INITIAL_SPEED);

    const directionRef = useRef(direction);
    const gameLoopRef = useRef(null);

    // Initialize game
    const initGame = useCallback(() => {
        const startX = Math.floor(gridWidth / 2);
        const startY = Math.floor(gridHeight / 2);
        const initialSnake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY },
        ];
        setSnake(initialSnake);
        setFood(getRandomPosition(gridWidth, gridHeight, initialSnake));
        setDirection(DIRECTIONS.RIGHT);
        directionRef.current = DIRECTIONS.RIGHT;
        setScore(0);
        setSpeed(INITIAL_SPEED);
        setGameState('idle');
    }, [gridWidth, gridHeight]);

    // Start game
    const startGame = useCallback(() => {
        initGame();
        setGameState('playing');
    }, [initGame]);

    // Pause/Resume
    const togglePause = useCallback(() => {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
    }, []);

    // Change direction
    const changeDirection = useCallback((newDir) => {
        const current = directionRef.current;
        // Prevent 180 degree turns
        if (
            (newDir === DIRECTIONS.UP && current !== DIRECTIONS.DOWN) ||
            (newDir === DIRECTIONS.DOWN && current !== DIRECTIONS.UP) ||
            (newDir === DIRECTIONS.LEFT && current !== DIRECTIONS.RIGHT) ||
            (newDir === DIRECTIONS.RIGHT && current !== DIRECTIONS.LEFT)
        ) {
            setDirection(newDir);
            directionRef.current = newDir;
        }
    }, []);

    // Game tick
    const tick = useCallback(() => {
        setSnake((prevSnake) => {
            const head = prevSnake[0];
            const newHead = {
                x: head.x + directionRef.current.x,
                y: head.y + directionRef.current.y,
            };

            // Check wall collision
            if (newHead.x < 0 || newHead.x >= gridWidth || newHead.y < 0 || newHead.y >= gridHeight) {
                setGameState('gameover');
                return prevSnake;
            }

            // Check self collision (exclude tail as it will move)
            const bodyToCheck = prevSnake.slice(0, -1);
            if (bodyToCheck.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameState('gameover');
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check food collision
            if (newHead.x === food.x && newHead.y === food.y) {
                // Grow snake, don't remove tail
                setScore((prev) => prev + 10);
                setSpeed((prev) => Math.max(50, prev - SPEED_INCREMENT));
                setFood(getRandomPosition(gridWidth, gridHeight, newSnake));
                return newSnake;
            }

            // Remove tail if no food eaten
            newSnake.pop();
            return newSnake;
        });
    }, [gridWidth, gridHeight, food]);

    // Game loop
    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = setInterval(tick, speed);
        } else {
            clearInterval(gameLoopRef.current);
        }
        return () => clearInterval(gameLoopRef.current);
    }, [gameState, speed, tick]);

    // Handle game over
    useEffect(() => {
        if (gameState === 'gameover' && onGameOver) {
            onGameOver(score);
        }
    }, [gameState, score, onGameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing' && gameState !== 'paused') return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    changeDirection(DIRECTIONS.UP);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    changeDirection(DIRECTIONS.DOWN);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    changeDirection(DIRECTIONS.LEFT);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    changeDirection(DIRECTIONS.RIGHT);
                    break;
                case ' ':
                    e.preventDefault();
                    togglePause();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, changeDirection, togglePause]);

    // Initialize on mount
    useEffect(() => {
        initGame();
    }, [initGame]);

    return {
        snake,
        food,
        gameState,
        score,
        speed,
        startGame,
        togglePause,
        changeDirection,
        DIRECTIONS,
        GRID_SIZE,
    };
}
