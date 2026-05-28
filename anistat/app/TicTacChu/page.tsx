'use client';

import { useEffect, useState } from 'react';

type Mark = 'X' | 'O';

interface PokemonReveal {
  name: string;
  image: string;
}

interface SquareProps {
  value: Mark | null;
  pokemon: PokemonReveal | null;
  isPending: boolean;
  onSquareClick: () => void;
}

interface BoardProps {
  xIsNext: boolean;
  squares: (Mark | null)[];
  pokemonPreviews: Array<PokemonReveal | null>;
  pendingIndex: number | null;
  onSquareClick: (index: number) => void;
}

function Square({ value, pokemon, isPending, onSquareClick }: SquareProps) {
  return (
    <button
      type="button"
      onClick={onSquareClick}
      className={`relative flex items-center justify-center overflow-hidden bg-black/40 ${isPending ? 'ring-4 ring-red-400' : ''}`}
      style={{
        width: 80,
        height: 80,
        border: '2px solid white',
      }}
    >
      {pokemon ? (
        <img src={pokemon.image} alt={pokemon.name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-white text-4xl font-bold">{value}</span>
      )}
    </button>
  );
}

function Board({ xIsNext, squares, pokemonPreviews, pendingIndex, onSquareClick }: BoardProps) {
  const winner = calculateWinner(squares);

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (!squares.includes(null)) {
    status = "It's a draw!";
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div>
      <div className="text-white text-xl font-bold mb-4">{status}</div>
      <div
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${Math.sqrt(squares.length)}, 80px)`,
        }}
      >
        {squares.map((value, index) => (
          <Square
            key={index}
            value={value}
            pokemon={pokemonPreviews[index]}
            isPending={pendingIndex === index}
            onSquareClick={() => onSquareClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Game() {
  const [boardSize, setBoardSize] = useState(3);
  const [history, setHistory] = useState<Array<(Mark | null)[]>>([Array(9).fill(null)]);
  const [pokemonPreviews, setPokemonPreviews] = useState<Array<PokemonReveal | null>>(Array(9).fill(null));
  const [pendingGuess, setPendingGuess] = useState<PokemonReveal | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const [guessMessage, setGuessMessage] = useState<string | null>(null);
  const [currentMove, setCurrentMove] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  useEffect(() => {
    const savedBoardSize = globalThis.localStorage?.getItem('ticTacChuBoardSize');
    const parsedBoardSize = savedBoardSize ? Number(savedBoardSize) : 3;

    if ([3, 4, 5].includes(parsedBoardSize) && parsedBoardSize !== boardSize) {
      const nextTotalSquares = parsedBoardSize * parsedBoardSize;
      setBoardSize(parsedBoardSize);
      setHistory([Array(nextTotalSquares).fill(null)]);
      setPokemonPreviews(Array(nextTotalSquares).fill(null));
      setPendingGuess(null);
      setPendingIndex(null);
      setGuess('');
      setGuessMessage(null);
      setCurrentMove(0);
    }
  }, []);

  function changeBoardSize(nextBoardSize: number) {
    const nextTotalSquares = nextBoardSize * nextBoardSize;

    setBoardSize(nextBoardSize);
    setHistory([Array(nextTotalSquares).fill(null)]);
    setPokemonPreviews(Array(nextTotalSquares).fill(null));
    setPendingGuess(null);
    setPendingIndex(null);
    setGuess('');
    setGuessMessage(null);
    setCurrentMove(0);

    globalThis.localStorage?.setItem('ticTacChuBoardSize', String(nextBoardSize));
  }

  async function handleSquareClick(index: number) {
    if (isRevealing || pendingGuess || calculateWinner(currentSquares) || currentSquares[index]) {
      return;
    }

    setIsRevealing(true);

    try {
      const response = await fetch('/api/getRandomPokemon');

      if (!response.ok) {
        return;
      }

      const pokemon = (await response.json()) as PokemonReveal;

      setPokemonPreviews((previous) => {
        const nextPreviews = previous.slice();
        nextPreviews[index] = pokemon;
        return nextPreviews;
      });

      setPendingGuess(pokemon);
      setPendingIndex(index);
      setGuess('');
      setGuessMessage(`Type the name of the pokemon to place ${xIsNext ? 'X' : 'O'}.`);
    } finally {
      setIsRevealing(false);
    }
  }

  function normalizeGuess(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function handleGuessSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pendingGuess || pendingIndex === null) {
      return;
    }

    if (normalizeGuess(guess) !== normalizeGuess(pendingGuess.name)) {
      // Wrong guess: pass the turn to the other player (no mark placed)
      const nextSquares = currentSquares.slice();
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);

      setPokemonPreviews((previous) => {
        const nextPreviews = previous.slice();
        if (pendingIndex !== null) nextPreviews[pendingIndex] = null;
        return nextPreviews;
      });

      setPendingGuess(null);
      setPendingIndex(null);
      setGuess('');
      setGuessMessage('Incorrect — turn passes to next player.');
      return;
    }

    const nextSquares = currentSquares.slice();
    nextSquares[pendingIndex] = xIsNext ? 'X' : 'O';

    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setPokemonPreviews((previous) => {
      const nextPreviews = previous.slice();
      nextPreviews[pendingIndex] = null;
      return nextPreviews;
    });
    setPendingGuess(null);
    setPendingIndex(null);
    setGuess('');
    setGuessMessage('Correct. Move placed.');
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((_squares, move) => {
    const description = move > 0 ? 'Go to move #' + move : 'Go to game start';

    return (
      <li key={move}>
        <button type="button" onClick={() => jumpTo(move)}>
          {description}
        </button>
      </li>
    );
  });

  return (
    <div className="bg-cover bg-[url('/red%20and%20black.png')] min-h-screen">
      <header className="bg-black1 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-24" />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start text-white">
        <div className="w-full max-w-md border-red1 border-4 bg-black2/70 rounded-lg shadow-lg p-8 mb-12 mt-8 lg:justify-self-start">
          <h1 className="text-white text-2xl font-bold">Game Settings</h1>
          <h5 className="text-gray-300 text-lg font-semibold">Change Board Size</h5>

          <p>
            <label className="p-1">
              <input type="radio" name="myRadio" value="3" checked={boardSize === 3} onChange={() => changeBoardSize(3)} /> 3x3
            </label>
            <label className="p-2">
              <input type="radio" name="myRadio" value="4" checked={boardSize === 4} onChange={() => changeBoardSize(4)} /> 4x4
            </label>
            <label className="p-2">
              <input type="radio" name="myRadio" value="5" checked={boardSize === 5} onChange={() => changeBoardSize(5)} /> 5x5
            </label>
          </p>

          <h5 className="text-gray-300 text-lg font-semibold">Change Difficulty</h5>
          <label className="p-1"><input type="radio" name="myRadio2" value="option1" defaultChecked /> Local</label>
          <label className="p-1"><input type="radio" name="myRadio2" value="option1" /> Easy Ai</label>
          <label className="p-2"><input type="radio" name="myRadio2" value="option2" /> Medium Ai</label>
          <label className="p-2"><input type="radio" name="myRadio2" value="option3" /> Hard Ai</label>
        </div>

        <div className="w-full max-w-fit justify-self-center border-red1 border-4 bg-black2/70 flex justify-center items-center flex-col rounded-lg shadow-lg p-8 mb-12 mt-8 text-white text-2xl font-bold pb">
          <div className="text-white text-2xl font-bold mb-4">Game Board</div>
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            pokemonPreviews={pokemonPreviews}
            pendingIndex={pendingIndex}
            onSquareClick={handleSquareClick}
          />
          {isRevealing ? <div className="mt-4 text-sm text-gray-300">Drawing a Pokémon...</div> : null}
          {pendingGuess ? (
            <form onSubmit={handleGuessSubmit} className="mt-6 w-full max-w-sm text-white text-base font-normal">
              <label className="block text-sm font-semibold text-gray-200 mb-2" htmlFor="pokemon-guess">
                Name the Pokémon
              </label>
              <div className="flex gap-2">
                <input
                  id="pokemon-guess"
                  type="text"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  className="flex-1 rounded-md border border-gray-500 bg-black/50 px-3 py-2 text-white outline-none"
                  placeholder="Type the name here"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <button type="submit" className="rounded-md bg-red1 px-4 py-2 font-semibold text-white">
                  Place
                </button>
              </div>
              {guessMessage ? <p className="mt-2 text-sm text-gray-300">{guessMessage}</p> : null}
            </form>
          ) : null}
        </div>

        <div className="w-full max-w-md border-red1 border-4 bg-black2/70 rounded-lg shadow-lg p-8 mb-12 mt-8 lg:justify-self-end">
          <div className="text-white text-xl font-bold mt-8 mb-4">Game History</div>
          <ol className="mt-6 text-white">{moves}</ol>
        </div>
      </main>
    </div>
  );
}

function calculateWinner(squares: (Mark | null)[]) {
  const size = Math.sqrt(squares.length);
  const lines: number[][] = [];

  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    const row = [];
    for (let columnIndex = 0; columnIndex < size; columnIndex++) {
      row.push(rowIndex * size + columnIndex);
    }
    lines.push(row);
  }

  for (let columnIndex = 0; columnIndex < size; columnIndex++) {
    const column = [];
    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
      column.push(rowIndex * size + columnIndex);
    }
    lines.push(column);
  }

  lines.push(Array.from({ length: size }, (_, index) => index * (size + 1)));
  lines.push(Array.from({ length: size }, (_, index) => (index + 1) * (size - 1)));

  for (const line of lines) {
    const first = squares[line[0]];
    if (!first) {
      continue;
    }

    if (line.every((squareIndex) => squares[squareIndex] === first)) {
      return first;
    }
  }

  return null;
}
