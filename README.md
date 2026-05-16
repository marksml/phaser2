# Asteroid Escape

Ein 2D-Arcade-Browsergame entwickelt mit Phaser 3, TypeScript und Vite. Optimiert für Touch-Steuerung auf Tablets.

## Features

- Keyboard-basierte Steuerung des Raumschiffs
- Asteroiden ausweichen und abschießen
- Punkte-System
- Schwierigkeitssteigerung über Zeit
- Game Over und Restart

## Installation

1. Stelle sicher, dass Node.js und npm installiert sind.
2. Klone oder lade das Repository herunter.
3. Installiere die Abhängigkeiten:

   ```bash
   npm install
   ```

## Entwicklung

Starte den Entwicklungsserver:

```bash
npm run dev
```

## Build

Erstelle das Projekt für die Produktion:

```bash
npm run build
```

## Tests

E2E-Smoke-Tests mit Playwright (der Vite-Dev-Server startet automatisch):

```bash
npm test                  # headless (für CI)
npm run test:headed       # headed – Browser sichtbar
npm run test:debug        # Schritt-für-Schritt-Debugger
```

## Deployment

Das Spiel kann als statische Website deployed werden (z.B. via GitHub Pages oder Netlify).

## Technologiestack

- **Phaser 3**: Game Framework
- **TypeScript**: Programmiersprache
- **Vite**: Build Tool
- **HTML5 Canvas**: Rendering

## Projektstruktur

```
src/
  main.ts                 # Einstiegspunkt
  game/
    scenes/
      BootScene.ts        # Initialisierung
      StartScene.ts       # Startmenü
      GameScene.ts        # Hauptspiel
      GameOverScene.ts    # Game Over Screen
    objects/
      Player.ts           # Spieler-Raumschiff
      Asteroid.ts         # Asteroiden
      Projectile.ts       # Projektile
    systems/
      ScoreSystem.ts      # Punkte-System
```

## Steuerung

- **Touch-Drag**: Raumschiff horizontal bewegen
- **Automatisches Schießen**: Projektile werden automatisch abgefeuert

## Lizenz

Dieses Projekt ist Open Source.
