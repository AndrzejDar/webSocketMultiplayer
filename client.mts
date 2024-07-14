import { IActionMsg, IPlayerMsgData } from "./server";
import { Direction } from "./src/common.mjs";
import { FPS_LIMIT } from "./src/constants.mjs";
import {
  drawPlayer,
  FPSCounter,
  getCanvas,
  OtherPlayer,
  Player,
} from "./src/functions.mjs";

const { canvas, context } = getCanvas();
if (!context) throw new Error("Failed to obtain 2D context from canvas.");

interface IPlayer {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: { x: number; y: number };
}
interface IMsg {
  kind: "IDENT" | "STATE";
  data: any;
}

const DIRECTION_KEYS: { [key: string]: Direction } = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  KeyA: "left",
  KeyD: "right",
  KeyS: "down",
  KeyW: "up",
};

let player: Player | null = null;
let players = new Map<number, OtherPlayer>();

(async () => {
  const ws = new WebSocket("ws://localhost:6970");
  ws.addEventListener("open", (e) => {
    console.log("WS open", e);
  });
  ws.addEventListener("close", (e) => {
    console.log("WS close", e);
  });
  ws.addEventListener("error", (e) => {
    console.log("WS error", e);
  });
  ws.addEventListener("message", (e) => {
    const data: IMsg = JSON.parse(e.data);
    const payload = data.data;

    switch (data.kind) {
      case "IDENT": {
        const self: IPlayer = payload;
        if (!player) {
          player = new Player(self.id, self.x, self.y, ws);
          console.log(`My id is ${player.id}`);
        }
        break;
      }
      case "STATE": {
        payload.forEach((playerUpdate: IPlayerMsgData) => {
          // console.log(payload);
          const otherPlayer = players.get(playerUpdate.id);
          if (!otherPlayer)
            players.set(
              playerUpdate.id,
              new OtherPlayer(playerUpdate.id, playerUpdate.x, playerUpdate.y)
            );
          else {
            otherPlayer.updateFromServer(playerUpdate);
          }
          if (player && player.id == playerUpdate.id) {
            player?.updateFromServer(playerUpdate);

            const sendingTimestamp = player.actionsTimestamps.filter(
              (timestamp) => timestamp === playerUpdate.timestamp
            );
            if (sendingTimestamp[0]) {
              const currTimestamp = performance.now();
              player.pushCalculatedDelay(currTimestamp - sendingTimestamp[0]);
            }
          }
        });
        // console.log(players.length);
        break;
      }
      default: {
        console.log("unknown msg", data);
        console.log(data.kind, payload);
      }
    }
  });

  let lastFrameTimestamp = 0;
  const counter = new FPSCounter(context);

  const drawGame = (timestamp: number) => {
    const deltaTime = timestamp - lastFrameTimestamp;

    if (deltaTime > 1000 / FPS_LIMIT) {
      counter.setDrawStart();
      lastFrameTimestamp = timestamp;
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (player) {
        player.update(deltaTime);
        player.draw(context);
      }
      players.forEach((otherPlayer) => {
        otherPlayer.update(deltaTime);
        otherPlayer.draw(context);
      });

      counter.draw(timestamp);
    }
    window.requestAnimationFrame(drawGame);
  };

  window.requestAnimationFrame(drawGame);
})();

window.addEventListener("keydown", (e) => {
  if (player !== null) {
    if (!e.repeat) {
      const direction = DIRECTION_KEYS[e.code];
      if (direction !== undefined) {
        player.setActionWithDealy(direction, 1);
        player.addActionTimestamp(performance.now());
        player.ws.send(
          JSON.stringify({
            kind: "PLAYER_ACTION",
            start: true,
            direction,
            timestamp: performance.now(),
          } as IActionMsg)
        );
      }
    }
  }
});
window.addEventListener("keyup", (e) => {
  if (player !== null) {
    if (!e.repeat) {
      const direction = DIRECTION_KEYS[e.code];
      if (direction !== undefined) {
        player.setAction(direction, 0);
        player.ws.send(
          JSON.stringify({
            kind: "PLAYER_ACTION",
            start: false,
            direction,
          })
        );
      }
    }
  }
});
