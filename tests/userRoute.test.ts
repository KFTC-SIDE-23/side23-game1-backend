import request from "supertest";
import express from "express";
import userRouter from "../src/app/routes/userRoute";

const app = express();
app.use(express.json());
app.use("/api/user", userRouter);

describe("GET /api/user/:uid", () => {
  it("should return user profile for valid UID", async () => {
    const uid = "abc-123";
    const res = await request(app).get(`/api/user/${uid}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("avatar");
  });

  it("should return 404 for empty UID", async () => {
    const res = await request(app).get("/api/user/");

    expect(res.status).toBe(404);
  });
});
