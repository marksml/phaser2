# Feature: Level System

## Overview

Add a data-driven level system to Asteroid Escape. The game currently plays as a single endless session. This feature introduces discrete levels (starting with 3) where difficulty parameters escalate per level. Each level resets health and score. Completing the final level shows a victory screen.

---

## Level Configuration (Data-Driven)

All level parameters are defined in a single configuration array so that adding new levels requires only appending an entry — no logic changes.

```ts
interface LevelConfig {
  level: number;              // 1-based level number
  asteroidSpawnInterval: number; // ms between asteroid spawns
  asteroidSpeed: number;      // pixels/s downward velocity
  asteroidHealth: number;     // hits to destroy an asteroid
  scoreToAdvance: number | null; // points needed to complete this level (null = final level)
}

const LEVELS: LevelConfig[] = [
  { level: 1, asteroidSpawnInterval: 2000, asteroidSpeed: 100, asteroidHealth: 10, scoreToAdvance: 100 },
  { level: 2, asteroidSpawnInterval: 2000, asteroidSpeed: 150, asteroidHealth: 13, scoreToAdvance: 200 },
  { level: 3, asteroidSpawnInterval: 1500, asteroidSpeed: 200, asteroidHealth: 15, scoreToAdvance: null },
];
```

> **Note:** `scoreToAdvance: null` marks the final level. Reaching the required score on the final level is not applicable — instead, a separate win condition triggers (see §Win Condition below).

### Adding more levels

To add Level 4, append another object to `LEVELS`. The rest of the system reads from this array dynamically — no switch statements, no hardcoded level numbers.

---

## Level Progression Trigger

- Progression is **score-based within each level**.
- When the player's **current-level score** reaches `scoreToAdvance`, the level is complete.
- Score resets to 0 at the start of each level (see §Resets below).

---

## Win Condition

- After the player completes the **last entry** in the `LEVELS` array (i.e., the entry with `scoreToAdvance: null`), a **victory screen** is shown.
- Since the final level has no score threshold, define an alternative completion trigger: **surviving for 60 seconds** on the final level (the timer starts when the level begins). This value should be a field in `LevelConfig` (e.g., `survivalTime: number | null`) so it is also data-driven and only applies when `scoreToAdvance` is `null`.
- The victory screen displays:
  - "You Win!" title text.
  - The total cumulative score across all levels.
  - A "Play Again" button that restarts at Level 1.

### Implementation

- Create a new scene: **`VictoryScene`** (scene key `'VictoryScene'`).
- Register it in `src/main.ts` after `GameOverScene`.
- `GameScene` transitions to `VictoryScene` with `{ totalScore }` data.
- `VictoryScene` layout mirrors `GameOverScene` but with a congratulatory message.

---

## Resets Between Levels

At the start of each level:

| State        | Behavior                                   |
|--------------|--------------------------------------------|
| **Score**    | Resets to 0. Cumulative total is tracked separately for the victory screen. |
| **Health**   | Resets to 10 hearts (full).                |
| **Asteroids**| All existing asteroids are cleared.        |
| **Projectiles**| All existing projectiles are cleared.    |
| **Spawn timer**| Recreated with the new level's `asteroidSpawnInterval`. |

---

## Level Transition UX

When the player meets the advancement criteria:

1. **Pause gameplay** — disable physics, input, and timers.
2. **Clear the field** — destroy all asteroids and projectiles.
3. **Show a full-screen overlay** within `GameScene`:
   - Dark semi-transparent background.
   - Large centered text: **"Level X Complete!"** (1 second).
   - Then swap to: **"Level Y"** with a brief countdown or "Get Ready!" (1–2 seconds).
4. **Resume** — apply the new level config (spawn rate, speed, health), reset score and health, and restart gameplay.

> This transition happens **inside `GameScene`** (no scene switch) to keep the implementation simple. The scene pauses/resumes rather than restarting.

---

## HUD Changes

### Level indicator

- Display **"Level: X"** in the **upper-right corner** of the screen.
- Font size and style should match the existing score text (24px, white).
- Right-aligned with ~10px padding from the right edge.
- Updates whenever the level advances.

### Existing HUD elements (no changes)

- **Score** — upper-left corner, label `"Scores : "` (unchanged).
- **Hearts** — below score (unchanged, but resets per level).

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/game/systems/LevelSystem.ts` | New class. Owns the `LEVELS` config array, tracks current level index, exposes `getCurrentLevel(): LevelConfig`, `advance(): LevelConfig \| null`, `isLastLevel(): boolean`, `reset()`. Also manages the level HUD text in the upper-right corner. |
| `src/game/scenes/VictoryScene.ts` | New scene. Displays win message, total score, and "Play Again" button. |

## Files to Modify

| File | Changes |
|------|---------|
| `src/main.ts` | Register `VictoryScene` in the scene list. |
| `src/game/scenes/GameScene.ts` | Import and instantiate `LevelSystem`. Use level config for spawn interval, asteroid speed, and asteroid health instead of hardcoded values. Add level-advancement check in the score callback. Implement the transition overlay. Track `totalScore` across levels. Transition to `VictoryScene` on final level completion. |
| `src/game/objects/Asteroid.ts` | Accept health as a constructor parameter instead of hardcoding `10`. Fall back to `10` if not provided (backward-compatible). |
| `src/game/systems/ScoreSystem.ts` | Ensure `reset()` correctly zeroes both the internal counter and the display text (already works, but verify). Add `getScore()` if not present. |
| `src/game/systems/HealthSystem.ts` | Ensure `reset()` restores all 10 hearts (already works, but verify). |
| `.github/copilot-instructions.md` | Update architecture notes to mention the level system, `LevelSystem`, and `VictoryScene`. |

---

## Detailed Task Breakdown

### Task 1 — Create `LevelSystem` class

**File:** `src/game/systems/LevelSystem.ts` *(new)*

- Define the `LevelConfig` interface and `LEVELS` array as described above.
- Class `LevelSystem`:
  - **Constructor** `(scene: Phaser.Scene)`:
    - Stores reference to scene.
    - Sets `currentLevelIndex = 0`.
    - Creates a `Phaser.GameObjects.Text` at top-right corner showing `"Level: 1"`, 24px, white, right-aligned. Use `scene.scale.width - 10` as x with right-align origin `(1, 0)`.
    - Sets a high `depth` so it renders above the game world.
  - **`getCurrentLevel(): LevelConfig`** — returns `LEVELS[currentLevelIndex]`.
  - **`advance(): LevelConfig | null`** — increments `currentLevelIndex`. If the new index is within bounds, updates HUD text and returns the new config. If out of bounds, returns `null` (signals victory).
  - **`isLastLevel(): boolean`** — returns `true` if `getCurrentLevel().scoreToAdvance === null`.
  - **`getLevelNumber(): number`** — returns `currentLevelIndex + 1`.
  - **`reset()`** — sets `currentLevelIndex = 0`, updates HUD text.
  - **`destroy()`** — cleans up the text object.

### Task 2 — Make asteroid health configurable

**File:** `src/game/objects/Asteroid.ts` *(edit)*

- Change the constructor to accept an optional `health` parameter (default `10`).
- Use that parameter to set the internal health value instead of the hardcoded `10`.

### Task 3 — Integrate `LevelSystem` into `GameScene`

**File:** `src/game/scenes/GameScene.ts` *(edit)*

- Import `LevelSystem`.
- Add field: `private levelSystem!: LevelSystem`.
- Add field: `private totalScore: number = 0`.
- Add field: `private spawnTimer!: Phaser.Time.TimerEvent`.
- In `create()`:
  - Instantiate `this.levelSystem = new LevelSystem(this)`.
  - Store the spawn timer in `this.spawnTimer` so it can be destroyed/recreated on level change.
  - Use `this.levelSystem.getCurrentLevel()` to set spawn interval and asteroid speed.
- In `spawnAsteroid()`:
  - Read `asteroidSpeed` and `asteroidHealth` from `this.levelSystem.getCurrentLevel()`.
  - Pass `asteroidHealth` to the `Asteroid` constructor.
  - Use `asteroidSpeed` for `setVelocityY()`.
- In `handleProjectileAsteroidCollision()`:
  - After calling `this.scoreSystem.addPoints(10)`, check:
    ```
    if (!this.levelSystem.isLastLevel() && this.scoreSystem.getScore() >= level.scoreToAdvance)
    ```
  - If true, call a new method `this.startLevelTransition()`.
- Add method **`startLevelTransition()`**:
  1. Store the current score in `this.totalScore += this.scoreSystem.getScore()`.
  2. Pause physics: `this.physics.pause()`.
  3. Disable input.
  4. Destroy all asteroids and projectiles in their groups.
  5. Remove the spawn timer.
  6. Show "Level X Complete!" text (centered, large font, semi-transparent dark overlay).
  7. After 1.5 seconds, call `this.levelSystem.advance()`. If result is `null`, transition to `VictoryScene`.
  8. Show "Level Y — Get Ready!" for 1.5 seconds.
  9. Reset `scoreSystem`, reset `healthSystem`.
  10. Recreate the spawn timer with the new level's `asteroidSpawnInterval`.
  11. Resume physics and input.
- For the **final level win condition** (survival timer):
  - When a level with `scoreToAdvance === null` starts, create a countdown timer for `survivalTime` ms.
  - On completion, trigger transition to `VictoryScene` with `{ totalScore: this.totalScore + this.scoreSystem.getScore() }`.
  - Display remaining time in the HUD (optional but recommended — e.g., "Time: 45s" below the level indicator).

### Task 4 — Create `VictoryScene`

**File:** `src/game/scenes/VictoryScene.ts` *(new)*

- Scene key: `'VictoryScene'`.
- `init(data: { totalScore: number })` — stores the total score.
- `create()`:
  - Dark or themed background.
  - "You Win!" text — large, centered, celebratory color (e.g., gold `#ffd700`).
  - "Total Score: X" — below the title.
  - "Play Again" text/button — clicking starts `'GameScene'` (which resets to Level 1).
- No `update()` needed.

### Task 5 — Register `VictoryScene`

**File:** `src/main.ts` *(edit)*

- Import `VictoryScene`.
- Add it to the `scene` array after `GameOverScene`.

### Task 6 — Update `copilot-instructions.md`

**File:** `.github/copilot-instructions.md` *(edit)*

- Under **Architecture**, mention:
  - `LevelSystem` tracks level state and config.
  - `VictoryScene` is the scene after the final level.
  - Scene flow becomes: `BootScene` → `StartScene` → `GameScene` (loops through levels internally) → `GameOverScene` or `VictoryScene`.
- Under **Key Conventions**, note:
  - Level parameters are data-driven via the `LEVELS` array in `LevelSystem.ts`.
  - Asteroid health is now a constructor parameter, not hardcoded.

### Task 7 — Verify

- Run `npx tsc --noEmit` — must produce zero errors.
- Run `npm run build` — must succeed.
- Manual testing:
  - [ ] "Level: 1" appears in the upper-right HUD on game start.
  - [ ] Asteroids spawn every 2s at speed 100 with 10 health in Level 1.
  - [ ] Reaching 100 score triggers the level transition overlay.
  - [ ] After transition, score resets to 0, health resets to 10 hearts, "Level: 2" shows.
  - [ ] Level 2 asteroids have speed 150 and 13 health.
  - [ ] Reaching 200 score in Level 2 triggers transition to Level 3.
  - [ ] Level 3 asteroids spawn every 1.5s at speed 200 with 15 health.
  - [ ] Surviving 60 seconds in Level 3 transitions to `VictoryScene`.
  - [ ] `VictoryScene` shows total cumulative score and "Play Again" restarts at Level 1.
  - [ ] Dying at any level still transitions to `GameOverScene`.

---

## Open / Future Considerations

- **Visual changes per level** (different backgrounds, asteroid textures, color palettes) — deferred, but `LevelConfig` can be extended with optional fields like `backgroundKey`, `asteroidTextureKey`, etc.
- **Difficulty curve tuning** — all values are in the config array and easy to tweak.
- **Score display on Game Over** — consider showing both the current-level score and the total cumulative score.
- **Level select screen** — could be added later by tracking highest level reached in localStorage.
