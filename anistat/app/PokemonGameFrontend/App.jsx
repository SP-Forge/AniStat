
"use client";
import { useEffect, useState } from "react"
import { socket } from "./socket.js"
import Game from "./Game.jsx"

export default function App() {
  const [page, setPage] = useState("landing");
  const [roomId, setRoomId] = useState("");
  const [hand, setHand] = useState([]);
  const [scores, setScores] = useState({});
  const [result, setResult] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "roomCreated") {
        setRoomId(msg.roomId);
        setIsHost(true);
      }

      if (msg.type === "gameStart") {
        setPlayers(msg.players);
        // Find this client's hand by matching socket id (or fallback to first)
        // For now, just use the first hand as before
        const me = msg.players[0];
        setHand(me.hand);
        setPage("game");
      }

      if (msg.type === "playerJoined") {
        setPlayers(msg.players);
        if (!roomId && msg.players.length > 0) {
          // Set roomId for the joined player if not already set
          setRoomId(msg.players[0].id);
        }
        if (page !== "lobby") {
          setPage("lobby");
        }
      }

      if (msg.type === "roundResult") {
        setScores(msg.scores);
      }

      if (msg.type === "gameEnd") {
        setResult(msg.winner);
      }
    };
  }, []);

  const [joinRoomId, setJoinRoomId] = useState("");

  if (page === "landing") {
    return (
      <div>
        <h1>Card Battle</h1>
        <button onClick={() => setPage("lobby")}>Create Lobby</button>
        <div style={{ marginTop: 24 }}>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={e => setJoinRoomId(e.target.value)}
            style={{ padding: 8, fontSize: 16, marginRight: 8 }}
          />
          <button
            onClick={() => {
              if (joinRoomId) {
                socket.send(JSON.stringify({ type: "joinRoom", roomId: joinRoomId }));
                setPage("lobby");
              }
            }}
            style={{ padding: 8, fontSize: 16 }}
          >
            Join Lobby
          </button>
        </div>
      </div>
    );
  }

  // Lobby/Game UI
  // Show lobby UI if roomId exists but hand is empty (waiting for game start)
  if (roomId && hand.length === 0) {
    return (
      <div>
        <h1>Card Battle</h1>
        <p>Room: {roomId}</p>
        <h3>Players in Lobby:</h3>
        <ul>
          {players.map((p, idx) => (
            <li key={p.id || idx}>{p.id ? `Player ${idx + 1}` : `Unknown Player`}</li>
          ))}
        </ul>
        <p>{players.length < 2 ? "Waiting for another player to join..." : "Ready to start!"}</p>
        {isHost && players.length === 2 && (
          <button
            style={{ marginTop: 16, padding: 8, fontSize: 16 }}
            onClick={() => socket.send(JSON.stringify({ type: "startGame" }))}
          >
            Start Game
          </button>
        )}
      </div>
    );
  }

  // Game UI
  if (page === "game" && roomId && hand.length > 0) {
    return (
      <Game
        hand={hand}
        scores={scores}
        result={result}
        roomId={roomId}
        onPlayCard={cardId =>
          socket.send(JSON.stringify({ type: "playCard", cardId }))
        }
      />
    );
  }

  return (
    <div>
      <h1>Card Battle</h1>
      {!roomId && (
        <button onClick={() => socket.send(JSON.stringify({ type: "createRoom" }))}>
          Create Room
        </button>
      )}
    </div>
  );
}