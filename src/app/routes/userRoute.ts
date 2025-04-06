import { Router } from "express";
import { getUserProfile } from "../services/userService";

const userRouter = Router();

/**
 * UID로 유저 프로필 조회
 * GET /api/user/:uid → { name, avatar }
 */
userRouter.get("/:uid", (req, res) => {
  const profile = getUserProfile(req.params.uid);
  res.json(profile);
});

export default userRouter;
