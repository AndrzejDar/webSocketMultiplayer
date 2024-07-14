export const gameLoop = (players) => { };
export const sendState = (players) => {
    const state = [];
    players.forEach((player, key) => {
        state.push(trimPlayerObject(player));
    });
    players.forEach((player) => {
        player.ws.send(JSON.stringify({ kind: "STATE", data: state }));
    });
};
const trimPlayerObject = (player) => {
    const { ws: _, ...trimedPlayer } = player;
    return trimedPlayer;
};
//# sourceMappingURL=serverFunctions.mjs.map