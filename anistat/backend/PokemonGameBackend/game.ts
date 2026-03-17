import { Card, Room } from "./type.ts"

export function randomCard(): Card {
  return {
    id: crypto.randomUUID(),
    value: Math.floor(Math.random() * 100)
  }
}

export function startGame(room: Room) {
  room.round = 1
  room.played = {}

  for (const p of room.players) {
    p.hand = Array.from({ length: 5 }, () => randomCard())
    p.score = 0
  }
}

export function playCard(room: Room, playerId: string, cardId: string) {
  const player = room.players.find(p => p.id === playerId)!
  const card = player.hand.find(c => c.id === cardId)!
  
  player.hand = player.hand.filter(c => c.id !== cardId)
  room.played[playerId] = card

  return checkRound(room)
}

function checkRound(room: Room) {
  const [p1, p2] = room.players
  const c1 = room.played[p1.id]
  const c2 = room.played[p2.id]

  if (!c1 || !c2) return null

  let winner = null

  if (c1.value > c2.value) {
    p1.score++
    winner = p1.id
  } else if (c2.value > c1.value) {
    p2.score++
    winner = p2.id
  }

  const result = {
    type: "roundResult",
    c1,
    c2,
    scores: {
      [p1.id]: p1.score,
      [p2.id]: p2.score
    }
  }

  room.round++
  room.played = {}

  if (room.round > 5) {
    return {
      type: "gameEnd",
      winner:
        p1.score > p2.score ? p1.id :
        p2.score > p1.score ? p2.id : "draw"
    }
  }

  return result
}