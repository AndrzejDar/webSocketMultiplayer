import { IPlayerMsgData } from "./server";
import { Bot } from "./src/bot.mjs";
import { BOT_COUNT, BOT_TICK_LENGTH } from "./src/constants.mjs";
import { OtherPlayer } from "./src/functions.mjs";
import { WebSocket } from "ws";

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

for (let i = 0; i < BOT_COUNT; i++) {
  let bot: Bot | null = null;
  let players = new Map<number, OtherPlayer>();

  (() => {
    const ws = new WebSocket("ws://localhost:6970");
    ws.addEventListener("open", (e) => {
      console.log("WS open");
    });
    ws.addEventListener("close", (e) => {
      console.log("WS close", e);
    });
    ws.addEventListener("error", (e) => {
      console.log("WS error", e);
    });
    ws.addEventListener("message", (e) => {
      const data: IMsg = JSON.parse(e.data as string);
      const payload = data.data;

      switch (data.kind) {
        case "IDENT": {
          const self: IPlayer = payload;
          if (!bot) {
            bot = new Bot(self.id, self.x, self.y, ws);
            console.log(`My BOT id is ${bot.id}`);
          }
          break;
        }
        case "STATE": {
          payload.forEach((playerUpdate: IPlayerMsgData) => {
            const otherPlayer = players.get(playerUpdate.id);
            if (!otherPlayer)
              players.set(
                playerUpdate.id,
                new OtherPlayer(playerUpdate.id, playerUpdate.x, playerUpdate.y)
              );
            else {
              otherPlayer.updateFromServer(playerUpdate);
            }
            if (bot && bot.id == playerUpdate.id) {
              bot?.updateFromServer(playerUpdate);

              const sendingTimestamp = bot.actionsTimestamps.filter(
                (timestamp) => timestamp === playerUpdate.timestamp
              );
              if (sendingTimestamp[0]) {
                const currTimestamp = performance.now();
                bot.pushCalculatedDelay(currTimestamp - sendingTimestamp[0]);
              }
            }
          });
          break;
        }
        default: {
          console.log("unknown msg", data);
        }
      }
    });

    const simulatGame = () => {
      if (bot) {
        bot.randomAction();
        bot.update(BOT_TICK_LENGTH);
      }
      players.forEach((otherPlayer) => {
        otherPlayer.update(BOT_TICK_LENGTH);
      });
    };

    const loop = () => {
      const startTime = performance.now();
      simulatGame();
      const elapsed = performance.now() - startTime;
      const delay = Math.max(0, BOT_TICK_LENGTH - (elapsed % BOT_TICK_LENGTH));
      setTimeout(loop, delay);
    };

    loop();
  })();
}
