"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
const connection_controller_1 = require("../controllers/connection-controller");
const player_controller_1 = require("../controllers/player-controller");
const model_1 = require("../model");
const parseData_1 = require("../utils/parseData");
const room_controller_1 = require("../controllers/room-controller");
const state_controller_1 = require("../controllers/state-controller");
function handleConnection(ws) {
    console.log('New player connected');
    ws.on('open', function open() {
        ws.send('Socket opened');
    });
    ws.on('message', (message) => {
        console.log('Received:', (0, parseData_1.parseData)(message.toString()));
        const incomingMessage = (0, parseData_1.parseData)(message.toString());
        switch (incomingMessage.type) {
            case model_1.messageTypes.REG:
                handleRegistration(ws, incomingMessage);
                break;
            case model_1.messageTypes.CREATE_ROOM:
                handleRoomCreation(ws);
                break;
            case model_1.messageTypes.ADD_USER_TO_ROOM:
                handleAddingUser(ws, incomingMessage);
                break;
        }
    });
    ws.on('close', () => {
        console.log('Player disconnected');
    });
    ws.on('error', console.error);
}
const handleRegistration = (ws, message) => {
    const player = player_controller_1.playerController.createPlayer(message.data);
    connection_controller_1.connectionController.set(ws, player);
    ws.send(wrapResp(message.type, player));
    const rooms = room_controller_1.roomController.shareRooms();
    ws.send(wrapResp(model_1.messageTypes.UPDATE_ROOM, rooms));
    const winners = state_controller_1.stateController.shareWinners();
    ws.send(wrapResp(model_1.messageTypes.UPDATE_WINNERS, winners));
};
const handleRoomCreation = (ws) => {
    const currentPlayer = connection_controller_1.connectionController.get(ws);
    if (!currentPlayer) {
        throw new Error('Player does not exist');
    }
    room_controller_1.roomController.createRoom(currentPlayer);
    const newRoom = room_controller_1.roomController.shareRooms();
    ws.send(wrapResp(model_1.messageTypes.UPDATE_ROOM, newRoom));
};
const handleAddingUser = (ws, message) => {
    const currentPlayer = connection_controller_1.connectionController.get(ws);
    if (!currentPlayer) {
        throw new Error('Player does not exist');
    }
    const room = room_controller_1.roomController.addPlayer(message.data, currentPlayer);
    const roomMessage = wrapResp(model_1.messageTypes.CREATE_ROOM, room);
    handleDistribution(roomMessage);
};
const handleDistribution = (message) => {
    const sockets = connection_controller_1.connectionController.keys();
    sockets.forEach((socket) => {
        socket.send(message);
    });
};
const wrapResp = (type, data) => {
    return JSON.stringify({
        type: type,
        data: JSON.stringify(data),
        id: 0,
    });
};
//# sourceMappingURL=connection.js.map