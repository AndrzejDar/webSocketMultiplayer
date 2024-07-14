import { IMsg, IPlayer, IPlayerMsgData, IStateMsg } from "../server";

export const gameLoop = (players: Map<Number, IPlayer>) => {};

export const sendState = (players: Map<Number, IPlayer>) => {
  const state: IPlayerMsgData[] = [];
  players.forEach((player, key) => {
    state.push(trimPlayerObject(player));
  });
  players.forEach((player) => {
    player.ws.send(JSON.stringify({ kind: "STATE", data: state } as IStateMsg));
  });
};

const trimPlayerObject = (player: IPlayer) => {
  const { ws: _, ...trimedPlayer } = player;
  return trimedPlayer as IPlayerMsgData;
};
