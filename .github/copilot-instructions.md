# Copilot Instructions – Asteroid Escape

## Commands

```bash
npm run dev          # Start the Vite dev server
npm run build        # Type-check with tsc, then create a production bundle with Vite
npm run preview      # Serve the production build locally
npx tsc --noEmit     # Run the TypeScript checker without emitting files
```

There is currently **no test runner** and **no linter** configured in `package.json`, so there is no single-test command to run. `npm run build` is the main validation path. The repository also contains a `webpack.config.js`, but the active scripts build with **Vite**, not Webpack.

## High-level architecture

**Stack:** Phaser 3 + TypeScript + Vite, using ES modules (`"type": "module"`).

**Scene flow:** `BootScene` -> `StartScene` -> `GameScene` -> `GameOverScene` or `VictoryScene`

All scenes are registered in `src/main.ts` in that order. Scene transitions use string keys that match the class names, and score data is passed between scenes as plain objects via `this.scene.start('SceneName', data)` and picked up in `init(data)`.

`BootScene` is currently just a pass-through to `StartScene`. Even though `spec.md` describes asset loading in Boot, the actual asset loading happens in `GameScene.preload()`.

`GameScene` owns nearly all runtime orchestration:

- it creates the asteroid and projectile physics groups
- it creates the player ship
- it wires collision handlers
- it owns the firing cooldown and keyboard input loop
- it manages level progression without changing scenes between levels

The gameplay loop is split across three small systems plus the scene:

- `ScoreSystem` renders the score HUD in the upper-left
- `HealthSystem` renders the heart HUD and tracks 10-hit health
- `LevelSystem` owns the `LEVELS` array, current level index, and the level HUD in the upper-right

Level progression is handled entirely inside `GameScene`. Completing a non-final level pauses physics/input, shows overlay text, advances `LevelSystem`, resets `ScoreSystem` and `HealthSystem`, recreates the asteroid spawn timer, and resumes play in the same scene instance. Final victory comes from either exhausting levels during transition or finishing the survival timer on the last level.

Score handling is split intentionally: `ScoreSystem` is per-level, while `GameScene.totalScore` accumulates completed-level scores for the final victory screen. `GameOverScene` receives the current level score; `VictoryScene` receives the accumulated total score.

## Key conventions

- **Game objects self-register physics bodies, but not display/group membership.** `Asteroid`, `Projectile`, and `Spaceship` call `scene.physics.add.existing(this)` in their constructors. When spawning an asteroid or projectile, callers still need to add it to the right group and to the display list with both `group.add(obj)` and `this.add.existing(obj)`.
- **Scene keys are plain string literals.** Use `'BootScene'`, `'StartScene'`, `'GameScene'`, `'GameOverScene'`, and `'VictoryScene'` consistently for `super(...)` and `this.scene.start(...)`.
- **Current controls are keyboard-only.** The live implementation uses arrow keys for movement and spacebar for firing. `README.md` and `spec.md` describe touch controls, but that is aspirational rather than current behavior.
- **Projectile rendering is programmatic.** `Projectile` generates a `projectile` texture at runtime with `graphics.generateTexture(...)`, overriding the preloaded projectile image key.
- **Firing rate is enforced with timestamps, not timer events.** `GameScene` uses `lastFired` compared with `this.time.now` for a 100 ms cooldown.
- **Level tuning is data-driven.** Asteroid spawn interval, speed, health, score thresholds, and final survival time all come from the `LEVELS` array in `LevelSystem.ts`. Add or adjust levels there before changing scene logic.
- **The last level is identified by config shape.** `LevelSystem.isLastLevel()` checks `scoreToAdvance === null`, and the final level uses `survivalTime` instead of a score threshold.
- **Strict TypeScript settings are enforced.** `strict`, `noUnusedLocals`, and `noUnusedParameters` are enabled, so new code needs to type-check cleanly without unused declarations.
- **`spec.md` is the design target, not a perfect description of shipped behavior.** Use it for intended direction, but confirm implementation details in the scene and system code before changing behavior.
