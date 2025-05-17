import { Room, Ship, Player } from 'model';

export interface StartGameMessage {
  ships: Ship[];
  currentPlayerIndex: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStartGameMessage = (game: any): StartGameMessage => {
  return {
    ships: game.ships,
    currentPlayerIndex: game.currentPlayerIndex,
  };
};

export interface UpdateRoomMessage {
  roomId: string;
  roomUsers: [Player?, Player?];
}

export const getUpdateRoomMessage = (rooms: Room[]): UpdateRoomMessage[] => {
  const res: UpdateRoomMessage[] = [];
  for (const room of rooms) {
    res.push({
      roomId: room.roomId,
      roomUsers: room.roomUsers,
    });
  }
  return res;
};
