import { ACCELERATION, DRAG, MAX_VELOCITY } from "./common.mjs";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_COLOR, PLAYER_RADIUS, } from "./constants.mjs";
export const getCanvas = () => {
    const canvas = document.getElementById("game");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext("2d");
    return { canvas, context };
};
export const drawPlayer = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fill();
    ctx.closePath();
};
export class FPSCounter {
    timestamps;
    drawTimes;
    ctx;
    x;
    y;
    drawStart;
    constructor(ctx) {
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
    draw(timestamp) {
        this.timestamps.push(timestamp);
        const secAgo = timestamp - 1000;
        while (this.timestamps.length > 0 && this.timestamps[0] < secAgo) {
            this.timestamps.shift();
        }
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "white"; // Text color
        this.ctx.textAlign = "center"; // Text alignment
        this.ctx.textBaseline = "middle"; // Vertical alignment
        const drawText = (text, x, y) => {
            this.ctx.fillText(text, x, y);
        };
        const drawTime = Number((performance.now() - this.drawStart).toFixed(2));
        if (this.drawTimes.length > 500)
            this.drawTimes.shift();
        this.drawTimes.push(drawTime);
        const avgDrawTime = this.drawTimes.reduce((a, b) => a + b) / this.drawTimes.length;
        drawText(`${this.timestamps.length} FPS, ${avgDrawTime.toFixed(2)}ms`, this.x, this.y);
    }
}
export class OtherPlayer {
    id;
    x;
    y;
    velocity;
    acceleration;
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
    }
    update(deltaTime) {
        if (this.acceleration.x !== 0) {
            this.velocity.x += this.acceleration.x * deltaTime;
        }
        else {
            this.velocity.x *= 1 - DRAG * deltaTime;
        }
        if (this.acceleration.y !== 0) {
            this.velocity.y += this.acceleration.y * deltaTime;
        }
        else {
            this.velocity.y *= 1 - DRAG * deltaTime;
        }
        this.velocity.x = Math.max(-MAX_VELOCITY, Math.min(this.velocity.x, MAX_VELOCITY));
        this.velocity.y = Math.max(-MAX_VELOCITY, Math.min(this.velocity.y, MAX_VELOCITY));
        this.x = Math.max(0, Math.min(this.x + this.velocity.x * deltaTime, CANVAS_WIDTH));
        this.y = Math.max(0, Math.min(this.y + this.velocity.y * deltaTime, CANVAS_HEIGHT));
    }
    updateFromServer(data) {
        this.x = data.x;
        this.y = data.y;
        this.acceleration = data.acceleration;
        this.velocity = data.velocity;
    }
    setAction(direction, enable) {
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
    draw = (ctx) => {
        ctx.beginPath();
        ctx.arc(this.x, this.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER_COLOR;
        ctx.fill();
        ctx.closePath();
    };
}
export class Player extends OtherPlayer {
    ws;
    actionDelays;
    actionsTimestamps;
    constructor(id, x, y, ws) {
        super(id, x, y);
        this.ws = ws;
        this.actionDelays = [60];
        this.actionsTimestamps = [];
    }
    msgData() {
        const data = {
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
    setActionWithDealy(direction, enable) {
        setTimeout(() => {
            this.setAction(direction, enable);
        }, this.actionDelays.reduce((a, b) => a + b) / this.actionDelays.length);
    }
    addActionTimestamp(timestamp) {
        this.actionsTimestamps.push(timestamp);
    }
    pushCalculatedDelay(delay) {
        this.actionDelays.push(delay);
        console.log("calculated delay", delay);
        if (this.actionDelays.length > 5) {
            this.actionDelays.shift();
        }
    }
}
//# sourceMappingURL=functions.mjs.map