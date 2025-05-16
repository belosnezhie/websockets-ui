import { randomUUID } from 'crypto';
import { Player, Room, RoomData, Game } from '../model';
import { parseData } from '../utils/parseData';

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

  // public deleteAvailableRoom() {};

  private findRoom(roomID: string): Room {
    const room = this.rooms.find((room: Room) => room.roomId === roomID);
    if (!room) {
      throw new Error('Room does not exist');
    }
    return room;
  }
}

export const roomController = new RoomController();
