"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./src/http-server/index");
require("./src/websocket-server");
const websocket_server_1 = require("./src/websocket-server");
const HTTP_PORT = 8181;
console.log(`Start static http server on the ${HTTP_PORT} port!`);
index_1.httpServer.listen(HTTP_PORT);
(0, websocket_server_1.startWebsocket)();
//# sourceMappingURL=index.js.map