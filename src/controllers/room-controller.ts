import { randomUUID } from 'crypto';
import { Player, Room } from '../model';

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

  public addPlayer(roomID: string, player: Player) {
    const room = this.findRoom(roomID);
    room.roomUsers.push(player);

    return this.rooms;
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
