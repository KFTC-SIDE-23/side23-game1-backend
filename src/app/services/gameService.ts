import { addRoom, GameRoom, isRoomIdTaken } from "../stores/roomStore";

function generateUniqueRoomId(): number {
  let roomId;
  let tries = 0;

  do {
    roomId = Math.floor(10000 + Math.random() * 90000); // 10000 ~ 99999
    tries++;
    if (tries > 100) throw new Error("Failed to generate unique room ID");
  } while (isRoomIdTaken(roomId));

  return roomId;
}

export function createGameRoom(password: string): GameRoom {
  const roomId = generateUniqueRoomId();
  const room: GameRoom = { roomId, password };
  addRoom(room);
  return room;
}
