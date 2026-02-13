# Pancake Catcher Game — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a polished pancake catcher game with React + HTML Canvas where pancakes fall and stack on a player-controlled plate.

**Architecture:** Pure TypeScript game engine (`src/game/`) with zero React dependencies, hosted inside a thin React shell (`src/components/`). Game loop runs via `requestAnimationFrame` at 60fps. ECS-inspired systems pattern (InputSystem, SpawnSystem, PhysicsSystem) keeps concerns separated.

**Tech Stack:** Vite, React 18, TypeScript, HTML Canvas, Vitest

---

### Task 1: Project Scaffolding

**Files:**
- Modify: `package.json`
- Modify: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`

**Step 1: Update package.json**

```json
{
  "name": "pancake-catcher",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

**Step 2: Replace index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pancake Catcher</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 3: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

**Step 5: Create src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

**Step 6: Create minimal src/main.tsx (placeholder)**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>Pancake Catcher</h1>
  </StrictMode>
);
```

**Step 7: Install dependencies and verify**

Run: `npm install`
Run: `npx vite build`
Expected: Build succeeds with no errors.

**Step 8: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json src/
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Game Types and Entity Factories

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/entities/Pancake.ts`
- Create: `src/game/entities/Plate.ts`

**Step 1: Create src/game/types.ts**

```ts
export interface PancakeState {
  x: number;
  y: number;
  width: number;
  height: number;
  stackOffsetX: number;
}

export interface PlateState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameState {
  plate: PlateState;
  fallingPancakes: PancakeState[];
  stackedPancakes: PancakeState[];
  score: number;
  status: 'idle' | 'playing';
}

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PLATE_SPEED = 450;
export const GRAVITY = 180;
export const PANCAKE_BASE_WIDTH = 90;
export const PANCAKE_HEIGHT = 22;
export const PLATE_WIDTH = 130;
export const PLATE_HEIGHT = 16;
export const SPAWN_INTERVAL = 1.2;
```

**Step 2: Create src/game/entities/Pancake.ts**

```ts
import { PancakeState, PANCAKE_BASE_WIDTH, PANCAKE_HEIGHT, CANVAS_WIDTH } from '../types';

export function createPancake(): PancakeState {
  const widthVariation = 0.9 + Math.random() * 0.2;
  const width = PANCAKE_BASE_WIDTH * widthVariation;
  const x = width / 2 + Math.random() * (CANVAS_WIDTH - width);
  return {
    x,
    y: -PANCAKE_HEIGHT,
    width,
    height: PANCAKE_HEIGHT,
    stackOffsetX: 0,
  };
}
```

**Step 3: Create src/game/entities/Plate.ts**

```ts
import { PlateState, PLATE_WIDTH, PLATE_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types';

export function createPlate(): PlateState {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    width: PLATE_WIDTH,
    height: PLATE_HEIGHT,
  };
}
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 5: Commit**

```bash
git add src/game/
git commit -m "feat: add game types, constants, and entity factories"
```

---

### Task 3: Input, Spawn, and Physics Systems

**Files:**
- Create: `src/game/systems/InputSystem.ts`
- Create: `src/game/systems/SpawnSystem.ts`
- Create: `src/game/systems/PhysicsSystem.ts`
- Create: `src/game/systems/__tests__/PhysicsSystem.test.ts`

**Step 1: Create src/game/systems/InputSystem.ts**

```ts
export class InputSystem {
  private keys = new Set<string>();
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.boundKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key);
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    this.boundKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key);
    };
  }

  attach(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.keys.clear();
  }

  isKeyHeld(key: string): boolean {
    return this.keys.has(key);
  }

  getDirection(): number {
    let dir = 0;
    if (this.keys.has('ArrowLeft')) dir -= 1;
    if (this.keys.has('ArrowRight')) dir += 1;
    return dir;
  }

  consumeKey(key: string): boolean {
    if (this.keys.has(key)) {
      this.keys.delete(key);
      return true;
    }
    return false;
  }
}
```

**Step 2: Create src/game/systems/SpawnSystem.ts**

```ts
import { GameState, SPAWN_INTERVAL } from '../types';
import { createPancake } from '../entities/Pancake';

export class SpawnSystem {
  private timer = 0;

  reset(): void {
    this.timer = 0;
  }

  update(state: GameState, dt: number): void {
    this.timer += dt;
    if (this.timer >= SPAWN_INTERVAL) {
      this.timer -= SPAWN_INTERVAL;
      state.fallingPancakes.push(createPancake());
    }
  }
}
```

**Step 3: Create src/game/systems/PhysicsSystem.ts**

```ts
import {
  GameState,
  PancakeState,
  PlateState,
  GRAVITY,
  PLATE_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../types';
import { InputSystem } from './InputSystem';

export class PhysicsSystem {
  update(state: GameState, dt: number, input: InputSystem): void {
    this.movePlate(state, dt, input);
    this.updateStackPositions(state);
    this.updateFallingPancakes(state, dt);
  }

  private movePlate(state: GameState, dt: number, input: InputSystem): void {
    const direction = input.getDirection();
    state.plate.x += direction * PLATE_SPEED * dt;

    const halfPlate = state.plate.width / 2;
    state.plate.x = Math.max(halfPlate, Math.min(CANVAS_WIDTH - halfPlate, state.plate.x));
  }

  private updateStackPositions(state: GameState): void {
    for (const pancake of state.stackedPancakes) {
      pancake.x = state.plate.x + pancake.stackOffsetX;
    }
  }

  private updateFallingPancakes(state: GameState, dt: number): void {
    for (let i = state.fallingPancakes.length - 1; i >= 0; i--) {
      const pancake = state.fallingPancakes[i];
      pancake.y += GRAVITY * dt;

      const landingSurface = this.getLandingSurface(state);

      if (this.checkCatch(pancake, state.plate, landingSurface)) {
        this.catchPancake(pancake, state, landingSurface);
        state.fallingPancakes.splice(i, 1);
        continue;
      }

      if (pancake.y > CANVAS_HEIGHT + 50) {
        state.fallingPancakes.splice(i, 1);
      }
    }
  }

  getLandingSurface(state: GameState): number {
    if (state.stackedPancakes.length === 0) {
      return state.plate.y - state.plate.height / 2;
    }
    const top = state.stackedPancakes[state.stackedPancakes.length - 1];
    return top.y - top.height / 2;
  }

  checkCatch(pancake: PancakeState, plate: PlateState, landingSurface: number): boolean {
    const pancakeBottom = pancake.y + pancake.height / 2;
    const horizontalOverlap =
      pancake.x + pancake.width / 2 > plate.x - plate.width / 2 &&
      pancake.x - pancake.width / 2 < plate.x + plate.width / 2;

    return horizontalOverlap && pancakeBottom >= landingSurface;
  }

  private catchPancake(pancake: PancakeState, state: GameState, landingSurface: number): void {
    const offsetX = (Math.random() - 0.5) * 10;
    pancake.stackOffsetX = offsetX;
    pancake.x = state.plate.x + offsetX;
    pancake.y = landingSurface - pancake.height / 2;
    state.stackedPancakes.push(pancake);
    state.score++;
  }
}
```

**Step 4: Write tests — create src/game/systems/__tests__/PhysicsSystem.test.ts**

```ts
import { describe, it, expect } from 'vitest';
import { PhysicsSystem } from '../PhysicsSystem';
import { GameState, PancakeState, PlateState } from '../../types';

function createTestPlate(overrides?: Partial<PlateState>): PlateState {
  return { x: 400, y: 550, width: 130, height: 16, ...overrides };
}

function createTestPancake(overrides?: Partial<PancakeState>): PancakeState {
  return { x: 400, y: 0, width: 90, height: 22, stackOffsetX: 0, ...overrides };
}

function createTestState(overrides?: Partial<GameState>): GameState {
  return {
    plate: createTestPlate(),
    fallingPancakes: [],
    stackedPancakes: [],
    score: 0,
    status: 'playing',
    ...overrides,
  };
}

describe('PhysicsSystem', () => {
  const physics = new PhysicsSystem();

  describe('checkCatch', () => {
    it('catches pancake directly above plate', () => {
      const plate = createTestPlate();
      const pancake = createTestPancake({ x: 400, y: 540 });
      const landingSurface = plate.y - plate.height / 2;
      expect(physics.checkCatch(pancake, plate, landingSurface)).toBe(true);
    });

    it('misses pancake far to the left of plate', () => {
      const plate = createTestPlate();
      const pancake = createTestPancake({ x: 100, y: 540 });
      const landingSurface = plate.y - plate.height / 2;
      expect(physics.checkCatch(pancake, plate, landingSurface)).toBe(false);
    });

    it('misses pancake still above the landing surface', () => {
      const plate = createTestPlate();
      const pancake = createTestPancake({ x: 400, y: 400 });
      const landingSurface = plate.y - plate.height / 2;
      expect(physics.checkCatch(pancake, plate, landingSurface)).toBe(false);
    });

    it('catches pancake overlapping edge of plate', () => {
      const plate = createTestPlate({ x: 400, width: 130 });
      const pancake = createTestPancake({ x: 450, y: 540, width: 90 });
      const landingSurface = plate.y - plate.height / 2;
      expect(physics.checkCatch(pancake, plate, landingSurface)).toBe(true);
    });
  });

  describe('getLandingSurface', () => {
    it('returns plate top edge when stack is empty', () => {
      const state = createTestState();
      expect(physics.getLandingSurface(state)).toBe(state.plate.y - state.plate.height / 2);
    });

    it('returns top of highest stacked pancake', () => {
      const stacked = createTestPancake({ y: 530 });
      const state = createTestState({ stackedPancakes: [stacked] });
      expect(physics.getLandingSurface(state)).toBe(530 - 22 / 2);
    });
  });
});
```

**Step 5: Run tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/game/systems/
git commit -m "feat: add input, spawn, and physics systems with tests"
```

---

### Task 4: Canvas Renderer

**Files:**
- Create: `src/game/rendering/Renderer.ts`

**Step 1: Create src/game/rendering/Renderer.ts**

```ts
import { GameState, PancakeState, PlateState, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
  }

  render(state: GameState): void {
    this.drawBackground();
    this.drawPlate(state.plate);
    for (const pancake of state.stackedPancakes) {
      this.drawPancake(pancake);
    }
    for (const pancake of state.fallingPancakes) {
      this.drawPancake(pancake);
    }
  }

  private drawBackground(): void {
    const { ctx } = this;
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#ADE8F4');
    gradient.addColorStop(1, '#CAF0F8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Table surface at bottom
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(0, CANVAS_HEIGHT - 24, CANVAS_WIDTH, 6);
  }

  private drawPlate(plate: PlateState): void {
    const { ctx } = this;
    const { x, y, width, height } = plate;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(x, y + 4, width / 2 + 2, height / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Plate body
    ctx.fillStyle = '#F5F5F5';
    ctx.strokeStyle = '#D0D0D0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rim highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y - 1, width / 2 - 4, height / 2 - 2, 0, Math.PI + 0.3, Math.PI * 2 - 0.3);
    ctx.stroke();
  }

  private drawPancake(pancake: PancakeState): void {
    const { ctx } = this;
    const { x, y, width, height } = pancake;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(x, y + 3, width / 2 + 1, height / 2 + 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pancake body
    ctx.fillStyle = '#D4A039';
    ctx.strokeStyle = '#A67C20';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Darker bottom edge
    ctx.fillStyle = 'rgba(120, 80, 20, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2 - 1, height / 2 - 1, 0, 0.1, Math.PI - 0.1);
    ctx.fill();

    // Butter pat
    const butterW = width * 0.18;
    const butterH = height * 0.35;
    ctx.fillStyle = '#FFE066';
    ctx.strokeStyle = '#E6C84D';
    ctx.lineWidth = 0.8;
    this.roundedRect(x - butterW / 2, y - butterH / 2 - 1, butterW, butterH, 2);
    ctx.fill();
    ctx.stroke();
  }

  private roundedRect(x: number, y: number, w: number, h: number, r: number): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/game/rendering/
git commit -m "feat: add canvas renderer with pancake, plate, and background drawing"
```

---

### Task 5: Game Engine

**Files:**
- Create: `src/game/GameEngine.ts`

**Step 1: Create src/game/GameEngine.ts**

```ts
import { GameState } from './types';
import { createPlate } from './entities/Plate';
import { InputSystem } from './systems/InputSystem';
import { SpawnSystem } from './systems/SpawnSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { Renderer } from './rendering/Renderer';

export type StateCallback = (score: number, status: 'idle' | 'playing') => void;

export class GameEngine {
  private state: GameState;
  private input = new InputSystem();
  private spawn = new SpawnSystem();
  private physics = new PhysicsSystem();
  private renderer: Renderer;
  private lastTime = 0;
  private animFrameId = 0;
  private onStateChange: StateCallback;

  constructor(canvas: HTMLCanvasElement, onStateChange: StateCallback) {
    this.renderer = new Renderer(canvas);
    this.onStateChange = onStateChange;
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      plate: createPlate(),
      fallingPancakes: [],
      stackedPancakes: [],
      score: 0,
      status: 'idle',
    };
  }

  init(): void {
    this.input.attach();
    this.lastTime = performance.now();
    this.onStateChange(this.state.score, this.state.status);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.input.detach();
  }

  private loop = (time: number): void => {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    if (this.state.status === 'idle' && this.input.consumeKey(' ')) {
      this.state.status = 'playing';
      this.spawn.reset();
      this.onStateChange(this.state.score, this.state.status);
    }

    if (this.state.status === 'playing') {
      const prevScore = this.state.score;
      this.spawn.update(this.state, dt);
      this.physics.update(this.state, dt, this.input);
      if (this.state.score !== prevScore) {
        this.onStateChange(this.state.score, this.state.status);
      }
    }

    this.renderer.render(this.state);
    this.animFrameId = requestAnimationFrame(this.loop);
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/game/GameEngine.ts
git commit -m "feat: add game engine with loop orchestration and state management"
```

---

### Task 6: React Components and Styles

**Files:**
- Create: `src/components/GameCanvas.tsx`
- Create: `src/components/HUD.tsx`
- Create: `src/App.tsx`
- Modify: `src/main.tsx`
- Create: `src/styles/index.css`

**Step 1: Create src/components/GameCanvas.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/types';

interface GameCanvasProps {
  onScoreChange: (score: number) => void;
  onStatusChange: (status: 'idle' | 'playing') => void;
}

export function GameCanvas({ onScoreChange, onStatusChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onScoreChange, onStatusChange });
  callbacksRef.current = { onScoreChange, onStatusChange };

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, (score, status) => {
      callbacksRef.current.onScoreChange(score);
      callbacksRef.current.onStatusChange(status);
    });

    engine.init();
    return () => engine.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="game-canvas"
    />
  );
}
```

**Step 2: Create src/components/HUD.tsx**

```tsx
interface HUDProps {
  score: number;
  status: 'idle' | 'playing';
}

export function HUD({ score, status }: HUDProps) {
  return (
    <div className="hud">
      {status === 'playing' && (
        <div className="score">Pancakes: {score}</div>
      )}
      {status === 'idle' && (
        <div className="overlay">
          <h1 className="title">Pancake Catcher!</h1>
          <p className="subtitle">Press Space to Start</p>
          <p className="controls">Use arrow keys to move</p>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create src/App.tsx**

```tsx
import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';

export function App() {
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing'>('idle');

  return (
    <div className="game-container">
      <GameCanvas onScoreChange={setScore} onStatusChange={setStatus} />
      <HUD score={score} status={status} />
    </div>
  );
}
```

**Step 4: Update src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Step 5: Create src/styles/index.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #1a1a2e;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.game-container {
  position: relative;
  display: inline-block;
}

.game-canvas {
  display: block;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.score {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: 700;
  color: #2d3436;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(2px);
  border-radius: 12px;
}

.title {
  font-size: 48px;
  font-weight: 800;
  color: #D4A039;
  text-shadow: 2px 2px 0 #A67C20, 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  color: #2d3436;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 24px;
  border-radius: 20px;
  animation: pulse 2s ease-in-out infinite;
}

.controls {
  margin-top: 12px;
  font-size: 14px;
  color: #636e72;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 16px;
  border-radius: 12px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

**Step 6: Verify build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Build succeeds.

**Step 7: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 8: Commit**

```bash
git add src/
git commit -m "feat: add React components, HUD, and styles — game fully playable"
```

---

### Task 7: Manual Verification and Polish

**Step 1: Start dev server and play-test**

Run: `npx vite`

Verify all of the following in the browser:
- Canvas renders with pastel blue background and brown table
- "Pancake Catcher!" title screen with "Press Space to Start" shown
- Pressing Space starts the game, overlay disappears, score counter appears
- Pancakes fall from random horizontal positions
- Arrow keys move the plate smoothly, plate stays within bounds
- Catching a pancake stacks it on the plate, score increments
- Stacked pancakes move with the plate
- Missed pancakes disappear below the screen (no crash)
- Game runs smoothly at 60fps

**Step 2: Fix any issues found during play-testing**

**Step 3: Final commit if any polish changes were made**

```bash
git add -A
git commit -m "polish: final tweaks from play-testing"
```
