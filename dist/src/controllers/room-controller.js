"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = exports.RoomController = void 0;
const crypto_1 = require("crypto");
const parseData_1 = require("../utils/parseData");
class RoomController {
    constructor() {
        this.rooms = [];
        this.game = {
            idGame: '',
            idPlayer: '',
        };
        this.canGameStart = () => {
            return this.ships.length > 0 && this.ships.length % 2 === 0;
        };
    }
    createRoom(player) {
        const room = {
            roomId: (0, crypto_1.randomUUID)(),
            roomUsers: [player],
            roomStatus: 'available',
        };
        this.rooms.push(room);
    }
    shareRooms() {
        return this.rooms.filter((room) => {
            return room.roomStatus === 'available';
        });
    }
    addPlayer(data, player) {
        const roomData = (0, parseData_1.parseData)(data);
        const roomID = roomData.indexRoom;
        const room = this.findRoom(roomID);
        room.roomUsers.push(player);
        return [room];
    }
    makeRoomUnavailible(roomID) {
        const room = this.findRoom(roomID);
        room.roomStatus = 'occupied';
        return this.shareRooms();
    }
    createGame(currentPlayer) {
        this.game.idGame = (0, crypto_1.randomUUID)();
        this.game.idPlayer = currentPlayer.index;
        return this.game;
    }
    setShips(data) {
        const gameData = (0, parseData_1.parseData)(data);
        const ships = gameData.ships;
        this.ships = ships;
    }
    startGame() {
        return {
            ships: this.ships,
            currentPlayerIndex: this.game.idPlayer,
        };
    }
    findRoomByPlayerID(playerID) {
        const room = this.rooms.find((room) => {
            const players = room.roomUsers;
            const index = players.findIndex((player) => playerID === player?.index);
            if (index > 0) {
                return true;
            }
            else {
                return false;
            }
        });
        if (!room) {
            throw new Error('Room does not exist');
        }
        return room;
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