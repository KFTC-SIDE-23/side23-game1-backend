import { Server, Socket } from "socket.io";
import { getRoom } from "../stores/roomStore";

interface Player {
  socketId: string;
  uid: string;
  name: string;
  avatar: string;
  word: string | null;
  isDrawing: boolean;
}

interface GameState {
  players: Map<string, Player>;
  currentRound: number;
  currentPlayerIndex: number;
  isGameStarted: boolean;
  isRoundStarted: boolean;
  roundTime: number;
  timer: NodeJS.Timeout | null;
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
          players: new Map(),
          currentRound: 0,
          currentPlayerIndex: 0,
          isGameStarted: false,
          isRoundStarted: false,
          roundTime: 60, // 60초
          timer: null,
        });
      }

      const gameState = gameStates.get(roomId)!;
      const player: Player = {
        socketId: socket.id,
        uid,
        name,
        avatar,
        word: null,
        isDrawing: false,
      };

      gameState.players.set(socket.id, player);

      // 방의 모든 플레이어에게 업데이트된 플레이어 목록 전송
      io.to(roomId.toString()).emit("players_updated", {
        players: Array.from(gameState.players.values()),
      });
    });

    // 제시어 제출
    socket.on("submit_word", ({ roomId, word }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState) return;

      const player = gameState.players.get(socket.id);
      if (player) {
        player.word = word;

        // 모든 플레이어가 제시어를 제출했는지 확인
        const allWordsSubmitted = Array.from(gameState.players.values()).every(
          (p) => p.word !== null
        );

        if (allWordsSubmitted) {
          startGame(io, roomId);
        }
      }
    });

    // 게임 시작
    function startGame(io: Server, roomId: number) {
      const gameState = gameStates.get(roomId);
      if (!gameState) return;

      gameState.isGameStarted = true;
      gameState.currentRound = 1;
      startNewTurn(io, roomId);
    }

    // 그림 그리기
    socket.on("draw", ({ roomId, data }) => {
      socket.to(roomId.toString()).emit("drawing", data);
    });

    // 정답 제출
    socket.on("submit_answer", ({ roomId, answer }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState) return;

      const currentPlayer = Array.from(gameState.players.values())[
        gameState.currentPlayerIndex
      ];
      const nextPlayer = Array.from(gameState.players.values())[
        (gameState.currentPlayerIndex + 1) % gameState.players.size
      ];

      if (answer.toLowerCase() === currentPlayer.word?.toLowerCase()) {
        io.to(roomId.toString()).emit("correct_answer", {
          player: nextPlayer.name,
          word: currentPlayer.word,
        });

        // 다음 턴으로 이동
        setTimeout(() => {
          gameState.currentPlayerIndex =
            (gameState.currentPlayerIndex + 1) % gameState.players.size;
          startNewTurn(io, roomId);
        }, 3000);
      }
    });

    // 연결 해제
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      // 플레이어가 속한 방 찾기
      for (const [roomId, gameState] of gameStates.entries()) {
        if (gameState.players.has(socket.id)) {
          gameState.players.delete(socket.id);

          // 방의 모든 플레이어에게 업데이트된 플레이어 목록 전송
          io.to(roomId.toString()).emit("players_updated", {
            players: Array.from(gameState.players.values()),
          });

          break;
        }
      }
    });
  });
};

function startNewTurn(io: Server, roomId: number) {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;

  const players = Array.from(gameState.players.values());
  const currentPlayer = players[gameState.currentPlayerIndex];
  const nextPlayer =
    players[(gameState.currentPlayerIndex + 1) % players.length];
  const isEvenPlayers = players.length % 2 === 0;

  // 현재 플레이어의 상태 설정
  currentPlayer.isDrawing = true;

  // 첫 라운드이고 짝수 인원일 때는 자신의 제시어를 보고 그림을 그리도록
  if (gameState.currentRound === 1 && isEvenPlayers) {
    io.to(currentPlayer.socketId).emit("your_turn", {
      word: currentPlayer.word,
      isDrawing: true,
    });
  } else {
    // 홀수 인원이거나 첫 라운드가 아닐 때는 다음 플레이어의 제시어를 보고 그림을 그리도록
    io.to(currentPlayer.socketId).emit("your_turn", {
      word: nextPlayer.word,
      isDrawing: true,
    });
  }

  // 다른 플레이어들에게는 현재 플레이어가 그림을 그리는 중임을 알림
  io.to(roomId.toString())
    .except(currentPlayer.socketId)
    .emit("player_drawing", {
      player: currentPlayer.name,
    });

  // 타이머 시작
  gameState.timer = setInterval(() => {
    gameState.roundTime--;

    io.to(roomId.toString()).emit("timer_updated", {
      time: gameState.roundTime,
    });

    if (gameState.roundTime <= 0) {
      endTurn(io, roomId);
    }
  }, 1000);
}

function endTurn(io: Server, roomId: number) {
  const gameState = gameStates.get(roomId);
  if (!gameState) return;

  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }

  const currentPlayer = Array.from(gameState.players.values())[
    gameState.currentPlayerIndex
  ];
  currentPlayer.isDrawing = false;

  // 다음 턴으로 이동
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex + 1) % gameState.players.size;
  gameState.roundTime = 60;

  // 모든 플레이어가 한 바퀴 돌았는지 확인
  if (gameState.currentPlayerIndex === 0) {
    gameState.currentRound++;

    // 게임이 끝났는지 확인 (모든 플레이어가 자신의 제시어를 맞추는 순서까지 돌았는지)
    if (gameState.currentRound > gameState.players.size) {
      io.to(roomId.toString()).emit("game_ended");
      return;
    }
  }

  startNewTurn(io, roomId);
}
