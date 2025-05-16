"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = exports.RoomController = void 0;
const crypto_1 = require("crypto");
const parseData_1 = require("../utils/parseData");
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
    shareRooms() {
        return this.rooms;
    }
    addPlayer(data, player) {
        const roomData = (0, parseData_1.parseData)(data);
        const roomID = roomData.roomId;
        const room = this.findRoom(roomID);
        room.roomUsers.push(player);
        return this.rooms;
    }
    findRoom(roomID) {
        const room = this.rooms.find((room) => room.roomId === roomID);
        if (!room) {
            throw new Error('Room does not exist');
        }
        return room;
    }
}
exports.RoomController = RoomController;
exports.roomController = new RoomController();
//# sourceMappingURL=room-controller.js.map