'use client';
import { useGameState } from '../../hooks/use-game-state';
import { useGameStore } from '../../stores/game-store';
import { getSocket } from '../../lib/socket-client';
import { Button } from '../ui/button';
import { playSound, haptic } from '../../lib/sounds';

export function ActionPanel() {
  const { gameState, myPlayer, isMyTurn, isShowTarget } = useGameState();
  const roomId = useGameStore((s) => s.roomId);

  if (!gameState || !myPlayer || !roomId) return null;

  const socket = getSocket();
  const playerId = myPlayer.id;

  const emit = (event: string, data?: any) => {
    socket.emit(event, { roomId, playerId, ...data });
  };

  // Start game button is now on the table surface

  const isShowPending = isShowTarget && gameState.phase === 'show-pending';
  const isRoundEndHost = gameState.phase === 'round-end' && myPlayer.isHost;
  const isPlaying = gameState.phase === 'playing';

  const isBlind = myPlayer.status === 'blind';
  const betAmount = isBlind ? gameState.currentStake : gameState.currentStake * 2;
  const raiseAmount = isBlind ? gameState.currentStake * 2 : gameState.currentStake * 4;
  const seenOpponents = gameState.players.filter(
    (p) => p.id !== playerId && p.status === 'seen'
  );
  const canShow = myPlayer.status === 'seen' && seenOpponents.length > 0;
  const challenger = gameState.players.find(
    (p) => p.id === gameState.showRequest?.fromPlayerId
  );

  // Show challenge response
  if (isShowPending) {
    return (
      <div className="bg-gray-800/90 border border-amber-600 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur" data-testid="action-panel">
        <p className="text-amber-400 font-semibold text-base mb-2">
          {challenger?.name} challenges you to show!
        </p>
        <div className="flex gap-2">
          <Button size="md" onClick={() => { haptic(); emit('game:show-respond', { accepted: true }); }}>
            Accept
          </Button>
          <Button variant="secondary" size="md" onClick={() => { haptic(); emit('game:show-respond', { accepted: false }); }}>
            Reject
          </Button>
        </div>
      </div>
    );
  }

  // Next round
  if (isRoundEndHost) {
    return (
      <div className="bg-gray-800/90 border border-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur" data-testid="action-panel">
        <Button onClick={() => { haptic(); emit('game:next-round'); }} className="w-full" size="md">
          Next Round
        </Button>
      </div>
    );
  }

  // During playing phase: always show buttons, disable when not my turn
  if (isPlaying) {
    const disabled = !isMyTurn;

    return (
      <div
        className={`bg-gray-800/90 border rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur transition-colors min-h-[44px] sm:min-h-[58px] flex items-center ${
          isMyTurn ? 'border-amber-600' : 'border-gray-700'
        }`}
        data-testid="action-panel"
      >
        <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
          {isMyTurn ? (
            <span className="text-xs sm:text-sm text-amber-400 font-semibold mr-1">Your turn</span>
          ) : (
            <span className="text-xs sm:text-sm text-gray-500 font-medium mr-1">Waiting...</span>
          )}

          {isBlind && (
            <Button variant="secondary" size="md" disabled={disabled} onClick={() => { haptic(); emit('game:see'); }}>
              See Cards
            </Button>
          )}

          <Button
            size="md"
            onClick={() => { playSound('chip-bet'); haptic(); emit('game:bet'); }}
            disabled={disabled || myPlayer.chips < betAmount}
            data-testid="bet-button"
          >
            Bet ({betAmount})
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => { playSound('chip-bet'); haptic(); emit('game:raise'); }}
            disabled={disabled || myPlayer.chips < raiseAmount}
            data-testid="raise-button"
          >
            Raise ({raiseAmount})
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={() => { playSound('fold'); haptic(); emit('game:fold'); }}
            disabled={disabled}
            data-testid="fold-button"
          >
            Fold
          </Button>

          {canShow && seenOpponents.map((opp) => (
            <Button
              key={opp.id}
              variant="secondary"
              size="md"
              onClick={() => { haptic(); emit('game:show-request', { targetId: opp.id }); }}
              disabled={disabled || myPlayer.chips < gameState.currentStake}
            >
              Show {opp.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Waiting / round-end (non-host) — show a static panel matching action panel height
  return (
    <div className="bg-gray-800/90 border border-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur flex items-center min-h-[44px] sm:min-h-[58px]" data-testid="action-panel">
      <span className="text-xs sm:text-sm text-gray-500 font-medium">
        {gameState.phase === 'waiting' ? 'Waiting for host to start...' :
         gameState.phase === 'round-end' ? 'Round ended — waiting for next round...' :
         'Waiting...'}
      </span>
    </div>
  );
}
