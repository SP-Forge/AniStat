import React from "react";

export default function Game({ hand, scores, result, roomId, onPlayCard }) {
  return (
    <div>
      <h1>Card Battle</h1>
      <p>Room: {roomId}</p>
      <div>
        <h3>Your Hand:</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {hand && hand.length > 0 ? (
            hand.map(card => (
              <button
                key={card.id}
                style={{ padding: 12, fontSize: 18 }}
                onClick={() => onPlayCard && onPlayCard(card.id)}
              >
                {card.value}
              </button>
            ))
          ) : (
            <span>No cards in hand.</span>
          )}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3>Scores:</h3>
        <pre>{JSON.stringify(scores, null, 2)}</pre>
      </div>
      {result && (
        <div style={{ marginTop: 16 }}>
          <h2>Winner: {result}</h2>
        </div>
      )}
    </div>
  );
}
