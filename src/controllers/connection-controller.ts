import { WebSocket } from 'ws';
import { Player } from '../model';

export const connectionController = new Map<WebSocket, Player>();
