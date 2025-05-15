import { WebSocket } from 'ws';

import { connectionController } from '../controllers/connection-controller';
import { playerController } from '../controllers/player-controller';
import { IncomingRequest, messageTypes } from '../model';
import { parseData } from '../utils/parseData';
import { roomController } from '../controllers/room-controller';
import { stateController } from '../controllers/state-controller';

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
  ws.send(wrapResp(messageTypes.UPDATE_ROOM, rooms));
  const winners = stateController.shareWinners();
  ws.send(wrapResp(messageTypes.UPDATE_WINNERS, winners));
};

const handleRoomCreation = (ws: WebSocket) => {
  const currentPlayer = connectionController.get(ws);
  if (!currentPlayer) {
    throw new Error('Player does not exist');
  }
  roomController.createRoom(currentPlayer);
  const newRoom = roomController.shareRooms();
  ws.send(wrapResp(messageTypes.UPDATE_ROOM, newRoom));
};

const handleAddingUser = (ws: WebSocket, message: IncomingRequest) => {
  const currentPlayer = connectionController.get(ws);
  if (!currentPlayer) {
    throw new Error('Player does not exist');
  }
  const room = roomController.addPlayer(message.data, currentPlayer);

  const roomMessage = wrapResp(messageTypes.CREATE_ROOM, room);
  handleDistribution(roomMessage);
};

const handleDistribution = (message: string) => {
  const sockets = connectionController.keys();
  sockets.forEach((socket) => {
    socket.send(message);
  });
};

const wrapResp = (type: string, data: unknown): string => {
  return JSON.stringify({
    type: type,
    data: JSON.stringify(data),
    id: 0,
  });
};
