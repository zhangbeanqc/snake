// Standalone Playwright demo script
// Run with: node scripts/run-demo.js

import { chromium } from '@playwright/test';

const GAME_URL = 'http://localhost:5174';

async function runDemo() {
    console.log('🐍 Starting Snake Game Demo...\n');

    // Launch browser
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100 // Slow down actions for visibility
    });

    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });

    const page = await context.newPage();

    try {
        // Navigate to game
        console.log('📍 Opening game...');
        await page.goto(GAME_URL);
        await page.waitForTimeout(1000);

        // Login
        console.log('👤 Logging in...');
        await page.fill('input#username', 'Demo Player');
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // Start game
        console.log('🎮 Starting game...');
        await page.click('.game-overlay button:has-text("Start Game")');
        await page.waitForTimeout(500);

        // Play - move around
        console.log('🕹️ Playing...');
        const moves = [
            'ArrowUp', 'ArrowUp', 'ArrowLeft', 'ArrowLeft',
            'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowRight',
            'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'
        ];

        for (const key of moves) {
            await page.keyboard.press(key);
            await page.waitForTimeout(300);
        }

        // Pause
        console.log('⏸️ Pausing...');
        await page.keyboard.press('Space');
        await page.waitForTimeout(2000);

        // Resume
        console.log('▶️ Resuming...');
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        // Move right until hit wall
        console.log('💥 Moving to trigger explosion...');
        for (let i = 0; i < 25; i++) {
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(150);
        }

        // Wait for explosion
        console.log('🎆 Explosion!');
        await page.waitForTimeout(3000);

        // Play again
        const playAgain = page.locator('.game-overlay button:has-text("Play Again")');
        if (await playAgain.isVisible()) {
            console.log('🔄 Playing again...');
            await playAgain.click();
            await page.waitForTimeout(2000);
        }

        console.log('\n✅ Demo complete! Close the browser window when done.');

        // Keep browser open for user to see
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

runDemo();
