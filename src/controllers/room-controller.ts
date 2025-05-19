import { randomUUID } from 'crypto';
import {
  Player,
  Room,
  RoomData,
  Game,
  GameData,
  Attack,
  Position,
  Ship,
  createField,
} from '../model';
import { parseData } from '../utils/parseData';
import { stateController } from './state-controller';

export class RoomController {
  public rooms: Room[] = [];
  public game: Game = {
    idGame: '',
    idPlayer: '',
  };

  public createRoom(player: Player) {
    const room: Room = {
      roomId: randomUUID(),
      roomUsers: [player],
      roomStatus: 'available',
      shipsByUserID: new Map(),
      fieldsByUserID: new Map(),
      shipsCoordinatesByUserID: new Map(),
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

    this.addShipsToModal(ships, playerID);
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

  public checkTurn(playerID: string): boolean {
    const room = this.findRoomByPlayerID(playerID);
    return room.nextTurnPlayerID !== playerID;
  }

  public checkAttack(data: string): 'miss' | 'killed' | 'shot' | 'finish' {
    const attackData: Attack = parseData(data);

    const room = this.findRoomByPlayerID(attackData.indexPlayer);

    const enemy = room.roomUsers.find(
      (player) => player?.index != attackData.indexPlayer,
    );
    const field = room.fieldsByUserID.get(String(enemy?.index)) as string[][];

    const cellState = field[attackData.y]![attackData.x]!;

    if (cellState === '') {
      field[attackData.y]![attackData.x] = 'miss';
      return 'miss';
    }

    if (cellState === 'miss') {
      return 'miss';
    }

    if (cellState === 'shot') {
      return 'miss';
    }

    if (cellState === 'ship') {
      const position: Position = {
        x: attackData.x,
        y: attackData.y,
      };

      const enemyShipCoordinates = room.shipsCoordinatesByUserID.get(
        enemy?.index as string,
      );

      for (const shipKey of enemyShipCoordinates?.keys() as MapIterator<string>) {
        const shipPositions = enemyShipCoordinates?.get(shipKey) as Position[];

        for (let i = 0; i < shipPositions.length; i += 1) {
          if (
            shipPositions[i]!.x === position.x &&
            shipPositions[i]!.y === position.y
          ) {
            shipPositions.splice(i, 1);
            if (shipPositions.length <= 0) {
              field[position.y]![position.x] = 'killed';
              enemyShipCoordinates?.delete(shipKey);
              if (enemyShipCoordinates?.size === 0) {
                return this.finishGame(room, attackData.indexPlayer);
              }
              return 'killed';
            }
            field[position.y]![position.x] = 'shot';
            return 'shot';
          }
        }
      }
    }

    return 'miss';
  }

  private finishGame(room: Room, winnerID: string): 'finish' {
    const winnerIndex = room.roomUsers.findIndex(
      (player) => player?.index === winnerID,
    );
    const name = room.roomUsers[winnerIndex]?.name;
    stateController.updateWinners(String(name), winnerID);
    return 'finish';
  }

  private findRoom(roomID: string): Room {
    const room = this.rooms.find((room: Room) => room.roomId === roomID);
    if (!room) {
      throw new Error('Room does not exist');
    }
    return room;
  }

  private addShipsToModal(ships: Ship[], playerdID: string) {
    const field = createField();
    const shipsCoordinates: Map<string, Position[]> = new Map();

    ships.forEach((ship: Ship) => {
      const shipCoordinates: Position[] = [];

      for (let i = 0; i < ship.length; i += 1) {
        if (ship.direction) {
          field[ship.position.y + i]![ship.position.x] = 'ship';
          shipCoordinates.push({
            x: ship.position.x,
            y: ship.position.y + i,
          });
        } else {
          field[ship.position.y]![ship.position.x + i] = 'ship';
          shipCoordinates.push({
            x: ship.position.x + i,
            y: ship.position.y,
          });
        }
      }
      shipsCoordinates.set(
        `${ship.type}_${ship.position.x}_${ship.position.y}`,
        shipCoordinates,
      );
    });

    const room = this.findRoomByPlayerID(playerdID);
    room.fieldsByUserID.set(playerdID, field);
    room.shipsCoordinatesByUserID.set(playerdID, shipsCoordinates);
  }
}

export const roomController = new RoomController();
