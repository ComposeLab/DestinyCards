'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface JoinRoomFormProps {
  onSubmit: (roomId: string, playerName: string) => Promise<void>;
  initialRoomId?: string;
}

export function JoinRoomForm({ onSubmit, initialRoomId = '' }: JoinRoomFormProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [playerName, setPlayerName] = useState('Hieu');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !playerName.trim()) return;
    setLoading(true);
    try {
      await onSubmit(roomId.trim().toUpperCase(), playerName.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Your Name" placeholder="Enter your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} required />
      <Input label="Room Code" placeholder="e.g. ABC123" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} maxLength={6} required />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Joining...' : 'Join Room'}
      </Button>
    </form>
  );
}
