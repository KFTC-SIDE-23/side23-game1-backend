import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const authRouter = Router();

/**
 * 비회원 유저 UID 발급
 * POST /api/auth/guest → { uid: "..." }
 */
authRouter.post("/guest", (req, res) => {
  const uid = uuidv4();
  res.status(201).json({ uid });
});

export default authRouter;
