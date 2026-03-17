export type Card = {
  id: string
  value: number
}

export type Player = {
  id: string
  socket: WebSocket
  hand: Card[]
  score: number
}

export type Room = {
  id: string
  players: Player[]
  round: number
  played: Record<string, Card | null>
}