import { PlateState, PLATE_WIDTH, PLATE_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types';

export function createPlate(): PlateState {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    width: PLATE_WIDTH,
    height: PLATE_HEIGHT,
  };
}
