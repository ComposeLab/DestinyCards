'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '../../lib/socket-client';
import { useGameStore } from '../../stores/game-store';
import { RoundSummary } from './round-summary';
import type { RoundHistory } from '../../lib/types';

export function HistoryPanel() {
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [open, setOpen] = useState(false);
  const roomId = useGameStore((s) => s.roomId);

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();

    const handleRoundEnd = () => {
      // Request history update after round ends
      socket.emit('game:history', { roomId }, (rounds: RoundHistory[]) => {
        if (rounds) setHistory(rounds);
      });
    };

    socket.on('game:round-end', handleRoundEnd);
    // Initial fetch
    socket.emit('game:history', { roomId }, (rounds: RoundHistory[]) => {
      if (rounds) setHistory(rounds);
    });

    return () => {
      socket.off('game:round-end', handleRoundEnd);
    };
  }, [roomId]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-white transition-colors px-2 py-1 rounded text-sm"
      >
        History ({history.length})
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 w-[calc(100vw-1rem)] sm:w-80 max-h-72 sm:max-h-96 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl p-2 sm:p-3 shadow-2xl z-50">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Game History</h3>
            {history.length === 0 ? (
              <p className="text-gray-600 text-sm">No rounds played yet</p>
            ) : (
              <div className="space-y-2">
                {[...history].reverse().map((round) => (
                  <RoundSummary key={round.roundNumber} round={round} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
