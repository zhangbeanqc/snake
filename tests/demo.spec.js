import { test } from '@playwright/test';

// Demo test - slow motion to show gameplay
test('Snake Game Demo', async ({ page }) => {
    // Configure for demo
    test.slow(); // 3x timeout

    // Go to game
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Login
    await page.fill('input#username', 'Demo Player');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Start game
    await page.click('.game-overlay button:has-text("Start Game")');
    await page.waitForTimeout(500);

    // Play the game - move around
    const moves = [
        { key: 'ArrowUp', wait: 400 },
        { key: 'ArrowUp', wait: 400 },
        { key: 'ArrowLeft', wait: 400 },
        { key: 'ArrowLeft', wait: 400 },
        { key: 'ArrowDown', wait: 400 },
        { key: 'ArrowDown', wait: 400 },
        { key: 'ArrowRight', wait: 400 },
        { key: 'ArrowRight', wait: 400 },
        { key: 'ArrowUp', wait: 400 },
        { key: 'ArrowLeft', wait: 400 },
        { key: 'ArrowDown', wait: 400 },
        { key: 'ArrowRight', wait: 400 },
    ];

    for (const move of moves) {
        await page.keyboard.press(move.key);
        await page.waitForTimeout(move.wait);
    }

    // Pause demo
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);

    // Resume
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Keep moving until game over (hit wall)
    for (let i = 0; i < 20; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);
    }

    // Wait for explosion and game over
    await page.waitForTimeout(3000);

    // Click play again
    const playAgainBtn = page.locator('.game-overlay button:has-text("Play Again")');
    if (await playAgainBtn.isVisible()) {
        await playAgainBtn.click();
        await page.waitForTimeout(2000);
    }
});
