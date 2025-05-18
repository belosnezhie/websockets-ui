import { Room, Ship, Player, Position, Attack } from 'model';

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

export interface AttackMessage {
  position: Position;
  currentPlayer: string;
  status: 'miss' | 'killed' | 'shot';
}

export const getAttackMessage = (
  attackData: Attack,
  result: 'miss' | 'killed' | 'shot',
): AttackMessage => {
  return {
    position: {
      x: attackData.x,
      y: attackData.y,
    },
    currentPlayer: attackData.indexPlayer,
    status: result,
  };
};
