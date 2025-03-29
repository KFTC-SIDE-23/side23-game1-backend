import { Application } from "express";
import userRouter from "../routes/userRoute";
import authRouter from "./authRoute";

export const setupRoutes = (app: Application): void => {
  app.use("/api/user", userRouter);
  app.use("/api/auth", authRouter);
};
