"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = exports.RoomController = void 0;
const crypto_1 = require("crypto");
const model_1 = require("../model");
const parseData_1 = require("../utils/parseData");
class RoomController {
    constructor() {
        this.rooms = [];
        this.game = {
            idGame: '',
            idPlayer: '',
        };
        this.canGameStart = (playerID) => {
            const room = this.findRoomByPlayerID(playerID);
            const ships = room.shipsByUserID.values();
            if (ships.next().value?.length === 10 &&
                ships.next().value?.length === 10) {
                return true;
            }
            return false;
        };
    }
    createRoom(player) {
        const room = {
            roomId: (0, crypto_1.randomUUID)(),
            roomUsers: [player],
            roomStatus: 'available',
            shipsByUserID: new Map(),
            fieldsByUserID: new Map(),
            shipsCoordinatesByUserID: new Map(),
            nextTurnPlayerID: player.index,
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
        const playerID = gameData.indexPlayer;
        const room = this.findRoomByPlayerID(playerID);
        const ships = gameData.ships;
        const currentPlayerShips = room.shipsByUserID;
        currentPlayerShips.set(playerID, ships);
        room.shipsByUserID = currentPlayerShips;
        this.addShipsToModal(ships, playerID);
    }
    startGame(playerID) {
        const room = this.findRoomByPlayerID(playerID);
        if (room.roomUsers.length === 2) {
            room.nextTurnPlayerID = String(room.roomUsers[0]?.index);
        }
        const ships = room.shipsByUserID.get(playerID);
        return {
            ships: ships,
            currentPlayerIndex: playerID,
        };
    }
    getTurnPlayerId(prevTurnPlayerID) {
        const room = this.findRoomByPlayerID(prevTurnPlayerID);
        return String(room.nextTurnPlayerID);
    }
    setNextTurnPlayerId(currentPlayerID) {
        const room = this.findRoomByPlayerID(currentPlayerID);
        const nextPlayer = room.roomUsers.find((player) => player?.index !== currentPlayerID);
        room.nextTurnPlayerID = String(nextPlayer?.index);
    }
    findRoomByPlayerID(playerID) {
        const room = this.rooms.find((room) => {
            const players = room.roomUsers;
            const index = players.findIndex((player) => playerID === player?.index);
            if (index >= 0) {
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
    checkTurn(playerID) {
        const room = this.findRoomByPlayerID(playerID);
        return room.nextTurnPlayerID !== playerID;
    }
    checkAttack(data) {
        const attackData = (0, parseData_1.parseData)(data);
        const room = this.findRoomByPlayerID(attackData.indexPlayer);
        const enemy = room.roomUsers.find((player) => player?.index != attackData.indexPlayer);
        const field = room.fieldsByUserID.get(String(enemy?.index));
        const cellState = field[attackData.y][attackData.x];
        if (cellState === '') {
            field[attackData.y][attackData.x] = 'miss';
            return 'miss';
        }
        if (cellState === 'miss') {
            return 'miss';
        }
        if (cellState === 'shot') {
            return 'miss';
        }
        if (cellState === 'ship') {
            const position = {
                x: attackData.x,
                y: attackData.y,
            };
            const enemyShipCoordinates = room.shipsCoordinatesByUserID.get(enemy?.index);
            for (const shipKey of enemyShipCoordinates?.keys()) {
                const shipPositions = enemyShipCoordinates?.get(shipKey);
                for (let i = 0; i < shipPositions.length; i += 1) {
                    if (shipPositions[i].x === position.x &&
                        shipPositions[i].y === position.y) {
                        shipPositions.slice(i, 1);
                        if (shipPositions.length <= 0) {
                            field[position.y][position.x] = 'killed';
                            return 'killed';
                        }
                        field[position.y][position.x] = 'shot';
                        return 'shot';
                    }
                }
            }
        }
        return 'miss';
    }
    findRoom(roomID) {
        const room = this.rooms.find((room) => room.roomId === roomID);
        if (!room) {
            throw new Error('Room does not exist');
        }
        return room;
    }
    addShipsToModal(ships, playerdID) {
        const field = (0, model_1.createField)();
        const shipsCoordinates = new Map();
        ships.forEach((ship) => {
            const shipCoordinates = [];
            for (let i = 0; i < ship.length; i += 1) {
                if (ship.direction) {
                    field[ship.position.y + i][ship.position.x] = 'ship';
                    shipCoordinates.push({
                        x: ship.position.x,
                        y: ship.position.y + i,
                    });
                }
                else {
                    field[ship.position.y][ship.position.x + i] = 'ship';
                    shipCoordinates.push({
                        x: ship.position.x + i,
                        y: ship.position.y,
                    });
                }
            }
            shipsCoordinates.set(`${ship.type}_${ship.position.x}_${ship.position.y}`, shipCoordinates);
        });
        const room = this.findRoomByPlayerID(playerdID);
        room.fieldsByUserID.set(playerdID, field);
        room.shipsCoordinatesByUserID.set(playerdID, shipsCoordinates);
    }
}
exports.RoomController = RoomController;
exports.roomController = new RoomController();
//# sourceMappingURL=room-controller.js.map