import dotenv from "dotenv";
import path from "path";

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 환경 변수 타입 정의
interface EnvConfig {
  port: number;
  clientUrl: string;
  databaseUrl: string;
  nodeEnv: string;
}

// 환경 변수 로드 및 기본값 설정
export const config: EnvConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL || "테스트 DB URL", // 로컬 설정에 맞게 변경
  nodeEnv: process.env.NODE_ENV || "development",
};

// 필수 환경 변수 검증
if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is missing in .env file.");
}
