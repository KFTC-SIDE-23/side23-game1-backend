/**
 * 게임 관련 도메인 샘플코드
 * 인터페이서 설계에 따라 변경 필요
 */

interface Player {
  id: string;
  name: string;
}

interface Room {
  name: string;
  players: Player[];
}

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(name: string): Room {
    const room = { name, players: [] };
    this.rooms.set(name, room);
    return room;
  }

  joinRoom(name: string, player: Player): Room | null {
    const room = this.rooms.get(name);
    if (!room) return null;
    room.players.push(player);
    return room;
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

export const roomManager = new RoomManager();
