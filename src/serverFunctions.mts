import { IMsg, IPlayer, IPlayerMsgData, IStateMsg } from "../server";
import { TICK_LENGTH } from "./constants.mjs";
import { Player } from "./functions.mjs";

export const gameLoop = (players: Map<Number, Player>) => {
  players.forEach((player) => {
    player.update(TICK_LENGTH);
  });
};

export const sendState = (players: Map<Number, Player>) => {
  const state: IPlayerMsgData[] = [];
  players.forEach((player, key) => {
    state.push(player.msgData());
  });
  players.forEach((player) => {
    player.ws.send(JSON.stringify({ kind: "STATE", data: state } as IStateMsg));
  });
};
