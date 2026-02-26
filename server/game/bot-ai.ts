import type { GameState, Player, HandRank } from '../state/types';
import { evaluateHand } from './hand-evaluator';
import { HAND_RANK_ORDER } from '../state/types';

export type BotActionType = 'see' | 'bet' | 'raise' | 'fold' | 'show-request' | 'show-respond';

export interface BotDecision {
  action: BotActionType;
  targetId?: string; // for show-request
  accepted?: boolean; // for show-respond
}

type HandTier = 'premium' | 'strong' | 'medium' | 'weak';

function getHandTier(rank: HandRank): HandTier {
  const order = HAND_RANK_ORDER[rank];
  if (order >= 6) return 'premium'; // trail, two-three-five
  if (order >= 4) return 'strong'; // pure-sequence, sequence
  if (order >= 2) return 'medium'; // color, pair
  return 'weak'; // high-card
}

function roll(probability: number): boolean {
  return Math.random() < probability;
}

export function decideBotTurn(state: GameState, bot: Player): BotDecision {
  // Show-pending phase: bot is the show target
  if (state.phase === 'show-pending' && state.showRequest?.toPlayerId === bot.id) {
    return decideBotShowResponse(bot);
  }

  // If blind, decide whether to see cards first (~40% of the time)
  if (bot.status === 'blind') {
    if (roll(0.4)) {
      return { action: 'see' };
    }
    // Stay blind — bet or fold
    if (roll(0.85)) {
      return { action: 'bet' };
    }
    return { action: 'fold' };
  }

  // Bot has seen cards — make decision based on hand strength
  const hand = evaluateHand(bot.cards!);
  const tier = getHandTier(hand.rank);

  // Check if we can request a show (need another 'seen' player)
  const activePlayers = state.players.filter(
    (p) => p.id !== bot.id && p.status !== 'folded' && p.status !== 'eliminated',
  );
  const seenOpponents = activePlayers.filter((p) => p.status === 'seen');
  const canShow = bot.status === 'seen' && seenOpponents.length > 0 && activePlayers.length === 2;

  switch (tier) {
    case 'premium':
      // Never fold. Raise often, sometimes show to end the game.
      if (canShow && roll(0.5)) {
        return { action: 'show-request', targetId: seenOpponents[0].id };
      }
      if (roll(0.4)) {
        return { action: 'raise' };
      }
      return { action: 'bet' };

    case 'strong':
      if (canShow && roll(0.35)) {
        return { action: 'show-request', targetId: seenOpponents[0].id };
      }
      if (roll(0.2)) {
        return { action: 'raise' };
      }
      return { action: 'bet' };

    case 'medium':
      if (canShow && roll(0.2)) {
        return { action: 'show-request', targetId: seenOpponents[0].id };
      }
      if (roll(0.1)) {
        return { action: 'fold' };
      }
      return { action: 'bet' };

    case 'weak':
      if (roll(0.35)) {
        return { action: 'fold' };
      }
      if (canShow && roll(0.15)) {
        return { action: 'show-request', targetId: seenOpponents[0].id };
      }
      return { action: 'bet' };
  }
}

function decideBotShowResponse(bot: Player): BotDecision {
  if (!bot.cards) {
    return { action: 'show-respond', accepted: roll(0.5) };
  }

  const hand = evaluateHand(bot.cards);
  const tier = getHandTier(hand.rank);

  // Accept more often with good hands
  switch (tier) {
    case 'premium':
      return { action: 'show-respond', accepted: true };
    case 'strong':
      return { action: 'show-respond', accepted: roll(0.75) };
    case 'medium':
      return { action: 'show-respond', accepted: roll(0.45) };
    case 'weak':
      return { action: 'show-respond', accepted: roll(0.25) };
  }
}
