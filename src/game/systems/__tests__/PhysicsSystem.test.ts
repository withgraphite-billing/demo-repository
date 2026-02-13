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
