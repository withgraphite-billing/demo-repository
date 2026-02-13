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
