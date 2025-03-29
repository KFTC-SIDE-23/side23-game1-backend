import { createServer } from "./app/server";
import { config } from "./config/env";

const { server } = createServer();
const PORT = config.port;

server.listen(PORT, () => {
  console.log(`서버 실행 => http://localhost:${PORT}`);
});
