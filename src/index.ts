import { createServer } from "./app/server";
import { config } from "./config/env"; // env.ts에서 환경 변수 로드

const { server } = createServer();
const PORT = config.port;

// 서버 실행
server.listen(PORT, () => {
  console.log(`서버 실행 => http://localhost:${PORT}`);
});
