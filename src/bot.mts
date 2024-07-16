import { IActionMsg } from "../server";
import { Direction } from "./common.mjs";
import { Player } from "./functions.mjs";

const BOT_ACTIONS: { [key: string]: Direction } = {
  0: "left",
  1: "right",
  2: "up",
  3: "down",
};

export class Bot extends Player {
  lastDirection: Direction | null;
  actionInterval: number;

  constructor(
    id: number,
    x: number,
    y: number,
    ws: WebSocket | import("ws").WebSocket
  ) {
    super(id, x, y, ws);
    this.lastDirection = null;
    this.actionInterval = 0;
  }

  randomAction() {
    if (this.actionInterval === 0) {
      if (this.lastDirection) {
        this.ws.send(
          JSON.stringify({
            kind: "PLAYER_ACTION",
            start: false,
            direction: this.lastDirection,
            timestamp: performance.now(),
          } as IActionMsg)
        );
        this.lastDirection = null;
        this.actionInterval = Math.floor(Math.random() * 4);
        // console.log("direction:", this.lastDirection);
      } else {
        const direction = BOT_ACTIONS[Math.floor(Math.random() * 4)];
        this.ws.send(
          JSON.stringify({
            kind: "PLAYER_ACTION",
            start: true,
            direction,
            timestamp: performance.now(),
          } as IActionMsg)
        );
        this.lastDirection = direction;
        this.actionInterval = Math.floor(Math.random() * 4);
        // console.log("direction:", direction);
      }
    } else {
      this.actionInterval--;
    }
  }
}
