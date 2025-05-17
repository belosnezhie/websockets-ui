import { randomUUID } from 'crypto';
import { Player, Room, RoomData, Game, GameData } from '../model';
import { parseData } from '../utils/parseData';

export class RoomController {
  public rooms: Room[] = []; // айди обоих
  public game: Game = {
    idGame: '',
    idPlayer: '', // айди игрока
  };

  public createRoom(player: Player) {
    const room: Room = {
      roomId: randomUUID(),
      roomUsers: [player],
      roomStatus: 'available',
      shipsByUserID: new Map(),
      nextTurnPlayerID: player.index,
    };

    this.rooms.push(room);
  }

  public shareRooms(): Room[] {
    return this.rooms.filter((room) => {
      return room.roomStatus === 'available';
    });
  }

  public addPlayer(data: string, player: Player): Room[] {
    const roomData: RoomData = parseData(data);
    const roomID = roomData.indexRoom;
    const room = this.findRoom(roomID);
    room.roomUsers.push(player);

    return [room];
  }

  public makeRoomUnavailible(roomID: string): Room[] {
    const room = this.findRoom(roomID);
    room.roomStatus = 'occupied';

    return this.shareRooms();
  }

  public createGame(currentPlayer: Player) {
    this.game.idGame = randomUUID();
    this.game.idPlayer = currentPlayer.index;

    return this.game;
  }

  public setShips(data: string) {
    const gameData: GameData = parseData(data);
    const playerID = gameData.indexPlayer;
    const room = this.findRoomByPlayerID(playerID);
    const ships = gameData.ships;
    const currentPlayerShips = room.shipsByUserID;
    currentPlayerShips.set(playerID, ships);
    room.shipsByUserID = currentPlayerShips;
  }

  public canGameStart = (playerID: string): boolean => {
    const room = this.findRoomByPlayerID(playerID);
    const ships = room.shipsByUserID.values();
    if (
      ships.next().value?.length === 10 &&
      ships.next().value?.length === 10
    ) {
      return true;
    }
    return false;
  };

  public startGame(playerID: string) {
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

  public getTurnPlayerId(prevTurnPlayerID: string): string {
    const room = this.findRoomByPlayerID(prevTurnPlayerID);
    return String(room.nextTurnPlayerID);
  }

  public setNextTurnPlayerId(currentPlayerID: string): void {
    const room = this.findRoomByPlayerID(currentPlayerID);
    const nextPlayer = room.roomUsers.find(
      (player) => player?.index !== currentPlayerID,
    );
    room.nextTurnPlayerID = String(nextPlayer?.index);
  }

  public findRoomByPlayerID(playerID: string): Room {
    const room = this.rooms.find((room: Room) => {
      const players = room.roomUsers;
      const index = players.findIndex((player) => playerID === player?.index);
      if (index >= 0) {
        return true;
      } else {
        return false;
      }
    });
    if (!room) {
      throw new Error('Room does not exist');
    }
    return room;
  }

  private findRoom(roomID: string): Room {
    const room = this.rooms.find((room: Room) => room.roomId === roomID);
    if (!room) {
      throw new Error('Room does not exist');
    }
    return room;
  }
}

export const roomController = new RoomController();
