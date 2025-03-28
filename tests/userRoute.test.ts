// tests/userRoute.test.ts
import request from "supertest";
import express from "express";
import userRouter from "../src/app/routes/userRoute";

const app = express();
app.use(express.json());
app.use("/user", userRouter);

describe("GET /user/profile/:id", () => {
  it("should return user profile for valid integer ID", async () => {
    const res = await request(app).get("/user/profile/1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("avatar");
  });

  it("should return 400 for invalid ID (string)", async () => {
    const res = await request(app).get("/user/profile/abc");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid user ID" });
  });

  it("should return 400 for float ID", async () => {
    const res = await request(app).get("/user/profile/12.34");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid user ID" });
  });

  it("should return 404 for missing ID", async () => {
    const res = await request(app).get("/user/profile/");
    expect(res.status).toBe(404);
  });
});
