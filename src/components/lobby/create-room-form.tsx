'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface CreateRoomFormProps {
  onSubmit: (roomName: string, playerName: string, botCount: number) => Promise<void>;
}

export function CreateRoomForm({ onSubmit }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState('Destiny Room');
  const [playerName, setPlayerName] = useState('Hieu');
  const [botCount, setBotCount] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !playerName.trim()) return;
    setLoading(true);
    try {
      await onSubmit(roomName.trim(), playerName.trim(), botCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Your Name" placeholder="Enter your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} required />
      <Input label="Room Name" placeholder="Enter room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Bot Players</label>
        <select
          value={botCount}
          onChange={(e) => setBotCount(Number(e.target.value))}
          className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>
              {n === 0 ? 'No bots' : `${n} bot${n > 1 ? 's' : ''}`}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Room'}
      </Button>
    </form>
  );
}
