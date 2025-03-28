import { Router } from "express";
import { getUserProfile } from "../../services/userService";

const userRouter = Router();
/**
 * 유저 조회 라우트
 */
userRouter.get("/profile/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  res.json(getUserProfile(id));
});

export default userRouter;
