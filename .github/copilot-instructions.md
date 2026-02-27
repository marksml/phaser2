# Copilot Instructions – Asteroid Escape

## Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Type-check with tsc, then Vite production build
npm run preview  # Serve the production build locally
```

No test runner or linter is configured.

## Architecture

**Stack:** Phaser 3 · TypeScript · Vite (ES modules, `"type": "module"`)

**Scene flow:** `BootScene` → `StartScene` → `GameScene` → `GameOverScene`

All four scenes are registered in `src/main.ts` in that order. Transitions use `this.scene.start('SceneName')`. Data is forwarded between scenes as a plain object — the receiving scene picks it up in its `init(data)` method (see `GameOverScene.init({ score })`).

**Game objects** (`src/game/objects/`) extend `Phaser.Physics.Arcade.Sprite` and self-register their physics body inside the constructor via `scene.physics.add.existing(this)`. **When adding a game object to the scene you must call both** `group.add(obj)` **and** `this.add.existing(obj)` — the codebase does both explicitly everywhere (see `spawnAsteroid` and `fireProjectile` in `GameScene`).

**Asset loading** lives entirely in `GameScene.preload()`. `BootScene` is currently a pass-through to `StartScene` with no asset loading.

**`ScoreSystem`** (`src/game/systems/ScoreSystem.ts`) exists but is **not yet instantiated or wired up** in `GameScene`. It is the intended place for score tracking and HUD text.

## Key Conventions

- **TypeScript strict mode** is on (`strict`, `noUnusedLocals`, `noUnusedParameters`). All code must compile without errors; run `npx tsc --noEmit` to check.
- **Scene keys** are plain string literals that match the class name (e.g., `'GameScene'`). Use these same string keys for every `this.scene.start()` / `this.scene.get()` call.
- **Projectile texture is programmatic.** `Projectile` generates a red circle at runtime via `graphics.generateTexture('projectile', 10, 10)`, overwriting the image loaded in `preload()`. Do not replace this with a static asset load without removing the `generateTexture` call.
- **Firing cooldown** is tracked via the `lastFired` timestamp compared against `this.time.now` (100 ms rate limit), not a Phaser timer event.
- **Asteroid health** is hardcoded at 10 hits. `takeDamage()` decrements it and calls `explode()` + `destroy()` at zero. The `explode()` method creates a particle emitter directly on the `Asteroid` object using the `'asteroids'` texture key.
- **Current input is keyboard-only** (arrow keys + spacebar). The spec (`spec.md`) calls for touch/drag as the primary input — this is not yet implemented.
- **`spec.md`** is the authoritative design document. Features like touch controls, difficulty scaling, player–asteroid collision (game over), and score integration are specified there but not yet fully implemented.
