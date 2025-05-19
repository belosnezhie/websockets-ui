import { Winner } from '../model';

export class StateController {
  public winners: Winner[] = [];

  public shareWinners(): Winner[] {
    return this.winners;
  }

  public updateWinners(name: string, id: string) {
    const winner = this.findWinnerByID(id);

    if (!winner) {
      this.winners.push({
        name: name,
        id: id,
        wins: 1,
      });
    } else {
      const wins = (winner.wins += 1);
      winner.wins = wins;
    }
  }

  public shareWinner(id: string): Winner {
    const winner = this.findWinnerByID(id);
    if (!winner) {
      throw new Error('Winner does not exist');
    }
    return winner;
  }

  private findWinnerByID(id: string): Winner | undefined {
    return this.winners.find((winner) => winner.id === id);
  }
}

export const stateController = new StateController();
