# Pancake Catcher Game — Design Document

## Overview

A pure frontend TypeScript game built with React + HTML Canvas. Pancakes fall from the top of the screen and a player-controlled plate at the bottom catches them, stacking them up. Cute/cartoonish visual style, polished demo/portfolio piece.

## Tech Stack

- **Vite** — build tool and dev server
- **React 18** — UI layer (HUD, overlays, canvas host)
- **TypeScript** — all game and UI code
- **HTML Canvas** — game rendering at 60fps

## Architecture

```
pancake-game/
├── src/
│   ├── main.tsx                  # Entry point, renders App
│   ├── App.tsx                   # Top-level component, manages game screens
│   ├── components/
│   │   ├── GameCanvas.tsx        # React wrapper for <canvas>, owns game loop lifecycle
│   │   └── HUD.tsx               # Score display, start/restart overlay
│   ├── game/
│   │   ├── GameEngine.ts         # Core game loop: update + render orchestration
│   │   ├── entities/
│   │   │   ├── Plate.ts          # Plate entity: position, movement, dimensions
│   │   │   └── Pancake.ts        # Pancake entity: position, velocity, dimensions
│   │   ├── systems/
│   │   │   ├── PhysicsSystem.ts  # Gravity, falling, collision detection
│   │   │   ├── InputSystem.ts    # Keyboard input handling (arrow keys)
│   │   │   └── SpawnSystem.ts    # Pancake spawning logic (timing, random position)
│   │   ├── rendering/
│   │   │   └── Renderer.ts       # All Canvas drawing: pancakes, plate, background
│   │   └── types.ts              # Shared types/interfaces
│   └── styles/
│       └── index.css             # Global styles, canvas centering
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Key separation: `game/` is pure TypeScript with zero React dependencies. `components/` is the React layer. Game logic is fully portable and testable.

## Game State

```typescript
interface GameState {
  plate: { x: number; y: number; width: number }
  fallingPancakes: Pancake[]
  stackedPancakes: Pancake[]
  score: number
  status: 'idle' | 'playing' | 'over'
}
```

## Game Loop (60fps via requestAnimationFrame)

1. **InputSystem** — reads held keys, updates plate velocity
2. **SpawnSystem** — checks timer, spawns pancake at random X position
3. **PhysicsSystem** — applies gravity to falling pancakes, moves plate, detects collisions:
   - Pancake overlaps plate/top-of-stack → snap to stack, increment score
   - Pancake falls below screen → remove it (no game over)
4. **Renderer** — clears canvas, draws background, plate, stacked pancakes, falling pancakes

## Input

- Arrow left/right: move plate continuously while held
- Space: start/restart game
- Plate clamped to canvas bounds
- InputSystem tracks keydown/keyup state

## Pancake Stacking

- Caught pancakes snap to `plate.y - stackHeight`
- Stacked pancakes move with the plate (X relative to plate center)
- Slight random width variation (90-110%) for natural look

## Visual Design

- **Canvas**: 800x600, centered on page, soft drop shadow
- **Background**: Light pastel blue gradient
- **Pancakes**: Rounded ovals, golden-brown fill, darker stroke, butter pat on top
- **Plate**: White/light gray oval at bottom, subtle shadow
- **Score**: HTML overlay top-center, "Pancakes: N" in clean sans-serif
- **Start screen**: Centered overlay with title "Pancake Catcher!" and "Press Space to Start"

## Scope Boundaries

- No increasing difficulty / speed changes
- No game over on missed pancakes
- No particle effects or complex animations
- No sound effects
- No mobile/touch support (keyboard only)
