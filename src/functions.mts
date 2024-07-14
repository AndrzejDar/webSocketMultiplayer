import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PLAYER_COLOR,
  PLAYER_RADIUS,
} from "./constants.mjs";

export const getCanvas = () => {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext("2d");
  return { canvas, context };
};

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) => {
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fill();
  ctx.closePath();
};

export class FPSCounter {
  timestamps: number[];
  drawTimes: number[];
  ctx;
  x: number;
  y: number;
  drawStart: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.timestamps = [];
    this.drawTimes = [];
    this.x = 600;
    this.y = 50;
    this.drawStart = 0;
  }

  setDrawStart() {
    this.drawStart = performance.now();
  }
  draw(timestamp: number) {
    this.timestamps.push(timestamp);
    const secAgo = timestamp - 1000;
    while (this.timestamps.length > 0 && this.timestamps[0] < secAgo) {
      this.timestamps.shift();
    }

    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white"; // Text color
    this.ctx.textAlign = "center"; // Text alignment
    this.ctx.textBaseline = "middle"; // Vertical alignment

    const drawText = (text: string, x: number, y: number) => {
      this.ctx.fillText(text, x, y);
    };
    const drawTime = Number((performance.now() - this.drawStart).toFixed(2));
    if (this.drawTimes.length > 500) this.drawTimes.shift();
    this.drawTimes.push(drawTime);
    const avgDrawTime =
      this.drawTimes.reduce((a, b) => a + b) / this.drawTimes.length;

    drawText(
      `${this.timestamps.length} FPS, ${avgDrawTime.toFixed(2)}ms`,
      this.x,
      this.y
    );
  }
}
