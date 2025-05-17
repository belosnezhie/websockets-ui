export interface IncomingRequest {
  type: string;
  data: string;
  id: 0;
}

export interface SocketResponse {
  type: string;
  data: string;
  id: 0;
}

export const messageTypes = {
  REG: 'reg',
  UPDATE_WINNERS: 'update_winners',
  CREATE_ROOM: 'create_room',
  UPDATE_ROOM: 'update_room',
  CREATE_GAME: 'create_game',
  ADD_USER_TO_ROOM: 'add_user_to_room',
  ADD_SHIPS: 'add_ships',
  START_GAME: 'start_game',
  ATTACK: 'attack',
  RANDOM_ATTACK: 'randomAttack',
  TURN: 'turn',
  FINISH: 'finish',
};

export interface PlayerData {
  name: string;
  password: string;
}

export interface Player {
  name: string;
  index: string;
  error?: boolean;
  errorText?: string;
}

export interface Winner {
  name: string;
  wins: number;
}

export interface Room {
  roomId: string;
  roomUsers: [Player?, Player?];
  shipsByUserID: Map<string, Ship[]>;
  roomStatus?: 'available' | 'occupied';
}

export interface RoomData {
  indexRoom: string;
}

export interface Game {
  idGame: string;
  idPlayer: string;
}

export interface GameData {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
}

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

interface Position {
  x: number;
  y: number;
}
