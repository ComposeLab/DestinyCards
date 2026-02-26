'use client';
import type { RoundHistory } from '../../lib/types';
import { formatCard } from '../../lib/card-utils';
import { Badge } from '../ui/badge';

interface RoundSummaryProps {
  round: RoundHistory;
}

export function RoundSummary({ round }: RoundSummaryProps) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">Round {round.roundNumber}</span>
        <span className="text-xs text-gray-500">Pot: {round.pot}</span>
      </div>
      <div className="space-y-1">
        {round.players.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={p.id === round.winnerId ? 'text-amber-400 font-semibold' : 'text-gray-400'}>
                {p.name}
              </span>
              {p.id === round.winnerId && <Badge variant="success">Winner</Badge>}
              {p.cards && (
                <span className="text-xs text-gray-500">
                  {p.cards.map(formatCard).join(' ')}
                </span>
              )}
            </div>
            <span className={p.chipChange >= 0 ? 'text-green-400' : 'text-red-400'}>
              {p.chipChange >= 0 ? '+' : ''}{p.chipChange}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
