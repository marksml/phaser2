import type Phaser from 'phaser';

declare global {
  interface Window {
    /** Exposed only when VITE_TEST_MODE=true. Allows Playwright to inspect scene state. */
    __PHASER_GAME__?: Phaser.Game;
  }
}

export {};
