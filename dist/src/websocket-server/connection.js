"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
const connection_controller_1 = require("../controllers/connection-controller");
const player_controller_1 = require("../controllers/player-controller");
const model_1 = require("../model");
const parseData_1 = require("../utils/parseData");
const room_controller_1 = require("../controllers/room-controller");
function handleConnection(ws) {
    console.log('New player connected');
    ws.on('open', function open() {
        ws.send('Socket opened');
    });
    ws.on('message', (message) => {
        const incomingMessage = (0, parseData_1.parseData)(message.toString());
        console.log('Received:', (0, parseData_1.parseData)(incomingMessage.data));
        switch (incomingMessage.type) {
            case model_1.RequestTypes.REG:
                const userController = new player_controller_1.PlayerController();
                const newPlayer = userController.createPlayer(incomingMessage.data);
                connection_controller_1.connectionController.set(ws, newPlayer);
                ws.send(wrapResp(incomingMessage.type, JSON.stringify(newPlayer)));
                break;
            case model_1.RequestTypes.CREATE_ROOM:
                const roomController = new room_controller_1.RoomController();
                const player = connection_controller_1.connectionController.get(ws);
                if (!player) {
                    throw new Error('Player does not exist');
                }
                roomController.createRoom(player);
        }
    });
    ws.on('close', () => {
        console.log('Player disconnected');
    });
    ws.send(JSON.stringify({ type: 'WELCOME', message: 'Welcome to Battleship!' }));
    ws.on('error', console.error);
}
const wrapResp = (type, data) => {
    return JSON.stringify({
        type: type,
        data: data,
        id: 0,
    });
};
//# sourceMappingURL=connection.js.map