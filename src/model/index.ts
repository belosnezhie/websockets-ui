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

export const RequestTypes = {
  REG: 'reg',
  UPDATE_WINNERS: 'update_winners',
  CREATE_ROOM: 'create_room',
  ADD_USER_TO_ROOM: 'add_user_to_room',
  ADD_SHIPS: 'add_ships',
  STERT_GAME: 'start_game',
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
  error: boolean;
  errorText: string;
}
