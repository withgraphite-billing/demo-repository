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

    this.ctx.save();
    this.ctx.translate(0, -state.cameraY);

    this.drawPlate(state.plate);
    for (const pancake of state.stackedPancakes) {
      this.drawPancake(pancake);
    }
    for (const pancake of state.fallingPancakes) {
      this.drawPancake(pancake);
    }

    this.ctx.restore();
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
