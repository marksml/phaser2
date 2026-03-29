# Plan: Fix asteroid zero-health explosion

## Problem
When an asteroid reaches 0 health, the current explosion logic is unreliable/noisy and immediately destroys the asteroid, which can prevent a visible explosion effect.

## Proposed approach
- Refactor `Asteroid.explode()` to create a clean, deterministic particle emitter using the existing `asteroids` texture key.
- Emit particles continuously for exactly 1 second at the asteroid position.
- Ensure cleanup is explicit (stop emitter, destroy particle emitter manager/object) to avoid leaks.
- Keep behavior focused and minimal: only touch asteroid death/explosion flow and related collision impact where necessary.

## Files to change
- `src/game/objects/Asteroid.ts` (primary, expected only file)
- `src/game/scenes/GameScene.ts` (only if needed to avoid tween/collision side effects during destruction timing)

## Todo breakdown
- [x] Inspect and simplify zero-health flow in `takeDamage()` and `explode()`.
- [x] Implement 1-second asteroid-texture particle emission and cleanup.
- [x] Ensure asteroid lifecycle is correct (no duplicate damage/explosion after death).
- [x] Type-check and build to validate no regressions.

## Notes / assumptions
- The explosion texture must remain `asteroids` (same as asteroid sprite).
- Confirmed behavior: asteroid sprite disappears immediately at 0 health while emitter continues for 1 second.
- Emitter lifetime requirement is interpreted as: emitter actively emits for 1000 ms; particles may finish their own short lifespan after stop.
- One asteroid death should trigger one explosion only.
- Validation note: type-check/build are currently failing due pre-existing issues in `Projectile.ts`, `Spaceship.ts`, and `GameScene.ts`; asteroid-related type error is resolved.
