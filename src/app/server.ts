import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import { setupRoutes } from "./routes/index";
import { config } from "../config/env";

export const createServer = () => {
  const app: Application = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ["GET", "POST"],
    },
  });

  app.use(express.json());
  setupRoutes(app);

  return { app, server };
};
