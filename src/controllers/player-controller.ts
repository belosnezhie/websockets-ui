import { randomUUID } from 'crypto';
import { Player, PlayerData } from '../model';
import { parseData } from '../utils/parseData';

export class PlayerController {
  public players: Player[] = [];

  constructor() {}

  public createPlayer(data: string): Player {
    const playerData = parseData(data);
    if (!this.isPlayerData(playerData)) {
      throw new Error('Invalid player data');
    }
    const player: Player = {
      name: playerData.name,
      index: randomUUID(),
      error: false,
      errorText: '',
    };

    this.players.push(player);
    return player;
  }

  private isPlayerData(obj: unknown): obj is PlayerData {
    if (typeof obj !== 'object' || obj === null) return false;

    const data = obj as Record<string, unknown>;

    return typeof data.name === 'string' && typeof data.password === 'string';
  }
}

export const playerController = new PlayerController();
