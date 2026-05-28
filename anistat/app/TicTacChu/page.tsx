'use client';

import { useEffect, useState } from 'react';

type Mark = 'pokeball' | 'premierball';

const MARK_IMAGES: Record<Mark, string> = {
  pokeball: '/pokeball.png',
  premierball: '/Premierball.png',
};

const MARK_LABELS: Record<Mark, string> = {
  pokeball: 'Pokeball',
  premierball: 'Premierball',
};

const TURN_TIME_LIMIT = 20;

type Difficulty = 'local' | 'easy' | 'medium' | 'hard';

interface PokemonReveal {
  name: string;
  image: string;
}

interface SquareProps {
  value: Mark | null;
  pokemon: PokemonReveal | null;
  isPending: boolean;
  isCelebrating: boolean;
  onSquareClick: () => void;
}

interface BoardProps {
  xIsNext: boolean;
  squares: (Mark | null)[];
  pokemonPreviews: Array<PokemonReveal | null>;
  pendingIndex: number | null;
  celebratedIndex: number | null;
  onSquareClick: (index: number) => void;
}

function getAiCorrectGuessChance(difficulty: Difficulty) {
  if (difficulty === 'easy') {
    return 0.3;
  }

  if (difficulty === 'medium') {
    return 0.6;
  }

  if (difficulty === 'hard') {
    return 0.9;
  }

  return 0;
}

function Square({ value, pokemon, isPending, isCelebrating, onSquareClick }: SquareProps) {
  return (
    <button
      type="button"
      onClick={onSquareClick}
      className={`relative flex items-center justify-center overflow-hidden bg-black/40 transition-transform duration-300 ${isPending ? 'ring-4 ring-red-400' : ''} ${isCelebrating ? 'scale-110 ring-4 ring-yellow-300 shadow-[0_0_24px_rgba(253,224,71,0.95)]' : ''}`}
      style={{
        width: 80,
        height: 80,
        border: '2px solid white',
      }}
    >
      {pokemon ? (
        <img src={pokemon.image} alt={pokemon.name} className="h-full w-full object-cover" />
      ) : value ? (
        <img src={MARK_IMAGES[value]} alt={MARK_LABELS[value]} className="h-3/4 w-3/4 object-contain" />
      ) : null}
      {isCelebrating ? <span className="pointer-events-none absolute inset-0 animate-ping rounded-md bg-yellow-300/30" /> : null}
    </button>
  );
}

function Board({ xIsNext, squares, pokemonPreviews, pendingIndex, celebratedIndex, onSquareClick }: BoardProps) {
  const winner = calculateWinner(squares);

  let status;
  if (winner) {
    status = 'Winner: ' + MARK_LABELS[winner];
  } else if (!squares.includes(null)) {
    status = "It's a draw!";
  } else {
    status = 'Next player: ' + MARK_LABELS[xIsNext ? 'pokeball' : 'premierball'];
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
            isCelebrating={celebratedIndex === index}
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
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('local');
  const [scores, setScores] = useState<Record<Mark, number>>({ pokeball: 0, premierball: 0 });
  const [pendingGuess, setPendingGuess] = useState<PokemonReveal | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const [guessMessage, setGuessMessage] = useState<string | null>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_TIME_LIMIT);
  const [celebratedIndex, setCelebratedIndex] = useState<number | null>(null);
  const [currentMove, setCurrentMove] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const isAiTurn = difficulty !== 'local' && !xIsNext;

  function getRandomEmptySquare(squares: (Mark | null)[]) {
    const emptySquares = squares
      .map((square, index) => (square === null ? index : null))
      .filter((index): index is number => index !== null);

    if (!emptySquares.length) {
      return null;
    }

    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  }

  function getAiGuess(correctName: string) {
    const shouldGuessCorrectly = Math.random() < getAiCorrectGuessChance(difficulty);

    if (shouldGuessCorrectly) {
      return correctName;
    }

    const wrongChoices = pokemonNames.filter((name) => normalizeGuess(name) !== normalizeGuess(correctName));

    if (!wrongChoices.length) {
      return `${correctName}x`;
    }

    return wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
  }

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
      setTurnTimeLeft(TURN_TIME_LIMIT);
      setCelebratedIndex(null);
      setCurrentMove(0);
    }
  }, []);

  useEffect(() => {
    async function loadPokemonNames() {
      try {
        const response = await fetch('/pokemon-details.json');

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { pokemon?: Array<{ name?: string }> };
        const names = data.pokemon?.map((pokemon) => pokemon.name?.trim()).filter((name): name is string => Boolean(name)) ?? [];
        setPokemonNames(names);
      } catch {
        setPokemonNames([]);
      }
    }

    loadPokemonNames();
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
    setTurnTimeLeft(TURN_TIME_LIMIT);
    setCelebratedIndex(null);
    setCurrentMove(0);

    globalThis.localStorage?.setItem('ticTacChuBoardSize', String(nextBoardSize));
  }

  function resetBoard(keepScore: boolean) {
    const nextTotalSquares = boardSize * boardSize;

    setHistory([Array(nextTotalSquares).fill(null)]);
    setPokemonPreviews(Array(nextTotalSquares).fill(null));
    setPendingGuess(null);
    setPendingIndex(null);
    setGuess('');
    setGuessMessage(null);
    setTurnTimeLeft(TURN_TIME_LIMIT);
    setCelebratedIndex(null);
    setCurrentMove(0);

    if (!keepScore) {
      setScores({ pokeball: 0, premierball: 0 });
    }
  }

  function passTurn(message: string) {
    if (!pendingGuess || pendingIndex === null) {
      return;
    }

    const nextSquares = currentSquares.slice();
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
    setGuessMessage(message);
    setTurnTimeLeft(TURN_TIME_LIMIT);
    setCelebratedIndex(null);
  }

  async function handleSquareClick(index: number, fromAi = false) {
    if (isRevealing || pendingGuess || calculateWinner(currentSquares) || currentSquares[index] || (!fromAi && isAiTurn)) {
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
      setTurnTimeLeft(TURN_TIME_LIMIT);
      setCelebratedIndex(null);
      setGuessMessage(`Type the name of the pokemon to place ${MARK_LABELS[xIsNext ? 'pokeball' : 'premierball']}.`);
    } finally {
      setIsRevealing(false);
    }
  }

  useEffect(() => {
    if (!pendingGuess) {
      if (turnTimeLeft !== TURN_TIME_LIMIT) {
        setTurnTimeLeft(TURN_TIME_LIMIT);
      }

      return;
    }

    if (turnTimeLeft <= 0) {
      passTurn('Time ran out. Turn passes to the next player.');
      return;
    }

    const timerId = globalThis.setTimeout(() => {
      setTurnTimeLeft((current) => current - 1);
    }, 1000);

    return () => globalThis.clearTimeout(timerId);
  }, [pendingGuess, turnTimeLeft]);

  useEffect(() => {
    if (difficulty === 'local' || pendingGuess || isRevealing || calculateWinner(currentSquares) || !isAiTurn) {
      return;
    }

    const nextSquareIndex = getRandomEmptySquare(currentSquares);

    if (nextSquareIndex === null) {
      return;
    }

    const timerId = globalThis.setTimeout(() => {
      void handleSquareClick(nextSquareIndex, true);
    }, 700);

    return () => globalThis.clearTimeout(timerId);
  }, [difficulty, pendingGuess, isRevealing, currentSquares, isAiTurn]);

  useEffect(() => {
    if (difficulty === 'local' || !pendingGuess || pendingIndex === null || xIsNext) {
      return;
    }

    const aiGuess = getAiGuess(pendingGuess.name);
    const timerId = globalThis.setTimeout(() => {
      submitGuess(aiGuess);
    }, 1200);

    return () => globalThis.clearTimeout(timerId);
  }, [difficulty, pendingGuess, pendingIndex, xIsNext, pokemonNames]);

  useEffect(() => {
    if (celebratedIndex === null) {
      return;
    }

    const timerId = globalThis.setTimeout(() => {
      setCelebratedIndex(null);
    }, 900);

    return () => globalThis.clearTimeout(timerId);
  }, [celebratedIndex]);

  function normalizeGuess(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function submitGuess(guessValue: string) {
    if (!pendingGuess || pendingIndex === null) {
      return;
    }

    if (normalizeGuess(guessValue) !== normalizeGuess(pendingGuess.name)) {
      passTurn(`Incorrect — turn passes to next player (${MARK_LABELS[xIsNext ? 'premierball' : 'pokeball']}).`);
      return;
    }

    const placedMark: Mark = xIsNext ? 'pokeball' : 'premierball';
    const nextSquares = currentSquares.slice();
    nextSquares[pendingIndex] = placedMark;

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
    setTurnTimeLeft(TURN_TIME_LIMIT);
    setCelebratedIndex(pendingIndex);

    if (calculateWinner(nextSquares) === placedMark) {
      setScores((previous) => ({
        ...previous,
        [placedMark]: previous[placedMark] + 1,
      }));
    }
  }

  function handleGuessSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitGuess(guess);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((_squares, move) => {
    const description = move > 0 ? 'Go to move #' + move : 'Start new game!';

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
          <label className="p-1">
            <input type="radio" name="difficulty" value="local" checked={difficulty === 'local'} onChange={() => setDifficulty('local')} /> Local
          </label>
          <label className="p-1">
            <input type="radio" name="difficulty" value="easy" checked={difficulty === 'easy'} onChange={() => setDifficulty('easy')} /> Easy Ai
          </label>
          <label className="p-2">
            <input type="radio" name="difficulty" value="medium" checked={difficulty === 'medium'} onChange={() => setDifficulty('medium')} /> Medium Ai
          </label>
          <label className="p-2">
            <input type="radio" name="difficulty" value="hard" checked={difficulty === 'hard'} onChange={() => setDifficulty('hard')} /> Hard Ai
          </label>
        </div>

        <div className="w-full max-w-fit justify-self-center border-red1 border-4 bg-black2/70 flex justify-center items-center flex-col rounded-lg shadow-lg p-8 mb-12 mt-8 text-white text-2xl font-bold pb">
          <div className="text-white text-2xl font-bold mb-4">Game Board</div>
          <div className="mb-4 grid gap-2 text-sm font-semibold text-gray-200 sm:grid-cols-3">
            <div>Pokeball score: {scores.pokeball}</div>
            <div>Premierball score: {scores.premierball}</div>
            <div>Turn time left: {turnTimeLeft}s</div>
          </div>
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            pokemonPreviews={pokemonPreviews}
            pendingIndex={pendingIndex}
            celebratedIndex={celebratedIndex}
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
                  list="pokemon-name-suggestions"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <button type="submit" className="rounded-md bg-red1 px-4 py-2 font-semibold text-white">
                  Place
                </button>
              </div>
              <datalist id="pokemon-name-suggestions">
                {pokemonNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {guessMessage ? <p className="mt-2 text-sm text-gray-300">{guessMessage}</p> : null}
            </form>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <button type="button" onClick={() => resetBoard(true)} className="rounded-md border border-gray-400 px-4 py-2 text-white">
              Play Again
            </button>
            <button type="button" onClick={() => resetBoard(false)} className="rounded-md bg-red1 px-4 py-2 text-white">
              New Game
            </button>
          </div>
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
