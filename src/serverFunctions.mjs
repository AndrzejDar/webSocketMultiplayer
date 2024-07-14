import { TICK_LENGTH } from "./constants.mjs";
export const gameLoop = (players) => {
    players.forEach((player) => {
        player.update(TICK_LENGTH);
    });
};
export const sendState = (players) => {
    const state = [];
    players.forEach((player, key) => {
        state.push(player.msgData());
    });
    players.forEach((player) => {
        player.ws.send(JSON.stringify({ kind: "STATE", data: state }));
    });
};
//# sourceMappingURL=serverFunctions.mjs.map