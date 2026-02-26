import { createDeck, shuffleDeck, dealCards } from './deck';
import { evaluateHand, compareHands } from './hand-evaluator';
import type { GameState, Player } from '../state/types';

export class GameEngine {
  startRound(players: Player[], initialStake: number): GameState {
    const deck = shuffleDeck(createDeck());
    const { hands, remainingDeck } = dealCards(deck, players.length);

    const roundPlayers: Player[] = players.map((p, i) => ({
      ...p,
      status: 'blind' as const,
      cards: hands[i],
      totalBet: 0,
    }));

    return {
      phase: 'playing',
      players: roundPlayers,
      pot: 0,
      currentStake: initialStake,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      deck: remainingDeck,
      showRequest: null,
      roundNumber: 1,
      lastAction: null,
    };
  }

  bet(state: GameState): GameState {
    const newState = this.cloneState(state);
    const player = newState.players[newState.currentPlayerIndex];
    const amount = player.status === 'blind' ? newState.currentStake : newState.currentStake * 2;

    player.chips -= amount;
    player.totalBet += amount;
    newState.pot += amount;

    newState.lastAction = {
      playerId: player.id,
      type: 'bet',
      amount,
      timestamp: Date.now(),
    };

    newState.currentPlayerIndex = this.getNextActiveIndex(newState, newState.currentPlayerIndex);
    return newState;
  }

  raise(state: GameState): GameState {
    const newState = this.cloneState(state);
    newState.currentStake *= 2;

    const player = newState.players[newState.currentPlayerIndex];
    const amount = player.status === 'blind' ? newState.currentStake : newState.currentStake * 2;

    player.chips -= amount;
    player.totalBet += amount;
    newState.pot += amount;

    newState.lastAction = {
      playerId: player.id,
      type: 'raise',
      amount,
      timestamp: Date.now(),
    };

    newState.currentPlayerIndex = this.getNextActiveIndex(newState, newState.currentPlayerIndex);
    return newState;
  }

  fold(state: GameState): GameState {
    const newState = this.cloneState(state);
    const player = newState.players[newState.currentPlayerIndex];
    player.status = 'folded';

    newState.lastAction = {
      playerId: player.id,
      type: 'fold',
      timestamp: Date.now(),
    };

    const activePlayers = this.getActivePlayers(newState);
    if (activePlayers.length <= 1) {
      return this.endRound(newState);
    }

    newState.currentPlayerIndex = this.getNextActiveIndex(newState, newState.currentPlayerIndex);
    return newState;
  }

  seeCards(state: GameState, playerId: string): GameState {
    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.id === playerId);
    if (player) {
      player.status = 'seen';
    }

    newState.lastAction = {
      playerId,
      type: 'see',
      timestamp: Date.now(),
    };

    // Does NOT advance turn
    return newState;
  }

  requestShow(state: GameState, fromId: string, toId: string): GameState {
    const newState = this.cloneState(state);

    const requester = newState.players.find((p) => p.id === fromId);
    if (requester) {
      requester.chips -= newState.currentStake;
      requester.totalBet += newState.currentStake;
      newState.pot += newState.currentStake;
    }

    newState.showRequest = {
      fromPlayerId: fromId,
      toPlayerId: toId,
    };
    newState.phase = 'show-pending';

    newState.lastAction = {
      playerId: fromId,
      type: 'show-request',
      amount: newState.currentStake,
      timestamp: Date.now(),
    };

    return newState;
  }

  respondShow(state: GameState, accepted: boolean): GameState {
    const newState = this.cloneState(state);
    const request = newState.showRequest;

    if (!request) return newState;

    if (!accepted) {
      newState.showRequest = null;
      newState.phase = 'playing';
      newState.lastAction = {
        playerId: request.toPlayerId,
        type: 'show-reject',
        timestamp: Date.now(),
      };
      newState.currentPlayerIndex = this.getNextActiveIndex(newState, newState.currentPlayerIndex);
      return newState;
    }

    // Accepted: compare hands
    const fromPlayer = newState.players.find((p) => p.id === request.fromPlayerId)!;
    const toPlayer = newState.players.find((p) => p.id === request.toPlayerId)!;

    const fromHand = evaluateHand(fromPlayer.cards!);
    const toHand = evaluateHand(toPlayer.cards!);
    const comparison = compareHands(fromHand, toHand);

    // Loser gets folded. If tie, requester loses.
    if (comparison > 0) {
      toPlayer.status = 'folded';
    } else {
      fromPlayer.status = 'folded';
    }

    newState.showRequest = null;
    newState.phase = 'playing';

    newState.lastAction = {
      playerId: request.toPlayerId,
      type: 'show-accept',
      timestamp: Date.now(),
    };

    const activePlayers = this.getActivePlayers(newState);
    if (activePlayers.length <= 1) {
      return this.endRound(newState);
    }

    return newState;
  }

  private getNextActiveIndex(state: GameState, fromIndex: number): number {
    const count = state.players.length;
    let idx = (fromIndex + 1) % count;
    while (idx !== fromIndex) {
      if (state.players[idx].status !== 'folded') {
        return idx;
      }
      idx = (idx + 1) % count;
    }
    return fromIndex; // fallback: only one active player
  }

  private getActivePlayers(state: GameState): Player[] {
    return state.players.filter((p) => p.status !== 'folded');
  }

  private endRound(state: GameState): GameState {
    state.phase = 'round-end';
    const winner = this.getActivePlayers(state)[0];
    if (winner) {
      winner.chips += state.pot;
    }
    return state;
  }

  private cloneState(state: GameState): GameState {
    return {
      ...state,
      players: state.players.map((p) => ({ ...p, cards: p.cards ? [...p.cards] as [any, any, any] : null })),
      showRequest: state.showRequest ? { ...state.showRequest } : null,
      deck: [...state.deck],
      lastAction: state.lastAction ? { ...state.lastAction } : null,
    };
  }
}
