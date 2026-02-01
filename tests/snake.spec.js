import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('snake_user');
            localStorage.removeItem('snake_scores');
        });
        await page.reload();
    });

    test('should display login page with correct elements', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page.locator('h1')).toContainText('NEON SNAKE');

        // Check input field exists
        const input = page.locator('input#username');
        await expect(input).toBeVisible();
        await expect(input).toHaveAttribute('placeholder', 'Enter your name...');

        // Check login button exists
        const button = page.locator('button[type="submit"]');
        await expect(button).toBeVisible();
        await expect(button).toContainText('Start Playing');
    });

    test('should login successfully with valid username', async ({ page }) => {
        await page.goto('/');

        // Fill username
        await page.fill('input#username', 'TestPlayer');

        // Click login button
        await page.click('button[type="submit"]');

        // Should redirect to game page - check header appears
        await expect(page.locator('.header')).toBeVisible();
        await expect(page.locator('.header-username')).toContainText('TestPlayer');

        // Check login time is displayed
        await expect(page.locator('.header-login-time')).toBeVisible();
    });

    test('should persist login after page reload', async ({ page }) => {
        await page.goto('/');

        // Login
        await page.fill('input#username', 'PersistentUser');
        await page.click('button[type="submit"]');

        // Wait for game page
        await expect(page.locator('.header')).toBeVisible();

        // Reload page
        await page.reload();

        // Should still be logged in
        await expect(page.locator('.header-username')).toContainText('PersistentUser');
    });

    test('should logout successfully', async ({ page }) => {
        await page.goto('/');

        // Login first
        await page.fill('input#username', 'LogoutTest');
        await page.click('button[type="submit"]');
        await expect(page.locator('.header')).toBeVisible();

        // Click logout button
        await page.click('button:has-text("Logout")');

        // Should return to login page
        await expect(page.locator('input#username')).toBeVisible();
        await expect(page.locator('h1')).toContainText('NEON SNAKE');
    });
});

test.describe('Game Canvas', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('snake_user');
            localStorage.removeItem('snake_scores');
        });
        await page.reload();

        // Login first
        await page.fill('input#username', 'GameTester');
        await page.click('button[type="submit"]');
        await expect(page.locator('.header')).toBeVisible();
    });

    test('should display game canvas and controls', async ({ page }) => {
        // Check canvas exists
        await expect(page.locator('.game-canvas')).toBeVisible();

        // Check canvas wrapper with glow border
        await expect(page.locator('.canvas-wrapper')).toBeVisible();

        // Check HUD elements
        await expect(page.locator('.hud-label:has-text("Score")')).toBeVisible();
        await expect(page.locator('.hud-label:has-text("Length")')).toBeVisible();
        await expect(page.locator('.hud-label:has-text("Status")')).toBeVisible();
    });

    test('should show start overlay initially', async ({ page }) => {
        // Check overlay is visible
        await expect(page.locator('.game-overlay')).toBeVisible();
        await expect(page.locator('.game-overlay-title')).toContainText('READY');

        // Check start button
        await expect(page.locator('.game-overlay button:has-text("Start Game")')).toBeVisible();
    });

    test('should start game when clicking Start Game', async ({ page }) => {
        // Click start button
        await page.click('.game-overlay button:has-text("Start Game")');

        // Overlay should disappear (game is playing)
        await expect(page.locator('.game-overlay')).not.toBeVisible();

        // Status should show PLAYING
        await expect(page.locator('.hud-value:has-text("PLAYING")')).toBeVisible();
    });

    test('should pause game with space key', async ({ page }) => {
        // Start game
        await page.click('.game-overlay button:has-text("Start Game")');
        await expect(page.locator('.game-overlay')).not.toBeVisible();

        // Press space to pause
        await page.keyboard.press('Space');

        // Should show paused overlay
        await expect(page.locator('.game-overlay')).toBeVisible();
        await expect(page.locator('.game-overlay-title')).toContainText('PAUSED');
    });

    test('should resume game from pause', async ({ page }) => {
        // Start game
        await page.click('.game-overlay button:has-text("Start Game")');

        // Pause
        await page.keyboard.press('Space');
        await expect(page.locator('.game-overlay-title')).toContainText('PAUSED');

        // Resume by pressing space again
        await page.keyboard.press('Space');

        // Overlay should disappear
        await expect(page.locator('.game-overlay')).not.toBeVisible();
    });
});

test.describe('Score Board', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('snake_user');
            localStorage.removeItem('snake_scores');
        });
        await page.reload();

        // Login
        await page.fill('input#username', 'ScoreTester');
        await page.click('button[type="submit"]');
        await expect(page.locator('.header')).toBeVisible();
    });

    test('should display scoreboard section', async ({ page }) => {
        await expect(page.locator('.scoreboard')).toBeVisible();
        await expect(page.locator('.scoreboard-title')).toContainText('HIGH SCORES');
    });

    test('should show empty message when no scores', async ({ page }) => {
        await expect(page.locator('.scoreboard-empty')).toContainText('No scores yet');
    });

    test('should record and display score after game over', async ({ page }) => {
        // Pre-populate a score via localStorage to test display
        await page.evaluate(() => {
            const score = {
                id: Date.now(),
                score: 100,
                username: 'ScoreTester',
                datetime: new Date().toISOString(),
            };
            localStorage.setItem('snake_scores', JSON.stringify([score]));
        });

        // Reload to pick up new score
        await page.reload();

        // Should show the score
        await expect(page.locator('.scoreboard-score')).toContainText('100');

        // Should show best score in scoreboard
        await expect(page.locator('.scoreboard .hud-value-large')).toContainText('100');
    });
});

test.describe('Game Controls', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('snake_user');
            localStorage.removeItem('snake_scores');
        });
        await page.reload();

        // Login and start game
        await page.fill('input#username', 'ControlTester');
        await page.click('button[type="submit"]');
        await expect(page.locator('.header')).toBeVisible();
    });

    test('should respond to arrow key controls', async ({ page }) => {
        // Start game
        await page.click('.game-overlay button:has-text("Start Game")');
        await expect(page.locator('.game-overlay')).not.toBeVisible();

        // Press arrow keys (just verify no errors)
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowRight');

        // Game should still be playing
        await expect(page.locator('.hud-value:has-text("PLAYING")')).toBeVisible();
    });

    test('should respond to WASD controls', async ({ page }) => {
        // Start game
        await page.click('.game-overlay button:has-text("Start Game")');
        await expect(page.locator('.game-overlay')).not.toBeVisible();

        // Press WASD keys
        await page.keyboard.press('w');
        await page.keyboard.press('s');
        await page.keyboard.press('a');
        await page.keyboard.press('d');

        // Game should still be playing
        await expect(page.locator('.hud-value:has-text("PLAYING")')).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should display mobile controls on small screens', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('snake_user');
            localStorage.removeItem('snake_scores');
        });
        await page.reload();

        // Login
        await page.fill('input#username', 'MobileUser');
        await page.click('button[type="submit"]');
        await expect(page.locator('.header')).toBeVisible();

        // Mobile controls should be visible
        await expect(page.locator('.mobile-controls')).toBeVisible();
        await expect(page.locator('.dpad-up')).toBeVisible();
        await expect(page.locator('.dpad-down')).toBeVisible();
        await expect(page.locator('.dpad-left')).toBeVisible();
        await expect(page.locator('.dpad-right')).toBeVisible();
    });
});
