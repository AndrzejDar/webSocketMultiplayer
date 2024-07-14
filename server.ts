import { WebSocket, WebSocketServer } from "ws";
import { CANVAS_HEIGHT, CANVAS_WIDTH, TICK_LENGTH } from "./src/constants.mjs";
import { gameLoop, sendState } from "./src/serverFunctions.mjs";
import { OtherPlayer, Player } from "./src/functions.mjs";
import { Direction } from "./src/common.mjs";

const SERVER_PORT = 6970;

export interface IPlayer {
  id: number;
  ws: WebSocket;
  x: number;
  y: number;
  acceleration: { x: number; y: number };
  velocity: { x: number; y: number };
}

export interface IActionMsg {
  kind: "PLAYER_ACTION";
  start: boolean;
  direction: Direction;
  timestamp: number;
}

export interface IPlayerMsgData extends Omit<IPlayer, "ws"> {
  timestamp: number | null;
}

export interface IMsg {
  kind: "IDENT" | "STATE";
  data: IPlayerMsgData;
}
export interface IStateMsg {
  kind: "STATE";
  data: IPlayerMsgData[];
}

const wss = new WebSocketServer({ port: SERVER_PORT });
const players = new Map<number, Player>();
let playerId = 0;
wss.on("connection", (ws) => {
  console.log("player id:", playerId, "connected");
  const player = new Player(
    playerId,
    Math.floor(Math.random() * CANVAS_WIDTH),
    Math.floor(Math.random() * CANVAS_HEIGHT),
    ws
  );
  players.set(playerId, player);
  playerId++;
  ws.send(
    JSON.stringify({
      kind: "IDENT",
      data: player.msgData(),
    } as IMsg)
  );

  ws.on("close", () => {
    console.log(`player ${player.id} disconected`);
    players.delete(player.id);
  });

  ws.on("message", (data) => {
    const msg: IActionMsg = JSON.parse(data.toString());
    switch (msg.kind) {
      case "PLAYER_ACTION": {
        // console.log(msg.direction);
        player.setAction(msg.direction, msg.start ? 1 : 0);
        player.addActionTimestamp(msg.timestamp);
        break;
      }
    }
  });
});

console.log(`SERVER listening to ws://localhost:${SERVER_PORT}`);

const loop = () => {
  const startTime = performance.now();
  gameLoop(players);
  sendState(players);
  const elapsed = performance.now() - startTime;
  const delay = Math.max(0, TICK_LENGTH - elapsed);
  setTimeout(loop, delay);
};

loop();

// const interval = setInterval(() => {
//   gameLoop(players);
//   sendState(players);
// }, TICK_LENGTH);
