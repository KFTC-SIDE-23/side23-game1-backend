import { Server, Socket } from "socket.io";
import { getRoom } from "../stores/roomStore";

const WORDS = [
  "사과",
  "바나나",
  "자동차",
  "비행기",
  "고양이",
  "강아지",
  "컴퓨터",
  "책상",
  "의자",
  "커피",
];

interface Player {
  socketId: string;
  uid: string;
  name: string;
  avatar: string;
  word: string | null;
  drawings: string[]; // 각 라운드별 그림(데이터)
  answers: string[]; // 각 라운드별 정답(텍스트)
}

interface GameState {
  players: Player[];
  currentRound: number;
  isGameStarted: boolean;
  roundTime: number;
  timer: NodeJS.Timeout | null;
  roundSubmissions: Map<string, boolean>; // socketId -> 제출 여부
}

const gameStates: Map<number, GameState> = new Map();

export const setupGameSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // 방 입장
    socket.on("join_room", ({ roomId, uid, name, avatar }) => {
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      socket.join(roomId.toString());

      // 게임 상태 초기화 또는 가져오기
      if (!gameStates.has(roomId)) {
        gameStates.set(roomId, {
          players: [],
          currentRound: 0,
          isGameStarted: false,
          roundTime: 60,
          timer: null,
          roundSubmissions: new Map(),
        });
      }

      const gameState = gameStates.get(roomId)!;
      // 중복 입장 방지
      if (!gameState.players.find((p) => p.socketId === socket.id)) {
        const player: Player = {
          socketId: socket.id,
          uid,
          name,
          avatar,
          word: null,
          drawings: [],
          answers: [],
        };
        gameState.players.push(player);
      }

      // 방의 모든 플레이어에게 업데이트된 플레이어 목록 전송
      io.to(roomId.toString()).emit("players_updated", {
        players: gameState.players.map(({ name, avatar }) => ({
          name,
          avatar,
        })),
      });
    });

    // 게임 시작
    socket.on("start_game", ({ roomId }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState) return;
      if (gameState.isGameStarted) return;

      // 제시어 랜덤 배정
      const usedWords = new Set<string>();
      gameState.players.forEach((player) => {
        let word;
        do {
          word = WORDS[Math.floor(Math.random() * WORDS.length)];
        } while (usedWords.has(word) && usedWords.size < WORDS.length);
        player.word = word;
        usedWords.add(word);
      });

      // 각 플레이어에게 본인 제시어 전달 (첫 턴)
      gameState.players.forEach((player) => {
        io.to(player.socketId).emit("your_word", { word: player.word });
      });

      gameState.isGameStarted = true;
      gameState.currentRound = 1;
      startNewRound(io, roomId);
    });

    // 그림 제출 (draw 이벤트)
    socket.on("submit_drawing", ({ roomId, drawing }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState) return;
      const player = gameState.players.find((p) => p.socketId === socket.id);
      if (!player) return;
      player.drawings[gameState.currentRound - 1] = drawing;
      gameState.roundSubmissions.set(socket.id, true);
      checkRoundEnd(io, roomId);
    });

    // 정답 제출 (answer 이벤트)
    socket.on("submit_answer", ({ roomId, answer }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState) return;
      const player = gameState.players.find((p) => p.socketId === socket.id);
      if (!player) return;
      player.answers[gameState.currentRound - 1] = answer;
      gameState.roundSubmissions.set(socket.id, true);
      checkRoundEnd(io, roomId);
    });

    // 연결 해제
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      for (const [roomId, gameState] of gameStates.entries()) {
        const idx = gameState.players.findIndex(
          (p) => p.socketId === socket.id
        );
        if (idx !== -1) {
          gameState.players.splice(idx, 1);
          io.to(roomId.toString()).emit("players_updated", {
            players: gameState.players.map(({ name, avatar }) => ({
              name,
              avatar,
            })),
          });
          break;
        }
      }
    });
  });
};

function startNewRound(io: Server, roomId: number) {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;
  const players = gameState.players;
  if (players.length < 2) return;

  gameState.roundSubmissions = new Map();
  gameState.roundTime = 60;

  if (gameState.currentRound === 1) {
    // 1라운드: 각자 제시어만 확인, 아무 행동 없음
    players.forEach((player) => {
      io.to(player.socketId).emit("your_word", { word: player.word });
    });
    // 1라운드는 제출/타이머/다음 라운드로 자동 진행
    setTimeout(() => {
      gameState.currentRound++;
      startNewRound(io, roomId);
    }, 3000); // 3초 후 자동 진행
    return;
  }

  // 2라운드부터: 그림/정답 제출
  players.forEach((player, idx) => {
    const n = players.length;
    const leftIdx = (idx + 1) % n; // 왼쪽 사람
    if (gameState.currentRound % 2 === 0) {
      // 짝수 라운드: 왼쪽 사람의 정답을 보고 그림 그리기
      const answer = players[leftIdx].answers[gameState.currentRound - 2];
      io.to(player.socketId).emit("your_turn", {
        type: "draw",
        word: answer,
        round: gameState.currentRound,
      });
    } else {
      // 홀수 라운드: 왼쪽 사람의 그림을 보고 정답 맞추기
      const drawing = players[leftIdx].drawings[gameState.currentRound - 2];
      io.to(player.socketId).emit("your_turn", {
        type: "answer",
        drawing,
        round: gameState.currentRound,
      });
    }
  });

  // 타이머 시작
  if (gameState.timer) clearInterval(gameState.timer);
  gameState.timer = setInterval(() => {
    gameState.roundTime--;
    io.to(roomId.toString()).emit("timer_updated", {
      time: gameState.roundTime,
    });
    if (gameState.roundTime <= 0) {
      // 타임아웃: 제출 안한 사람은 자동 제출 처리
      players.forEach((player) => {
        if (!gameState.roundSubmissions.get(player.socketId)) {
          if (gameState.currentRound % 2 === 0) {
            player.drawings[gameState.currentRound - 1] = "";
          } else {
            player.answers[gameState.currentRound - 1] = "";
          }
          gameState.roundSubmissions.set(player.socketId, true);
        }
      });
      checkRoundEnd(io, roomId);
    }
  }, 1000);
}

function checkRoundEnd(io: Server, roomId: number) {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;
  const players = gameState.players;
  // 모든 플레이어가 제출했는지 확인
  if (players.every((p) => gameState.roundSubmissions.get(p.socketId))) {
    if (gameState.timer) {
      clearInterval(gameState.timer);
      gameState.timer = null;
    }
    // 다음 라운드로
    if (gameState.currentRound >= players.length) {
      io.to(roomId.toString()).emit("game_ended", {
        drawings: players.map((p) => p.drawings),
        answers: players.map((p) => p.answers),
        words: players.map((p) => p.word),
        players: players.map((p) => ({ name: p.name, avatar: p.avatar })),
      });
      return;
    }
    gameState.currentRound++;
    setTimeout(() => startNewRound(io, roomId), 1500);
  }
}
