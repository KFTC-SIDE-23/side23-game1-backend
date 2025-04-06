import request from "supertest";
import express from "express";
import gameRouter from "../src/app/routes/gameRoute";

const app = express();
app.use(express.json());
app.use("/api/game", gameRouter);

describe("POST /api/game/room", () => {
  it("should create a room with valid password and return roomId", async () => {
    const res = await request(app)
      .post("/api/game/room")
      .send({ password: "test123" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("roomId");
    expect(typeof res.body.roomId).toBe("number");
    expect(res.body.roomId).toBeGreaterThanOrEqual(10000);
    expect(res.body.roomId).toBeLessThanOrEqual(99999);
  });

  it("should return 400 when password is missing", async () => {
    const res = await request(app).post("/api/game/room").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Password is required");
  });
});
