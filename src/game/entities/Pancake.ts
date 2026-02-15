import { PancakeState, PANCAKE_BASE_WIDTH, PANCAKE_HEIGHT, CANVAS_WIDTH } from '../types';

export function createPancake(cameraY: number = 0): PancakeState {
  const widthVariation = 0.9 + Math.random() * 0.2;
  const width = PANCAKE_BASE_WIDTH * widthVariation;
  const x = width / 2 + Math.random() * (CANVAS_WIDTH - width);
  return {
    x,
    y: cameraY - PANCAKE_HEIGHT,
    width,
    height: PANCAKE_HEIGHT,
    stackOffsetX: 0,
  };
}
