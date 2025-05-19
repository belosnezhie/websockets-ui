"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
const ws_1 = require("ws");
const connection_controller_1 = require("../controllers/connection-controller");
const player_controller_1 = require("../controllers/player-controller");
const model_1 = require("../model");
const parseData_1 = require("../utils/parseData");
const room_controller_1 = require("../controllers/room-controller");
const state_controller_1 = require("../controllers/state-controller");
const views_1 = require("../views");
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
            case model_1.messageTypes.ADD_SHIPS:
                handleShipsCreation(incomingMessage);
                break;
            case model_1.messageTypes.ATTACK:
                handleAttack(incomingMessage);
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
    ws.send(wrapResp(model_1.messageTypes.UPDATE_ROOM, (0, views_1.getUpdateRoomMessage)(rooms)));
    const winners = state_controller_1.stateController.shareWinners();
    ws.send(wrapResp(model_1.messageTypes.UPDATE_WINNERS, winners));
};
const handleRoomCreation = (ws) => {
    const currentPlayer = connection_controller_1.connectionController.get(ws);
    if (!currentPlayer) {
        throw new Error('Player does not exist');
    }
    room_controller_1.roomController.createRoom(currentPlayer);
    const newRooms = room_controller_1.roomController.shareRooms();
    ws.send(wrapResp(model_1.messageTypes.UPDATE_ROOM, (0, views_1.getUpdateRoomMessage)(newRooms)));
};
const handleAddingUser = (ws, message) => {
    const currentPlayer = connection_controller_1.connectionController.get(ws);
    if (!currentPlayer) {
        throw new Error('Player does not exist');
    }
    const room = room_controller_1.roomController.addPlayer(message.data, currentPlayer);
    const players = room[0]?.roomUsers;
    handleDistribution(wrapResp(model_1.messageTypes.UPDATE_ROOM, (0, views_1.getUpdateRoomMessage)(room)), players);
    players.forEach((player) => {
        const game = room_controller_1.roomController.createGame(player);
        handleDistribution(wrapResp(model_1.messageTypes.CREATE_GAME, game), [player]);
    });
    const roomID = room[0]?.roomId;
    const rooms = room_controller_1.roomController.makeRoomUnavailible(roomID);
    handleDistribution(wrapResp(model_1.messageTypes.UPDATE_ROOM, (0, views_1.getUpdateRoomMessage)(rooms)), players);
};
const handleShipsCreation = (message) => {
    room_controller_1.roomController.setShips(message.data);
    const data = (0, parseData_1.parseData)(message.data);
    const playerID = data.indexPlayer;
    const room = room_controller_1.roomController.findRoomByPlayerID(data.indexPlayer);
    const players = room.roomUsers;
    if (room_controller_1.roomController.canGameStart(playerID)) {
        players.forEach((player) => {
            const game = room_controller_1.roomController.startGame(playerID);
            const startGameMessage = (0, views_1.getStartGameMessage)(game);
            handleDistribution(wrapResp(model_1.messageTypes.START_GAME, startGameMessage), [
                player,
            ]);
            handleTurn(room.nextTurnPlayerID, player);
        });
        room_controller_1.roomController.setNextTurnPlayerId(room.nextTurnPlayerID);
    }
};
const handleTurn = (nextTurnPlayerID, player) => {
    handleDistribution(wrapResp(model_1.messageTypes.TURN, nextTurnPlayerID), [player]);
};
const handleAttack = (message) => {
    const data = (0, parseData_1.parseData)(message.data);
    if (!room_controller_1.roomController.checkTurn(data.indexPlayer)) {
        return;
    }
    const attackResult = room_controller_1.roomController.checkAttack(message.data);
    const room = room_controller_1.roomController.findRoomByPlayerID(data.indexPlayer);
    const players = room.roomUsers;
    players.forEach((player) => {
        handleDistribution(wrapResp(model_1.messageTypes.ATTACK, (0, views_1.getAttackMessage)(data, attackResult)), [player]);
        if (attackResult === 'miss') {
            handleTurn(room.nextTurnPlayerID, player);
        }
        else {
            handleTurn(data.indexPlayer, player);
        }
    });
    if (attackResult === 'miss') {
        room_controller_1.roomController.setNextTurnPlayerId(room.nextTurnPlayerID);
    }
};
const handleDistribution = (message, players) => {
    for (const [socket, player] of connection_controller_1.connectionController.entries()) {
        if (players.includes(player) && socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(message);
        }
    }
};
const wrapResp = (type, data) => {
    return JSON.stringify({
        type: type,
        data: JSON.stringify(data),
        id: 0,
    });
};
//# sourceMappingURL=connection.js.map