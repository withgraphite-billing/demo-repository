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
  cameraY: number;
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
export const CAMERA_LERP_SPEED = 4;
export const CAMERA_COMFORT_ZONE = 0.35;
