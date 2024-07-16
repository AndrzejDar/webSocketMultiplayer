import { Player } from "./functions.mjs";
const BOT_ACTIONS = {
    0: "left",
    1: "right",
    2: "up",
    3: "down",
};
export class Bot extends Player {
    lastDirection;
    actionInterval;
    constructor(id, x, y, ws) {
        super(id, x, y, ws);
        this.lastDirection = null;
        this.actionInterval = 0;
    }
    randomAction() {
        if (this.actionInterval === 0) {
            if (this.lastDirection) {
                this.ws.send(JSON.stringify({
                    kind: "PLAYER_ACTION",
                    start: false,
                    direction: this.lastDirection,
                    timestamp: performance.now(),
                }));
                this.lastDirection = null;
                this.actionInterval = Math.floor(Math.random() * 4);
                // console.log("direction:", this.lastDirection);
            }
            else {
                const direction = BOT_ACTIONS[Math.floor(Math.random() * 4)];
                this.ws.send(JSON.stringify({
                    kind: "PLAYER_ACTION",
                    start: true,
                    direction,
                    timestamp: performance.now(),
                }));
                this.lastDirection = direction;
                this.actionInterval = Math.floor(Math.random() * 4);
                // console.log("direction:", direction);
            }
        }
        else {
            this.actionInterval--;
        }
    }
}
//# sourceMappingURL=bot.mjs.map