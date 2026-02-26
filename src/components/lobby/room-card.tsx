'use client';
import type { RoomInfo } from '../../lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface RoomCardProps {
  room: RoomInfo;
  onJoin: (roomId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
      <div>
        <h3 className="text-white font-semibold">{room.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-400">{room.playerCount}/{room.maxPlayers} players</span>
          <Badge variant={room.phase === 'waiting' ? 'success' : 'warning'}>
            {room.phase === 'waiting' ? 'Open' : 'In Game'}
          </Badge>
        </div>
      </div>
      <Button size="sm" onClick={() => onJoin(room.id)} disabled={room.phase !== 'waiting' || room.playerCount >= room.maxPlayers}>
        Join
      </Button>
    </div>
  );
}
