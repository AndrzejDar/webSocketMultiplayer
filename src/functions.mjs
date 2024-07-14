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
//# sourceMappingURL=functions.mjs.map