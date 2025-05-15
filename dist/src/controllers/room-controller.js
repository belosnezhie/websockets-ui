"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const crypto_1 = require("crypto");
class RoomController {
    constructor() {
        this.rooms = [];
    }
    createRoom(player) {
        const room = {
            roomId: (0, crypto_1.randomUUID)(),
            roomUsers: [player],
        };
        this.rooms.push(room);
    }
}
exports.RoomController = RoomController;
//# sourceMappingURL=room-controller.js.map