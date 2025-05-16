import { randomUUID } from 'crypto';
import { Game, Player } from '../model';

export class GameController {
  public game: Game = {
    idGame: '',
    idPlayer: '',
  };
  private players: Player[] = [];

  public createGame(currentPlayer: Player) {
    this.game.idGame = randomUUID();
    this.game.idPlayer = currentPlayer.index;

    this.players.push(currentPlayer);

    return this.game;
  }
}

export const gameController = new GameController();
