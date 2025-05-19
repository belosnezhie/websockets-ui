"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebsocket = void 0;
const ws_1 = require("ws");
require("dotenv/config");
const connection_1 = require("./connection");
const PORT = process.env.WSS_PORT || 3000;
const startWebsocket = () => {
    const socket = new ws_1.WebSocketServer({ port: Number(PORT) });
    socket.on('connection', (ws) => {
        (0, connection_1.handleConnection)(ws);
        console.log(`WebSocket server started on port: ${PORT}`);
    });
};
exports.startWebsocket = startWebsocket;
//# sourceMappingURL=index.js.map