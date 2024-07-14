import { WebSocketServer } from "ws";
import { CANVAS_HEIGHT, CANVAS_WIDTH, TICK_LENGTH } from "./src/constants.mjs";
import { gameLoop, sendState } from "./src/serverFunctions.mjs";
const SERVER_PORT = 6970;
const wss = new WebSocketServer({ port: SERVER_PORT });
const players = new Map();
let playerId = 0;
wss.on("connection", (ws) => {
    console.log("player id:", playerId, "connected");
    const player = {
        id: playerId,
        ws: ws,
        x: Math.floor(Math.random() * CANVAS_WIDTH),
        y: Math.floor(Math.random() * CANVAS_HEIGHT),
    };
    players.set(player.id, player);
    playerId++;
    const { ws: _, ...playerSelf } = player;
    ws.send(JSON.stringify({
        kind: "IDENT",
        data: playerSelf,
    }));
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
//# sourceMappingURL=server.js.map