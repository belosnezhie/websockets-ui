import { randomUUID } from 'crypto';
import { Player, Room, RoomData } from '../model';
import { parseData } from '../utils/parseData';

export class RoomController {
  public rooms: Room[] = [];

  public createRoom(player: Player) {
    const room: Room = {
      roomId: randomUUID(),
      roomUsers: [player],
    };

    this.rooms.push(room);
  }

  public shareRooms(): Room[] {
    return this.rooms;
  }

  public addPlayer(data: string, player: Player) {
    const roomData: RoomData = parseData(data);
    const roomID = roomData.indexRoom;
    const room = this.findRoom(roomID);
    room.roomUsers.push(player);

    return this.rooms;
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
