import { useRef, useEffect, useCallback, useState } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { useGameData } from '../context/GameDataContext';
import { useAuth } from '../context/AuthContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const CELL_SIZE = 20;
const GRID_WIDTH = CANVAS_WIDTH / CELL_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / CELL_SIZE;

// Explosion particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.size = Math.random() * 8 + 4;
        this.hue = Math.random() > 0.5 ? 140 : 340; // Green or pink
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += 0.1; // Gravity
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export default function GameCanvas() {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationRef = useRef(null);
    const [isExploding, setIsExploding] = useState(false);
    const prevGameStateRef = useRef('idle');
    const { addScore } = useGameData();
    const { user } = useAuth();

    const handleGameOver = useCallback((finalScore) => {
        if (user) {
            addScore(finalScore, user.username);
        }
    }, [addScore, user]);

    const {
        snake,
        food,
        gameState,
        score,
        startGame,
        togglePause,
        changeDirection,
        DIRECTIONS,
    } = useSnakeGame(GRID_WIDTH, GRID_HEIGHT, handleGameOver);

    // Trigger explosion when game state changes to gameover
    useEffect(() => {
        if (gameState === 'gameover' && prevGameStateRef.current === 'playing') {
            // Create explosion at snake head position
            if (snake.length > 0) {
                const head = snake[0];
                const centerX = head.x * CELL_SIZE + CELL_SIZE / 2;
                const centerY = head.y * CELL_SIZE + CELL_SIZE / 2;

                // Create particles
                const newParticles = [];
                for (let i = 0; i < 50; i++) {
                    newParticles.push(new Particle(centerX, centerY));
                }
                // Also explode each body segment
                snake.forEach((segment, index) => {
                    if (index > 0) {
                        const x = segment.x * CELL_SIZE + CELL_SIZE / 2;
                        const y = segment.y * CELL_SIZE + CELL_SIZE / 2;
                        for (let i = 0; i < 5; i++) {
                            newParticles.push(new Particle(x, y));
                        }
                    }
                });

                particlesRef.current = newParticles;
                setIsExploding(true);
            }
        }
        prevGameStateRef.current = gameState;
    }, [gameState, snake]);

    // Explosion animation loop
    useEffect(() => {
        if (!isExploding) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const animate = () => {
            // Semi-transparent clear for trail effect
            ctx.fillStyle = 'rgba(0, 10, 5, 0.15)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);
            particlesRef.current.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            if (particlesRef.current.length > 0) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setIsExploding(false);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isExploding]);

    // Draw game (when not exploding)
    useEffect(() => {
        if (isExploding) return; // Don't draw game during explosion

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 10, 5, 0.95)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }

        // Draw food
        const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
        const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;

        // Food glow
        const gradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, CELL_SIZE);
        gradient.addColorStop(0, 'rgba(255, 0, 128, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 128, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 128, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(food.x * CELL_SIZE - CELL_SIZE / 2, food.y * CELL_SIZE - CELL_SIZE / 2, CELL_SIZE * 2, CELL_SIZE * 2);

        // Food body
        ctx.fillStyle = '#ff0080';
        ctx.shadowColor = '#ff0080';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(foodX, foodY, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw snake
        snake.forEach((segment, index) => {
            const x = segment.x * CELL_SIZE;
            const y = segment.y * CELL_SIZE;

            // Gradient from head to tail
            const hue = 140 + (index / snake.length) * 40; // Green to cyan
            const lightness = 60 - (index / snake.length) * 20;

            if (index === 0) {
                // Head with glow
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#00ff88';
            } else {
                ctx.shadowBlur = 5;
                ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
            }

            // Draw rounded segment
            const padding = 1;
            const radius = 4;
            ctx.beginPath();
            ctx.roundRect(x + padding, y + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2, radius);
            ctx.fill();

            // Eyes on head
            if (index === 0) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000';
                const eyeSize = 3;
                const eyeOffset = 5;
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE / 2 - eyeOffset, y + CELL_SIZE / 2 - 2, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + CELL_SIZE / 2 + eyeOffset, y + CELL_SIZE / 2 - 2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.shadowBlur = 0;
    }, [snake, food, isExploding]);

    return (
        <div className="game-main">
            {/* HUD */}
            <div className="game-hud">
                <div className="hud-item">
                    <div className="hud-label">Score</div>
                    <div className="hud-value hud-value-large">{score}</div>
                </div>
                <div className="hud-item">
                    <div className="hud-label">Length</div>
                    <div className="hud-value">{snake.length}</div>
                </div>
                <div className="hud-item">
                    <div className="hud-label">Status</div>
                    <div className="hud-value" style={{ color: gameState === 'playing' ? '#00ff88' : '#ff0080' }}>
                        {gameState.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="canvas-wrapper">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="game-canvas"
                />

                {/* Game Over Overlay */}
                {gameState === 'gameover' && !isExploding && (
                    <div className="game-overlay">
                        <h2 className="game-overlay-title">GAME OVER</h2>
                        <p className="game-overlay-score">
                            Final Score: <span>{score}</span>
                        </p>
                        <button className="btn btn-primary" onClick={startGame}>
                            Play Again
                        </button>
                    </div>
                )}

                {/* Start/Paused Overlay */}
                {(gameState === 'idle' || gameState === 'paused') && (
                    <div className="game-overlay">
                        <h2 className="game-overlay-title">
                            {gameState === 'paused' ? 'PAUSED' : 'READY'}
                        </h2>
                        <p className="game-overlay-score">
                            Use Arrow Keys or WASD to move
                        </p>
                        <button className="btn btn-primary" onClick={gameState === 'paused' ? togglePause : startGame}>
                            {gameState === 'paused' ? 'Resume' : 'Start Game'}
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="game-controls">
                {gameState === 'playing' && (
                    <button className="btn btn-secondary btn-small" onClick={togglePause}>
                        Pause (Space)
                    </button>
                )}
            </div>

            {/* Mobile D-Pad */}
            <div className="mobile-controls">
                <div className="mobile-dpad">
                    <button className="dpad-btn dpad-up" onClick={() => changeDirection(DIRECTIONS.UP)}>↑</button>
                    <button className="dpad-btn dpad-left" onClick={() => changeDirection(DIRECTIONS.LEFT)}>←</button>
                    <button className="dpad-btn dpad-right" onClick={() => changeDirection(DIRECTIONS.RIGHT)}>→</button>
                    <button className="dpad-btn dpad-down" onClick={() => changeDirection(DIRECTIONS.DOWN)}>↓</button>
                </div>
            </div>
        </div>
    );
}
