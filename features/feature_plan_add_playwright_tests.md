# Plan: add Playwright tests for Asteroid Escape

## Problem

The repository has no automated test runner today. It is a Phaser 3 + TypeScript + Vite browser game with scene-driven flow (`BootScene` -> `StartScene` -> `GameScene` -> `GameOverScene` / `VictoryScene`), and the current implementation is keyboard-driven even though the spec and README describe touch controls. Adding Playwright test coverage needs both a browser-test setup and a way to make Phaser gameplay assertions reliable instead of timing-sensitive.

## Current state

- Build validation exists via `npm run build` (`tsc && vite build`).
- There is no existing `test`, `lint`, or Playwright config in `package.json`.
- The app mounts into `#game` in `index.html` and renders via Phaser canvas.
- Most gameplay logic lives in `src/game/scenes/GameScene.ts`.
- Scene changes are triggered by in-canvas text objects, not DOM buttons.
- Important player-visible flows worth covering:
  - Start screen -> start game
  - Gameplay HUD appears (score, health, level)
  - Player can lose and reach `GameOverScene`
  - Retry restarts gameplay
  - Final survival / victory flow exists, but is harder to reach deterministically with the current code

## Proposed approach

**Confirmed scope:** start with a **smoke-flow-only** Playwright rollout. The initial implementation should focus on reliable scene-flow coverage, not broad gameplay assertions or cross-browser expansion.

1. Add Playwright as the browser test runner and wire scripts/config for local and CI-friendly execution.
2. Add a lightweight testability layer in the game code so Playwright can observe and drive scene state without depending on fragile pixel checks or long real-time waits.
3. Start with deterministic end-to-end smoke coverage for the main scene transitions, and explicitly defer deeper gameplay assertions until after the first Playwright foundation is stable.

## Recommended test strategy

Use **Playwright E2E tests against a local Vite server** rather than unit tests first. Because Phaser renders to canvas, robust tests will need small test-only hooks such as:

- exposing the active Phaser game / scene in a controlled way during tests
- allowing deterministic seeding or helper methods for spawning/collisions
- optionally supporting a test mode flag to disable randomness or shorten timers
- adding stable scene identifiers or debug state that Playwright can inspect from the page context

Without those hooks, tests would mostly be brittle timing checks around canvas rendering.

## Planned work

### 1. Add Playwright infrastructure

- install Playwright and browser dependencies
- add `playwright.config.ts`
- add `tests/` (or `e2e/`) with a first spec file
- add `package.json` scripts for:
  - full test run
  - headed/debug run
  - single spec run
- configure Playwright `webServer` to start the Vite app automatically for tests

### 2. Add testability hooks in the game

- expose a safe test handle from `src/main.ts` in test mode only
- make it possible to identify the current scene from Playwright
- add deterministic helpers for state setup that avoid fighting Phaser randomness
- keep test hooks isolated so normal gameplay behavior stays unchanged outside test mode

### 3. Implement the first deterministic scenarios

- app loads and shows the Start scene
- starting the game enters `GameScene`
- HUD elements for score / hearts / level are present after game start
- forced loss transitions to `GameOverScene`
- clicking Retry restarts `GameScene`

### 4. Follow-on expansion after the first milestone

- deterministic projectile-hit / score-increase scenario
- level transition scenario
- victory scenario
- optional viewport profile for tablet-sized browser coverage

These are **not part of the initial smoke-only implementation**.

## Files likely involved

- `package.json`
- `playwright.config.ts` (new)
- `tests/` or `e2e/` specs (new)
- `src/main.ts`
- `src/game/scenes/GameScene.ts`
- possibly `src/game/scenes/StartScene.ts`, `GameOverScene.ts`, and `VictoryScene.ts` for stable scene/test metadata

## Notes and considerations

- Because UI is canvas-based, prefer page-evaluated Phaser state over screenshot assertions for core flow tests.
- The current repo has a Playwright MCP server configured for VS Code, but that is separate from adding Playwright as a project test dependency.
- The README/spec currently describe touch behavior that the implementation does not yet provide; the first test plan should target actual shipped keyboard-based behavior unless the scope explicitly includes implementing touch controls first.
- A good first milestone is a small, deterministic smoke suite rather than broad gameplay coverage.

## Draft todos

1. Add Playwright dependencies, config, and npm scripts.
2. Design a minimal test mode / debug API for Phaser scene inspection and deterministic setup.
3. Add the first E2E smoke specs for start, game over, and retry.
4. Defer deeper gameplay scenarios until after the smoke suite is stable.
