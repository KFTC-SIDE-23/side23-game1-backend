import { Server, Socket } from "socket.io";
import { roomManager } from "../game/RoomManager";

export const setupSocket = (io: Server): void => {
  // 미들웨어 사용시
  // io.use(미들웨어)
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("createRoom", (roomName: string) => {
      const room = roomManager.createRoom(roomName);
      socket.join(room.name);
      console.log(`Room created: ${room.name}`);
      socket.emit("roomCreated", room);
    });

    socket.on("joinRoom", (roomName: string) => {
      const room = roomManager.joinRoom(roomName, {
        id: socket.id,
        name: "Player",
      });
      if (room) {
        socket.join(room.name);
        console.log(`User ${socket.id} joined room: ${room.name}`);
        io.to(room.name).emit("playerJoined", { id: socket.id, room });
      } else {
        socket.emit("error", { message: "Room not found" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
