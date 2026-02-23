# Spec.md

## Projektname
Asteroid Escape (Arbeitstitel)

---

## 1. Projektübersicht

Ziel ist die Entwicklung eines 2D-Arcade-Browsergames, das auf Tablets lauffähig ist und vollständig per Touch gesteuert wird (keine Tastatur erforderlich).

Der Spieler steuert ein Raumschiff, das durch das Weltall fliegt. Ziel ist es, Asteroiden auszuweichen oder sie abzuschießen, um Punkte zu sammeln. Mit zunehmender Spieldauer steigt die Schwierigkeit.

---

## 2. Zielplattform

- Plattform: Webbrowser (Chrome, Safari, Edge)
- Zielgeräte: Tablet (iOS und Android)
- Eingabemethode: Touch
- Keine Installation erforderlich
- Deployment als statische Website (z. B. via GitHub Pages oder Netlify)

---

## 3. Technologiestack

- Sprache: TypeScript
- Game Framework: Phaser 3
- Build Tool: Vite
- Rendering: HTML5 Canvas (über Phaser)

---

## 4. Gameplay-Mechanik

### 4.1 Spieler (Raumschiff)

- Startposition: Untere Bildschirmhälfte, mittig
- Bewegung:
  - Horizontal per Touch-Drag oder Touch-Position
  - Optional vertikale Bewegung im unteren Bereich erlaubt
- Begrenzung auf Bildschirmbereich

### 4.2 Asteroiden

- Spawnen zufällig am oberen Bildschirmrand
- Fallen mit zufälliger Geschwindigkeit nach unten
- Unterschiedliche Größen (klein, mittel, groß)
- Kollision mit Spieler → Game Over

### 4.3 Schießen

- Automatisches Schießen (empfohlen) ODER
- Separater Touch-Button zum Feuern
- Projektile fliegen nach oben
- Kollision Projektil + Asteroid →
  - Asteroid wird zerstört
  - Punkte werden vergeben

### 4.4 Punkte-System

- Kleiner Asteroid: 10 Punkte
- Mittlerer Asteroid: 20 Punkte
- Großer Asteroid: 50 Punkte

- Punktestand wird permanent sichtbar angezeigt

---

## 5. Schwierigkeitssteigerung

Schwierigkeit erhöht sich über Zeit:

- Erhöhte Spawnrate
- Höhere Asteroidengeschwindigkeit
- Optional: Mehr große Asteroiden

Progression erfolgt kontinuierlich (z. B. alle 30 Sekunden Anpassung).

---

## 6. Spielzustände (Scenes)

### 6.1 Boot Scene
- Initialisierung
- Laden aller Assets

### 6.2 Start Scene
- Titel
- "Start" Button (Touch)

### 6.3 Game Scene
- Spieler-Instanz
- Asteroid-Group
- Projectile-Group
- Score-UI
- Kollisionslogik

### 6.4 Game Over Scene
- Anzeige finaler Score
- "Retry" Button

---

## 7. Technische Anforderungen

### 7.1 Architektur

- Szenenbasierte Struktur (Phaser Scenes)
- Trennung von:
  - Rendering
  - Input Handling
  - Game Logic

### 7.2 Performance

- 60 FPS Ziel
- Keine Memory Leaks
- Object Pooling für Projektile und Asteroiden empfohlen

### 7.3 Responsive Design

- Anpassung an verschiedene Tablet-Auflösungen
- Fixed Aspect Ratio empfohlen (z. B. 16:9)
- Skalierung via Phaser Scale Manager

---

## 8. Assets

Benötigte Assets:

- 1x Spieler-Raumschiff Sprite
- 3x Asteroid-Sprites
- 1x Projektil-Sprite
- Hintergrund (Weltall)
- Optional: Explosion Animation

Assets können als Platzhalter implementiert werden.

---

## 9. Kollisionslogik

- Player vs Asteroid → Game Over
- Projectile vs Asteroid → Destroy + Score Update

Arcade Physics von Phaser verwenden.

---

## 10. Sound (optional)

- Schuss-Sound
- Explosion-Sound
- Hintergrundmusik (loop)
- Sound kann deaktivierbar sein

---

## 11. Nicht-Funktionale Anforderungen

- Keine Server-Kommunikation
- Keine Speicherung von Nutzerdaten
- Offline lauffähig nach erstem Laden
- Keine externen Abhängigkeiten außer Build-Tool

---

## 12. Erweiterungsmöglichkeiten (Optional, nicht MVP)

- Power-Ups (Shield, Rapid Fire)
- Highscore LocalStorage
- Unterschiedliche Waffen
- Gegner-Raumschiffe
- Parallax-Hintergrund

---

## 13. Definition of Done

Das Spiel gilt als fertig, wenn:

- Es im Tablet-Browser stabil läuft
- Touch-Steuerung zuverlässig funktioniert
- Kollisionen korrekt erkannt werden
- Score korrekt gezählt wird
- Game Over Zustand sauber funktioniert
- Projekt buildbar und deploybar ist

---

## 14. Projektstruktur (Vorschlag)

```
src/
  main.ts
  game/
    scenes/
      BootScene.ts
      StartScene.ts
      GameScene.ts
      GameOverScene.ts
    objects/
      Player.ts
      Asteroid.ts
      Projectile.ts
    systems/
      ScoreSystem.ts
```

---

## 15. MVP Scope

Enthalten im MVP:

- 1 Spielszene
- 1 Asteroid-Typ
- Punkte-System
- Game Over
- Restart

Nicht im MVP:

- Power-Ups
- Sound
- Highscore-Speicherung

---

Ende der Spezifikation

