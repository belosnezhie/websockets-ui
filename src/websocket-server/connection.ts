import { PlayerController } from '../controllers/player-controller';
import { IncomingRequest, RequestTypes } from '../model';
import { parseData } from '../utils/parseData';
import { WebSocket } from 'ws';

export function handleConnection(ws: WebSocket) {
  console.log('New player connected');

  ws.on('open', function open() {
    ws.send('Socket opened');
  });

  ws.on('message', (message: IncomingRequest) => {
    console.log('Received:', parseData(message.data));

    switch (message.type) {
      case RequestTypes.REG:
        const userController = new PlayerController();
        const player = userController.createPlayer(message.data);
        ws.send(wrapResp(message.type, player));
    }
  });

  ws.on('close', () => {
    console.log('Player disconnected');
  });

  ws.send(
    JSON.stringify({ type: 'WELCOME', message: 'Welcome to Battleship!' }),
  );

  ws.on('error', console.error);
}

const wrapResp = (type: string, data: string): string => {
  return JSON.stringify({
    type: type,
    data: data,
    id: 0,
  });
};
