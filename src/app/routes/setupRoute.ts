import { Router } from "express";

const setupRouter = Router();
/**
 * 라우트 파일은 헬스 체크, 정적 데이터 제공 API등의 엔드포인트로 사용됨
 * 필요시 도메인에 따라 라우트 파일 추가 필요
 * 아래는 샘플코드임
 */
setupRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

export default setupRouter;
