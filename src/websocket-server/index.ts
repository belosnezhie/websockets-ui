import { WebSocketServer } from 'ws';
import 'dotenv/config';

import { handleConnection } from './connection';

const PORT = process.env.WSS_PORT || 3000;

export const startWebsocket = () => {
  const socket = new WebSocketServer({ port: Number(PORT) });

  socket.on('connection', (ws) => {
    handleConnection(ws);
    console.log(`WebSocket server started on port: ${PORT}`);
  });
};
