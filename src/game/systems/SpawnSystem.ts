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
