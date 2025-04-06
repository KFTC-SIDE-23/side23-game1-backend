import { Application } from "express";
import userRouter from "../routes/userRoute";
import authRouter from "./authRoute";
import gameRouter from "./gameRoute";

export const setupRoutes = (app: Application): void => {
  app.use("/api/user", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/game", gameRouter);
};
