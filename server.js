import { WebSocketServer } from "ws";
import { CANVAS_HEIGHT, CANVAS_WIDTH, TICK_LENGTH } from "./src/constants.mjs";
import { gameLoop, sendState } from "./src/serverFunctions.mjs";
import { Player } from "./src/functions.mjs";
const SERVER_PORT = 6970;
const wss = new WebSocketServer({ port: SERVER_PORT });
const players = new Map();
let playerId = 0;
wss.on("connection", (ws) => {
    console.log("player id:", playerId, "connected");
    const player = new Player(playerId, Math.floor(Math.random() * CANVAS_WIDTH), Math.floor(Math.random() * CANVAS_HEIGHT), ws);
    players.set(playerId, player);
    playerId++;
    ws.send(JSON.stringify({
        kind: "IDENT",
        data: player.msgData(),
    }));
    ws.on("close", () => {
        console.log(`player ${player.id} disconected`);
        players.delete(player.id);
    });
    ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        switch (msg.kind) {
            case "PLAYER_ACTION": {
                // console.log(msg.direction);
                player.setAcceleration(msg.direction, msg.start ? 1 : 0);
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
//# sourceMappingURL=server.js.map