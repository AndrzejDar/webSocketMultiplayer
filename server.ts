import { WebSocket, WebSocketServer } from "ws";
import { CANVAS_HEIGHT, CANVAS_WIDTH, TICK_LENGTH } from "./src/constants.mjs";
import { gameLoop, sendState } from "./src/serverFunctions.mjs";

const SERVER_PORT = 6970;

export interface IPlayer {
  id: number;
  ws: WebSocket;
  x: number;
  y: number;
}
export interface IPlayerMsgData extends Omit<IPlayer, "ws"> {}

export interface IMsg {
  kind: "IDENT" | "STATE";
  data: IPlayerMsgData;
}
export interface IStateMsg {
  kind: "STATE";
  data: IPlayerMsgData[];
}

const wss = new WebSocketServer({ port: SERVER_PORT });
const players = new Map<number, IPlayer>();
let playerId = 0;
wss.on("connection", (ws) => {
  console.log("player id:", playerId, "connected");
  const player: IPlayer = {
    id: playerId,
    ws: ws,
    x: Math.floor(Math.random() * CANVAS_WIDTH),
    y: Math.floor(Math.random() * CANVAS_HEIGHT),
  };
  players.set(player.id, player);
  playerId++;

  const { ws: _, ...playerSelf } = player;
  ws.send(
    JSON.stringify({
      kind: "IDENT",
      data: playerSelf as IPlayerMsgData,
    } as IMsg)
  );

  ws.on("close", () => {
    console.log(`player ${player.id} disconected`);
    players.delete(player.id);
  });
});

console.log(`SERVER listening to ws://localhost:${SERVER_PORT}`);

const interval = setInterval(() => {
  gameLoop(players);
  sendState(players);
}, TICK_LENGTH);
