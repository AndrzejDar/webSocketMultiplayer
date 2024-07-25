import { IPlayerMsgData } from "../server";
import { ACCELERATION, Direction, DRAG, MAX_VELOCITY } from "./common.mjs";
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
  intervalTimes: number[];
  ctx;
  x: number;
  y: number;
  drawStart: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.timestamps = [];
    this.drawTimes = [];
    this.intervalTimes = [];
    this.x = 400;
    this.y = 40;
    this.drawStart = 0;
  }

  setDrawStartAndInterval(interval: number) {
    this.drawStart = performance.now();
    this.intervalTimes.push(interval);
  }

  draw(timestamp: number) {
    this.timestamps.push(timestamp);
    const secAgo = timestamp - 1000;
    while (this.timestamps.length > 0 && this.timestamps[0] < secAgo) {
      this.timestamps.shift(); //removes frames generated more than 1 sec ago
      this.intervalTimes.shift(); //removes acompaniying interval
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
    const avgDrawToDrawTime =
      this.intervalTimes.reduce((a, b) => a + b) / this.intervalTimes.length;

    drawText(
      `${this.timestamps.length} FPS, drawT: ${avgDrawTime.toFixed(
        3
      )}ms, drawToDraw: ${avgDrawToDrawTime.toFixed(3)} / ${
        this.intervalTimes.length
      }`,
      this.x,
      this.y
    );
  }
}

export class OtherPlayer {
  id: number;
  x: number;
  y: number;
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
  }

  update(deltaTime: number) {
    if (this.acceleration.x !== 0) {
      this.velocity.x += this.acceleration.x * deltaTime;
    } else {
      this.velocity.x *= 1 - DRAG * deltaTime;
    }
    if (this.acceleration.y !== 0) {
      this.velocity.y += this.acceleration.y * deltaTime;
    } else {
      this.velocity.y *= 1 - DRAG * deltaTime;
    }
    this.velocity.x = Math.max(
      -MAX_VELOCITY,
      Math.min(this.velocity.x, MAX_VELOCITY)
    );
    this.velocity.y = Math.max(
      -MAX_VELOCITY,
      Math.min(this.velocity.y, MAX_VELOCITY)
    );

    this.x = Math.max(
      0,
      Math.min(this.x + this.velocity.x * deltaTime, CANVAS_WIDTH)
    );
    this.y = Math.max(
      0,
      Math.min(this.y + this.velocity.y * deltaTime, CANVAS_HEIGHT)
    );
  }

  updateFromServer(data: IPlayerMsgData) {
    this.x = data.x;
    this.y = data.y;
    this.acceleration = data.acceleration;
    this.velocity = data.velocity;
  }

  setAction(direction: Direction, enable: 0 | 1) {
    switch (direction) {
      case "left":
        this.acceleration.x = -1 * ACCELERATION * enable;
        break;
      case "right":
        this.acceleration.x = ACCELERATION * enable;
        break;
      case "up":
        this.acceleration.y = -1 * ACCELERATION * enable;
        break;
      case "down":
        this.acceleration.y = ACCELERATION * enable;
        break;
    }
    // this.acceleration.x = dx;
    // this.acceleration.y = dy;
  }

  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(this.x, this.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fill();
    ctx.closePath();
  };
}

export class Player extends OtherPlayer {
  ws;
  actionDelays: number[];
  actionsTimestamps: number[];
  constructor(
    id: number,
    x: number,
    y: number,
    ws: WebSocket | import("ws").WebSocket
  ) {
    super(id, x, y);
    this.ws = ws;
    this.actionDelays = [60];
    this.actionsTimestamps = [];
  }

  msgData() {
    const data: IPlayerMsgData = {
      id: this.id,
      x: this.x,
      y: this.y,
      acceleration: this.acceleration,
      velocity: this.velocity,
      timestamp: this.actionsTimestamps[0],
    };
    this.actionsTimestamps = [];
    return data;
  }

  setActionWithDealy(direction: Direction, enable: 0 | 1) {
    setTimeout(() => {
      this.setAction(direction, enable);
    }, this.actionDelays.reduce((a, b) => a + b) / this.actionDelays.length);
  }

  addActionTimestamp(timestamp: number) {
    this.actionsTimestamps.push(timestamp);
  }

  pushCalculatedDelay(delay: number) {
    this.actionDelays.push(delay);
    console.log("calculated delay", delay);
    if (this.actionDelays.length > 5) {
      this.actionDelays.shift();
    }
  }
}
