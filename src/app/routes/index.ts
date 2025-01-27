import { Application } from "express";
import setupRouter from "../routes/setupRoute";

// 라우터 통합 파일
export const setupRoutes = (app: Application): void => {
  app.use("/api/setup", setupRouter); // 헬스체크 등 서버 설정 관련 라우트
  // app.use("/api/user/", userRouter); // 샘플코드
};
