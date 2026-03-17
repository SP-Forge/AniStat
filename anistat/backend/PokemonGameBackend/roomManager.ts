import { Room, Player } from "./type.ts"
import { startGame } from "./game.ts"

export const rooms = new Map<string, Room>()

export function createRoom(player: Player) {
  const room: Room = {
    id: crypto.randomUUID(),
    players: [player],
    round: 0,
    played: {}
  }

  rooms.set(room.id, room)
  return room
}

export function joinRoom(roomId: string, player: Player) {
  const room = rooms.get(roomId)
  if (!room || room.players.length >= 2) return null

  room.players.push(player)

  // Do not start game automatically. Wait for explicit startGame message from host.

  return room
}