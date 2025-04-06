export interface GameRoom {
  roomId: number;
  password: string;
}

const roomStore: Map<number, GameRoom> = new Map();

export const addRoom = (room: GameRoom) => {
  roomStore.set(room.roomId, room);
};

export const getRoom = (roomId: number) => {
  return roomStore.get(roomId);
};

export const isRoomIdTaken = (roomId: number): boolean => {
  return roomStore.has(roomId);
};
