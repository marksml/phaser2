# Plan: Spaceship Health State with Heart HUD

## Overview

Add a 10-heart health system to the player's spaceship. Hearts are displayed below the score as Unicode characters (❤ red = full, ♡ grey = lost). The spaceship has ~1 second of invincibility after each hit, with a flash animation. Asteroid collisions trigger the asteroid's explosion animation before it is removed. When health reaches 0, the spaceship explodes and the Game Over scene is shown, receiving the current score.

---

## Decisions

| Topic | Decision | Reason |
|---|---|---|
| Heart rendering | Unicode `❤` / `♡` Text objects | No heart assets exist; consistent with codebase's programmatic approach |
| Asteroid on hit | Explode (same as projectile kill) | Consistent visual feedback |
| Invincibility frames | ~1 second flash after each hit | Prevents instant multi-heart drain from a single overlapping asteroid |

---

## Tasks

### Task 1 — Create `HealthSystem` [ ]

**File:** `src/game/systems/HealthSystem.ts` _(new file)_

- New class `HealthSystem`, mirroring the structure of `ScoreSystem`.
- **Constructor** takes `scene: Phaser.Scene`:
  - Creates 10 `Phaser.GameObjects.Text` objects showing `'❤'` in red (`#ff0000`), 24px, spaced 26px apart.
  - Positioned starting at `(10, 44)` — directly below the 24px score text at `y=10`.
  - Set a high depth so hearts render above the game world.
- **`takeDamage(): number`**
  - Decrements internal `health` counter (floor: 0).
  - Changes the now-empty heart icon's text to `'♡'` and color to `#555555`.
  - Returns the remaining health value.
- **`reset()`** — restores all 10 hearts to `'❤'` / red and resets `health = 10`.
- **`getHealth(): number`** — returns current health.

---

### Task 2 — Extend `Spaceship` [ ]

**File:** `src/game/objects/Spaceship.ts` _(edit)_

- Add `private invincible = false` field.
- **`takeDamage(scene: Phaser.Scene): boolean`**
  - If `this.invincible === true`, return `false` immediately (no damage).
  - Otherwise: set `invincible = true`, start a repeating alpha tween (flash between opacity 0.3 and 1.0, 100 ms cycle).
  - Schedule `scene.time.delayedCall(1000, ...)` to set `invincible = false` and stop the tween.
  - Return `true`.
- **`explode(scene: Phaser.Scene): void`**
  - Creates a particle emitter at the spaceship's `x`/`y` using the `'spaceship'` texture key (already loaded as `assets/spaceships/10.png`), mirroring `Asteroid.explode()`.
  - Stops emitter after 150 ms, destroys emitter after 500 ms.
  - Calls `this.disableBody(true, true)`.
  - Schedules `this.destroy()` after 600 ms via `scene.time.delayedCall`.

---

### Task 3 — Wire up HealthSystem and collision in `GameScene` [ ]

**File:** `src/game/scenes/GameScene.ts` _(edit)_

- Import `HealthSystem` from `../systems/HealthSystem`.
- Add `private healthSystem: HealthSystem` field declaration.
- In `create()`, after `ScoreSystem` instantiation: `this.healthSystem = new HealthSystem(this)` then `this.healthSystem.reset()`.
- Register the player–asteroid overlap:
  ```ts
  this.physics.add.overlap(
    this.spaceship,
    this.asteroids,
    this.handleSpaceshipAsteroidCollision,
    undefined,
    this
  );
  ```
- Add `private handleSpaceshipAsteroidCollision(spaceshipObj: Phaser.GameObjects.GameObject, asteroidObj: Phaser.GameObjects.GameObject): void`:
  1. Cast: `const ship = spaceshipObj as Spaceship; const rock = asteroidObj as Asteroid;`
  2. Call `const damaged = ship.takeDamage(this)` — if `false`, return early.
  3. Trigger asteroid explosion: call `rock.explode(rock.x, rock.y)`, `rock.disableBody(true, true)`, `this.time.delayedCall(1000, () => rock.destroy())`.
  4. Call `const remaining = this.healthSystem.takeDamage()`.
  5. If `remaining === 0`:
     - Call `ship.explode(this)`.
     - Delay 700 ms, then: `this.scene.start('GameOverScene', { score: this.scoreSystem.getScore() })`.

---

### Task 4 — Clean up off-screen asteroids in `GameScene.update()` [ ]

**File:** `src/game/scenes/GameScene.ts` _(edit)_

- In `update()`, add a loop over `this.asteroids.getChildren()`:
  - For each asteroid with `y > this.scale.height + 50`, call `asteroid.destroy()`.
- This prevents stale physics bodies accumulating and ensures the overlap check stays clean.

---

### Task 5 — Verify [ ]

- Run `npx tsc --noEmit` — must produce zero errors (strict mode: no unused locals/params).
- Run `npm run dev` and manually verify:
  - [ ] 10 red hearts appear beneath the score on game start.
  - [ ] Colliding with an asteroid removes one heart (turns grey `♡`) and the spaceship flashes for ~1 second.
  - [ ] No additional hearts are lost during the flash window.
  - [ ] The asteroid explodes on collision (same animation as a projectile kill).
  - [ ] At 0 hearts, the spaceship explodes and the Game Over screen appears with the correct score.
  - [ ] Pressing Retry resets both score and all hearts to full.
  - [ ] Off-screen asteroids are cleaned up and do not cause performance issues.

---

## Implementation Order

1. `HealthSystem` (new file, no dependencies on other changes)
2. `Spaceship` extensions (`takeDamage`, `explode`)
3. `GameScene` wiring (depends on 1 and 2)
4. Off-screen asteroid cleanup in `GameScene.update()`
5. TypeScript check + manual smoke test
