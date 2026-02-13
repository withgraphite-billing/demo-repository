import {
  GameState,
  PancakeState,
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

      if (this.checkCatch(pancake, state, landingSurface)) {
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

  checkCatch(pancake: PancakeState, state: GameState, landingSurface: number): boolean {
    const pancakeBottom = pancake.y + pancake.height / 2;

    const surface = state.stackedPancakes.length > 0
      ? state.stackedPancakes[state.stackedPancakes.length - 1]
      : state.plate;

    const horizontalOverlap =
      pancake.x + pancake.width / 2 > surface.x - surface.width / 2 &&
      pancake.x - pancake.width / 2 < surface.x + surface.width / 2;

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
