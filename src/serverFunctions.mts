import { IDiscMsg, IMsg, IPlayer, IPlayerMsgData, IStateMsg } from "../server";
import { TICK_LENGTH } from "./constants.mjs";
import { Player } from "./functions.mjs";

export const gameLoop = (players: Map<number, Player>) => {
  players.forEach((player) => {
    player.update(TICK_LENGTH);
  });
};

export const sendState = (players: Map<number, Player>) => {
  const state: IPlayerMsgData[] = [];
  players.forEach((player, key) => {
    state.push(player.msgData());
  });
  players.forEach((player) => {
    player.ws.send(JSON.stringify({ kind: "STATE", data: state } as IStateMsg));
  });
};

export const sendDisconect = (
  players: Map<number, Player>,
  disconectedPlayerId: number
) => {
  const state: IPlayerMsgData[] = [];
  players.forEach((player) => {
    player.ws.send(
      JSON.stringify({
        kind: "DISCONNECT",
        data: disconectedPlayerId,
      } as IDiscMsg)
    );
  });
};
