import { FPS_LIMIT } from "./src/constants.mjs";
import { drawPlayer, FPSCounter, getCanvas } from "./src/functions.mjs";

const { canvas, context } = getCanvas();
if (!context) throw new Error("Failed to obtain 2D context from canvas.");

interface IPlayer {
  id: number;
  x: number;
  y: number;
}
interface IMsg {
  kind: "IDENT" | "STATE";
  data: any;
}

let player: IPlayer | null = null;
let players: IPlayer[] = [];

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
    console.log("changeda");

    switch (data.kind) {
      case "IDENT": {
        const self: IPlayer = payload;
        if (!player) {
          player = self;
          console.log(`My id is ${player.id}`);
        }
        // drawPlayer(context, player.x, player.y);
        break;
      }
      case "STATE": {
        console.log(payload.length);
        players = payload;
        break;
      }
      default: {
        console.log("unknown msg", data);
        console.log(data.kind, payload);
      }
    }
  });
})();

let lastFrameTimestamp = 0;
const counter = new FPSCounter(context);

const drawGame = (timestamp: number) => {
  const deltaTime = timestamp - lastFrameTimestamp; //in ms

  if (deltaTime > 1000 / FPS_LIMIT) {
    counter.setDrawStart();
    lastFrameTimestamp = timestamp;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (player) {
      drawPlayer(context, player?.x, player?.y);
    }
    if (players) {
      for (let i = 0; i < 10; i++) {
        players.forEach((otherPlayer) => {
          if (otherPlayer.id != player?.id) {
            drawPlayer(context, otherPlayer.x, otherPlayer.y);
          }
        });
      }
    }
    counter.draw(timestamp);
  }
  window.requestAnimationFrame(drawGame);
};

window.requestAnimationFrame(drawGame);
