import { PLAYER_COLOR, PLAYER_RADIUS } from "./constants";
export const getCanvas = () => {
    const canvas = document.getElementById("game");
    canvas.width = 100;
    canvas.height = 100;
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
//# sourceMappingURL=functions.js.map