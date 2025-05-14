"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const crypto_1 = require("crypto");
const parseData_1 = require("../utils/parseData");
class PlayerController {
    constructor() {
        this.players = [];
    }
    createPlayer(data) {
        const playerData = (0, parseData_1.parseData)(data);
        if (!this.isPlayerData(playerData)) {
            throw new Error('Invalid player data');
        }
        const player = {
            name: playerData.name,
            index: (0, crypto_1.randomUUID)(),
            error: false,
            errorText: '',
        };
        this.players.push(player);
        return JSON.stringify(player);
    }
    isPlayerData(obj) {
        if (typeof obj !== 'object' || obj === null)
            return false;
        const data = obj;
        return typeof data.name === 'string' && typeof data.password === 'string';
    }
}
exports.PlayerController = PlayerController;
//# sourceMappingURL=player-controller.js.map