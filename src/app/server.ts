import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import { setupRoutes } from "./routes/index";
import { setupSocket } from "./socket";
import { config } from "../config/env";

export const createServer = (): {
  app: Application;
  server: http.Server;
  io: Server;
} => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ["GET", "POST"],
    },
  });

  // 미들웨어, 라우터 설정
  app.use(express.json());
  setupRoutes(app);

  // Socket.IO
  setupSocket(io);

  return { app, server, io };
};
