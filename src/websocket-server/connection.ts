import { WebSocket } from 'ws';

import { connectionController } from '../controllers/connection-controller';
import { playerController } from '../controllers/player-controller';
import {
  IncomingRequest,
  messageTypes,
  Room,
  Player,
  GameData,
  Attack,
} from '../model';
import { parseData } from '../utils/parseData';
import { roomController } from '../controllers/room-controller';
import { stateController } from '../controllers/state-controller';
import {
  StartGameMessage,
  getAttackMessage,
  getStartGameMessage,
  getUpdateRoomMessage,
  getWinnersMessage,
  getFinishMessage,
} from '../views';

export function handleConnection(ws: WebSocket) {
  console.log('New player connected');

  ws.on('open', function open() {
    ws.send('Socket opened');
  });

  ws.on('message', (message: Buffer) => {
    console.log('Received:', parseData(message.toString()));
    const incomingMessage: IncomingRequest = parseData(message.toString());

    switch (incomingMessage.type) {
      case messageTypes.REG:
        handleRegistration(ws, incomingMessage);
        break;

      case messageTypes.CREATE_ROOM:
        handleRoomCreation(ws);
        break;

      case messageTypes.ADD_USER_TO_ROOM:
        handleAddingUser(ws, incomingMessage);
        break;

      case messageTypes.ADD_SHIPS:
        handleShipsCreation(incomingMessage);
        break;

      case messageTypes.ATTACK:
        handleAttack(incomingMessage);
        break;
    }
  });

  ws.on('close', () => {
    console.log('Player disconnected');
  });

  ws.on('error', console.error);
}

const handleRegistration = (ws: WebSocket, message: IncomingRequest) => {
  const player = playerController.createPlayer(message.data);
  connectionController.set(ws, player);
  ws.send(wrapResp(message.type, player));
  const rooms = roomController.shareRooms();
  ws.send(wrapResp(messageTypes.UPDATE_ROOM, getUpdateRoomMessage(rooms)));
  const winners = stateController.shareWinners();
  ws.send(wrapResp(messageTypes.UPDATE_WINNERS, getWinnersMessage(winners)));
};

const handleRoomCreation = (ws: WebSocket) => {
  const currentPlayer = connectionController.get(ws);
  if (!currentPlayer) {
    throw new Error('Player does not exist');
  }
  roomController.createRoom(currentPlayer);
  const newRooms = roomController.shareRooms();
  const sockets = connectionController.keys();
  sockets.forEach((socket) => {
    socket.send(
      wrapResp(messageTypes.UPDATE_ROOM, getUpdateRoomMessage(newRooms)),
    );
  });
};

const handleAddingUser = (ws: WebSocket, message: IncomingRequest) => {
  const currentPlayer = connectionController.get(ws);
  if (!currentPlayer) {
    throw new Error('Player does not exist');
  }
  const room: Room[] = roomController.addPlayer(message.data, currentPlayer);
  const players: Player[] = room[0]?.roomUsers as Player[];
  handleDistribution(
    wrapResp(messageTypes.UPDATE_ROOM, getUpdateRoomMessage(room)),
    players,
  );

  players.forEach((player) => {
    const game = roomController.createGame(player);
    handleDistribution(wrapResp(messageTypes.CREATE_GAME, game), [player]);
  });

  const roomID = room[0]?.roomId as string;
  const rooms = roomController.makeRoomUnavailible(roomID);
  handleDistribution(
    wrapResp(messageTypes.UPDATE_ROOM, getUpdateRoomMessage(rooms)),
    players,
  );
};

const handleShipsCreation = (message: IncomingRequest) => {
  roomController.setShips(message.data);
  const data: GameData = parseData(message.data);
  const playerID = data.indexPlayer;
  const room = roomController.findRoomByPlayerID(data.indexPlayer);
  const players: Player[] = room.roomUsers as Player[];
  if (roomController.canGameStart(playerID)) {
    players.forEach((player) => {
      const game = roomController.startGame(playerID);
      const startGameMessage: StartGameMessage = getStartGameMessage(game);
      handleDistribution(wrapResp(messageTypes.START_GAME, startGameMessage), [
        player,
      ]);
      handleTurn(room.nextTurnPlayerID, player);
    });
    roomController.setNextTurnPlayerId(room.nextTurnPlayerID);
  }
};

const handleTurn = (nextTurnPlayerID: string, player: Player) => {
  handleDistribution(wrapResp(messageTypes.TURN, nextTurnPlayerID), [player]);
};

const handleAttack = (message: IncomingRequest) => {
  const data: Attack = parseData(message.data);
  if (!roomController.checkTurn(data.indexPlayer)) {
    return;
  }
  const attackResult: 'miss' | 'killed' | 'shot' | 'finish' =
    roomController.checkAttack(message.data);
  const room = roomController.findRoomByPlayerID(data.indexPlayer);
  const players: Player[] = room.roomUsers as Player[];

  if (attackResult === 'finish') {
    handleFinish(data.indexPlayer, players);
  } else {
    players.forEach((player) => {
      handleDistribution(
        wrapResp(messageTypes.ATTACK, getAttackMessage(data, attackResult)),
        [player],
      );
      if (attackResult === 'miss') {
        handleTurn(room.nextTurnPlayerID, player);
      } else {
        handleTurn(data.indexPlayer, player);
      }
    });
    if (attackResult === 'miss') {
      roomController.setNextTurnPlayerId(room.nextTurnPlayerID);
    }
  }
};

const handleFinish = (winnerID: string, players: Player[]) => {
  const winner = stateController.shareWinner(winnerID);
  const winners = stateController.shareWinners();
  players.forEach((player) => {
    handleDistribution(
      wrapResp(messageTypes.FINISH, getFinishMessage(winner.id)),
      [player],
    );
    handleDistribution(
      wrapResp(messageTypes.UPDATE_WINNERS, getWinnersMessage(winners)),
      [player],
    );
  });
};

const handleDistribution = (message: string, players: Player[]): void => {
  for (const [socket, player] of connectionController.entries()) {
    if (players.includes(player) && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }
};

const wrapResp = (type: string, data: unknown): string => {
  return JSON.stringify({
    type: type,
    data: JSON.stringify(data),
    id: 0,
  });
};
