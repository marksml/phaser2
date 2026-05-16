import { test, expect, type Page } from '@playwright/test';
import type Phaser from 'phaser';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait until window.__PHASER_GAME__ is available and at least one scene is running. */
async function waitForGame(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const g = window.__PHASER_GAME__;
    return g != null && g.scene.getScenes(true).length > 0;
  });
}

/** Return the keys of all currently active (running) scenes. */
async function getActiveSceneKeys(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    (window.__PHASER_GAME__ as Phaser.Game).scene
      .getScenes(true)
      .map((s) => s.scene.key)
  );
}

/** Start a named scene programmatically, bypassing canvas interaction. */
async function startScene(page: Page, key: string, data?: Record<string, unknown>): Promise<void> {
  await page.evaluate(
    ([sceneKey, sceneData]) => {
      (window.__PHASER_GAME__ as Phaser.Game).scene.start(
        sceneKey as string,
        sceneData as Record<string, unknown>
      );
    },
    [key, data ?? {}] as const
  );
}

/** Call forceGameOver() on the active GameScene instance. */
async function forceGameOver(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    // GameScene exposes forceGameOver() as a public test helper
    (game.scene.getScene('GameScene') as { forceGameOver(): void }).forceGameOver();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
});

test('app loads and shows StartScene', async ({ page }) => {
  const activeScenes = await getActiveSceneKeys(page);
  expect(activeScenes).toContain('StartScene');
});

test('starting the game enters GameScene with HUD', async ({ page }) => {
  await startScene(page, 'GameScene');

  // Wait for GameScene to become the active scene
  await page.waitForFunction(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    return game.scene.getScenes(true).some((s) => s.scene.key === 'GameScene');
  });

  const activeScenes = await getActiveSceneKeys(page);
  expect(activeScenes).toContain('GameScene');

  // Verify HUD elements (score, health, level) exist in GameScene display list
  const hudPresent = await page.evaluate(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    const gameScene = game.scene.getScene('GameScene');
    if (!gameScene) return false;
    const texts = gameScene.children.list.filter(
      (obj) => obj instanceof Phaser.GameObjects.Text
    ) as Phaser.GameObjects.Text[];
    const content = texts.map((t) => t.text);
    const hasScore = content.some((t) => t.includes('Scores'));
    const hasHealth = content.some((t) => t.includes('❤') || t.includes('♡'));
    const hasLevel = content.some((t) => t.includes('Level'));
    return hasScore && hasHealth && hasLevel;
  });
  expect(hudPresent).toBe(true);
});

test('forced loss transitions to GameOverScene', async ({ page }) => {
  await startScene(page, 'GameScene');

  await page.waitForFunction(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    return game.scene.getScenes(true).some((s) => s.scene.key === 'GameScene');
  });

  await forceGameOver(page);

  await page.waitForFunction(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    return game.scene.getScenes(true).some((s) => s.scene.key === 'GameOverScene');
  });

  const activeScenes = await getActiveSceneKeys(page);
  expect(activeScenes).toContain('GameOverScene');
});

test('retry from GameOverScene restarts GameScene', async ({ page }) => {
  // Navigate to GameScene and force a game over first
  await startScene(page, 'GameScene');
  await page.waitForFunction(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    return game.scene.getScenes(true).some((s) => s.scene.key === 'GameScene');
  });

  await forceGameOver(page);
  await page.waitForFunction(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    return game.scene.getScenes(true).some((s) => s.scene.key === 'GameOverScene');
  });

  // Trigger retry via scene start (mirrors what the Retry button does)
  await startScene(page, 'GameScene');

  await page.waitForFunction(() => {
    const game = window.__PHASER_GAME__ as Phaser.Game;
    return game.scene.getScenes(true).some((s) => s.scene.key === 'GameScene');
  });

  const activeScenes = await getActiveSceneKeys(page);
  expect(activeScenes).toContain('GameScene');
});
