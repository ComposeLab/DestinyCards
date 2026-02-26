'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../hooks/use-socket';
import { useLobby } from '../hooks/use-lobby';
import { CreateRoomForm } from '../components/lobby/create-room-form';
import { JoinRoomForm } from '../components/lobby/join-room-form';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const socket = useSocket();
  const { createRoom, joinRoom } = useLobby();
  const [tab, setTab] = useState<'create' | 'join'>('create');

  const handleCreate = async (roomName: string, playerName: string, botCount: number) => {
    const roomId = await createRoom(roomName, playerName, { botCount });
    router.push(`/room/${roomId}`);
  };

  const handleJoin = async (roomId: string, playerName: string) => {
    await joinRoom(roomId, playerName);
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            DestinyCards
          </h1>
          <p className="text-gray-400 mt-2">3-Card Poker / Teen Patti</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6 backdrop-blur">
          <div className="flex gap-2 mb-6">
            <Button variant={tab === 'create' ? 'primary' : 'ghost'} onClick={() => setTab('create')} className="flex-1">
              Create Room
            </Button>
            <Button variant={tab === 'join' ? 'primary' : 'ghost'} onClick={() => setTab('join')} className="flex-1">
              Join Room
            </Button>
          </div>

          {tab === 'create' ? (
            <CreateRoomForm onSubmit={handleCreate} />
          ) : (
            <JoinRoomForm onSubmit={handleJoin} />
          )}

          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => router.push('/lobby')}>
              Browse Open Rooms
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
