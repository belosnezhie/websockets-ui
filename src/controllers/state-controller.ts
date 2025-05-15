import { Winner } from '../model';

export class StateController {
  public winners: Winner[] = [];

  public shareWinners(): Winner[] {
    return this.winners;
  }
}

export const stateController = new StateController();
