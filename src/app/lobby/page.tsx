'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../hooks/use-socket';
import { useLobby } from '../../hooks/use-lobby';
import { RoomCard } from '../../components/lobby/room-card';
import { JoinRoomForm } from '../../components/lobby/join-room-form';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';

export default function LobbyPage() {
  const router = useRouter();
  const socket = useSocket();
  const { lobbyRooms, refreshRooms, joinRoom } = useLobby();
  const [joinModalRoom, setJoinModalRoom] = useState<string | null>(null);

  useEffect(() => {
    refreshRooms();
    const interval = setInterval(refreshRooms, 3000);
    return () => clearInterval(interval);
  }, [refreshRooms]);

  const handleJoin = async (roomId: string, playerName: string) => {
    await joinRoom(roomId, playerName);
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Open Rooms</h1>
            <p className="text-gray-400 text-sm">{lobbyRooms.length} rooms available</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={refreshRooms}>Refresh</Button>
            <Button size="sm" onClick={() => router.push('/')}>Back</Button>
          </div>
        </div>

        {lobbyRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No open rooms</p>
            <p className="text-sm mt-1">Create one from the home page!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lobbyRooms.map((room) => (
              <RoomCard key={room.id} room={room} onJoin={(id) => setJoinModalRoom(id)} />
            ))}
          </div>
        )}

        <Modal open={!!joinModalRoom} onClose={() => setJoinModalRoom(null)} title="Join Room">
          {joinModalRoom && (
            <JoinRoomForm initialRoomId={joinModalRoom} onSubmit={handleJoin} />
          )}
        </Modal>
      </div>
    </div>
  );
}
