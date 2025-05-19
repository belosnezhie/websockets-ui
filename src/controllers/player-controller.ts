import { randomUUID } from 'crypto';
import { Player, PlayerData } from '../model';
import { parseData } from '../utils/parseData';

export class PlayerController {
  public players: Player[] = [];
  private playersData: PlayerData[] = [];

  public createPlayer(data: string): Player {
    const playerData: PlayerData = parseData(data);

    if (this.isPasswordCorrect(playerData)) {
      return this.isPasswordCorrect(playerData) as Player;
    }

    const player: Player = {
      name: playerData.name,
      index: randomUUID(),
      error: false,
      errorText: '',
    };

    this.players.push(player);
    this.playersData.push(playerData);
    return player;
  }

  public isPasswordCorrect(playerData: PlayerData): Player | undefined {
    const player = this.playersData.find(
      (player) => player.name === playerData.name,
    );

    if (player && player.password !== playerData.password) {
      return {
        name: playerData.name,
        index: '',
        error: true,
        errorText: 'Wrong passord',
      };
    }
  }
}

export const playerController = new PlayerController();
