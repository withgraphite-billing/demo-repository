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
