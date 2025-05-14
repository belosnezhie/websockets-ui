import { httpServer } from './src/http-server/index';
import './src/websocket-server';
import { startWebsocket } from './src/websocket-server';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
startWebsocket();
