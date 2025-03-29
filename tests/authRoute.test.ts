import request from "supertest";
import express from "express";
import authRouter from "../src/app/routes/authRoute";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("POST /api/auth/guest", () => {
  it("should return 201 and a uid", async () => {
    const res = await request(app).post("/api/auth/guest");

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("uid");
    expect(typeof res.body.uid).toBe("string");
    expect(res.body.uid.length).toBeGreaterThan(0);
  });
});
