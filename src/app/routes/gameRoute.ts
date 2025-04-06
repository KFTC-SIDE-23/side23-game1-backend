import { Router } from "express";
import { createGameRoom } from "../services/gameService";

const gameRouter = Router();

/**
 * 방 생성 API
 * POST /api/game/room
 * 요청: { password: string }
 * 응답: { roomId: number }
 */
gameRouter.post("/room", (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  try {
    const room = createGameRoom(password);
    res.status(201).json({ roomId: room.roomId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

export default gameRouter;
