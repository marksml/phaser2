# Plan: Add score tracking

## Problem
There is no score system yet: score stays hidden while asteroid kills are already being tracked, so players never see that they are accumulating points.

## Proposed approach
- Wire up the existing `ScoreSystem` so the `GameScene` owns one instance, resets it when the scene starts, and keeps its text at the top-left corner with the label "Scores : ".
- Update the collision/damage flow so `Asteroid.takeDamage()` can signal when an asteroid actually dies and guarantee it only reports a single kill.
- Call `scoreSystem.addPoints(10)` every time a projectile kill destroys an asteroid, ensuring scores increment only once per asteroid.
- Keep the new state local to `GameScene` and keep the `ScoreSystem` implementation focused on text updates.

## Files to change
- `src/game/scenes/GameScene.ts`
- `src/game/objects/Asteroid.ts`
- `src/game/systems/ScoreSystem.ts`

## Todo breakdown
- [x] Add a `ScoreSystem` instance to `GameScene`, display "Scores : 0" in the upper-left corner, and reset it when the scene starts.
- [x] Adjust `Asteroid.takeDamage()` to return a destroy flag (and keep the single-explosion guard) so the scene knows when a kill happened.
- [x] Call `ScoreSystem.addPoints(10)` when a kill flag is true during projectile-asteroid collision handling.
- [x] Run `npx tsc --noEmit` and `npm run build` once after the changes to ensure no regressions (fails due to pre-existing `Projectile.ts`, `Spaceship.ts`, and `GameScene.ts` errors).

## Notes
- The displayed label must read exactly `Scores : ` followed immediately by the numeric value.
- Asteroid destruction already waits 1 second for the emitter; score increments should not duplicate during that interval.
