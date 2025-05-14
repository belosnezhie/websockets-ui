"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
const player_controller_1 = require("../controllers/player-controller");
const model_1 = require("../model");
const parseData_1 = require("../utils/parseData");
function handleConnection(ws) {
    console.log('New player connected');
    ws.on('open', function open() {
        ws.send('Socket opened');
    });
    ws.on('message', (message) => {
        console.log('Received:', (0, parseData_1.parseData)(message.data));
        switch (message.type) {
            case model_1.RequestTypes.REG:
                const userController = new player_controller_1.PlayerController();
                const player = userController.createPlayer(message.data);
                ws.send(wrapResp(message.type, player));
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