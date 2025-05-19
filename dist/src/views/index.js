"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttackMessage = exports.getUpdateRoomMessage = exports.getStartGameMessage = void 0;
const getStartGameMessage = (game) => {
    return {
        ships: game.ships,
        currentPlayerIndex: game.currentPlayerIndex,
    };
};
exports.getStartGameMessage = getStartGameMessage;
const getUpdateRoomMessage = (rooms) => {
    const res = [];
    for (const room of rooms) {
        res.push({
            roomId: room.roomId,
            roomUsers: room.roomUsers,
        });
    }
    return res;
};
exports.getUpdateRoomMessage = getUpdateRoomMessage;
const getAttackMessage = (attackData, result) => {
    return {
        position: {
            x: attackData.x,
            y: attackData.y,
        },
        currentPlayer: attackData.indexPlayer,
        status: result,
    };
};
exports.getAttackMessage = getAttackMessage;
//# sourceMappingURL=index.js.map