# 🐍 Neon Snake

A modern, retro-styled Snake game built with **React** and **Vite**. Features a glowing neon aesthetic, particle explosion effects, and a local high-score system.

![Neon Snake Game](https://via.placeholder.com/800x400?text=Neon+Snake+Gameplay)

## ✨ Features

- **Neon Aesthetics**: Glowing visuals, retro fonts (Press Start 2P), and glassmorphism UI.
- **Classic Gameplay**: Smooth snake movement and controls.
- **Explosive Effects**: Particle explosions when you crash! 💥
- **Login System**: Simple username entry to track your personal bests (stored locally).
- **Scoreboard**: Tracks top 50 scores with timestamps.
- **Responsive**: Works on desktop (Arrow keys/WASD) and mobile (Touch D-Pad).

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Graphics**: HTML5 Canvas API
- **Styling**: Vanilla CSS (CSS Variables, Keyframe Animations)
- **State**: React Context API
- **Testing**: Playwright (E2E Testing)

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 How to Play

1. Enter your name and click **Start Playing**.
2. Click **Start Game** on the canvas overlay.
3. Use **Arrow Keys** or **WASD** to control the snake.
4. Eat the **Pink Food** to grow and gain points (+10).
5. Avoid hitting the walls or yourself!
6. Press **Space** to Pause/Resume.

## 🧪 Testing & Demo

This project includes a comprehensive E2E test suite using **Playwright**.

- **Run Tests**:
  ```bash
  npm test
  ```

- **Watch Auto-Demo**:
  Watch an automated script play the game for you!
  ```bash
  npm run demo
  ```

## 📂 Project Structure

```
src/
├── components/     # UI Components (GameCanvas, ScoreBoard, etc.)
├── context/        # State Management (AuthContext, GameDataContext)
├── hooks/          # Game Logic (useSnakeGame)
├── index.css       # Design System & Global Styles
└── App.jsx         # Main Application Layout
```

---

*Built with ❤️ by Antigravity*
