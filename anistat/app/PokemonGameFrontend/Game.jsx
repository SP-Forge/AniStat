import React, { useEffect, useState, useRef } from "react";

const CARD_BACK = "/pokemon_card_back.png";
const POKEMON_PRISMATIC_EVOLUTIONS_FILE = "/pokemonPrismaticEvolutions.json";

function getDamage(card) {
  // Use tcgplayer NEAR_MINT avg price as damage
  return card?.prices?.tcgplayer?.NEAR_MINT?.avg ?? 0;
}

function shuffle(array) {
  // Fisher-Yates shuffle
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Game({ scores = { you: 0, opponent: 0 }, result, roomId, onPlayCard }) {
  const [yourHand, setYourHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [yourActive, setYourActive] = useState(null);
  const [opponentActive, setOpponentActive] = useState(null);
  const pokemonPoolRef = useRef([]);

  // Load and deal cards on mount
  useEffect(() => {
    async function loadCards() {
      if (!pokemonPoolRef.current.length) {
        const res = await fetch(POKEMON_PRISMATIC_EVOLUTIONS_FILE);
        const data = await res.json();
        pokemonPoolRef.current = data.data || [];
      }
      const pool = shuffle(pokemonPoolRef.current);
      // Deal 5 random cards to each player (no overlap)
      const yourHand = pool.slice(0, 5);
      const opponentHand = pool.slice(5, 10);
      setYourHand(yourHand);
      setOpponentHand(opponentHand);
      setYourActive(yourHand[0]);
      setOpponentActive(opponentHand[0]);
    }
    loadCards();
  }, []);

  return (
    <main className="min-h-screen bg-black1 flex flex-col items-center justify-start p-8 relative overflow-hidden">
      {/* Background logo as cover, not selectable */}
      <div
        className="pointer-events-none select-none fixed inset-0 w-full h-full z-0 bg-center bg-no-repeat bg-cover opacity-80"
        style={{ backgroundImage: "url('/SP_Forge_Logo.png')" }}
        aria-hidden="true"
      />
      {/* Points display */}
      <div className="relative z-10 w-full flex flex-row justify-between items-start px-12 mt-2">
        <div className="flex flex-col items-start">
          <span className="text-white text-lg font-semibold">Your points:</span>
          <span className="text-green-400 text-4xl font-bold">{scores.you}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white text-lg font-semibold">Opponents points:</span>
          <span className="text-red-500 text-4xl font-bold">{scores.opponent}</span>
        </div>
      </div>

      {/* Opponent's hand */}
      <div className="relative z-10 flex flex-row justify-center items-center space-x-4 mt-8" style={{ height: '140px' }}>
        {opponentHand.map((card, i) => (
          <img
            key={card.id || i}
            src={CARD_BACK}
            alt="Opponent card back"
            className="w-20 h-28 rounded-lg shadow-lg select-none pointer-events-none"
            draggable="false"
            style={{ transform: `rotate(${(i - 2) * 10}deg) translateY(${Math.abs(i - 2) * 10}px)` }}
          />
        ))}
      </div>

      {/* Center area: active cards and logo */}
      <div className="relative z-10 flex flex-row justify-center items-center mt-2 mb-2 w-full">
        {/* Opponent's active card */}
        <div className="flex flex-col items-center mr-6">
          <div className="relative">
            {opponentActive && (
              <>
                <img src={opponentActive.image} alt={opponentActive.name} className="w-10 h-14 max-w-xs object-contain rounded-lg shadow-xl" />
                {/* Damage counter */}
                  <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full px-3 py-1 text-black font-bold text-lg border-2 border-red-500">
                  {getDamage(opponentActive)}
                </div>
              </>
            )}
          </div>
        </div>
        {/* VS logo (optional, can use text or image) */}
        <div className="flex flex-col items-center mx-1">
           <span className="text-xl font-extrabold text-white drop-shadow-lg">VS</span>
        </div>
        {/* Your active card */}
        <div className="flex flex-col items-center ml-6">
          <div className="relative">
            {yourActive && (
              <>
                <img src={yourActive.image} alt={yourActive.name} className="w-10 h-14 max-w-xs object-contain rounded-lg shadow-xl" />
                {/* Damage counter */}
                  <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full px-3 py-1 text-black font-bold text-lg border-2 border-green-400">
                  {getDamage(yourActive)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Your hand (fanned out) */}
      <div className="relative z-10 flex flex-row justify-center items-end space-x-4 mt-8" style={{ height: '140px' }}>
        {yourHand.map((card, i) => (
          <img
            key={card.id || i}
            src={card.image}
            alt={card.name}
            className="w-20 h-28 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform select-none"
            draggable="false"
            style={{ transform: `rotate(${(i - 2) * 10}deg) translateY(${Math.abs(i - 2) * 10}px)` }}
            onClick={() => {
              setYourActive(card);
              if (onPlayCard) onPlayCard(i);
            }}
          />
        ))}
      </div>
    </main>
  );
}