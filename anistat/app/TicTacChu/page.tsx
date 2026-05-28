'use client';

import { useState } from 'react';

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
}
export default function Game() {
  const [boardSize, setBoardSize] = useState(() => {
    if (typeof globalThis === 'undefined') {
      return 3;
    }

    const savedBoardSize = globalThis.localStorage?.getItem('ticTacChuBoardSize');
    const parsedBoardSize = savedBoardSize ? Number(savedBoardSize) : 3;

    return [3, 4, 5].includes(parsedBoardSize) ? parsedBoardSize : 3;
  });
  const [history, setHistory] = useState([Array(boardSize * boardSize).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function changeBoardSize(nextBoardSize: number) {
    setBoardSize(nextBoardSize);
    setHistory([Array(nextBoardSize * nextBoardSize).fill(null)]);
    setCurrentMove(0);

    if (globalThis.localStorage) {
      globalThis.localStorage.setItem('ticTacChuBoardSize', String(nextBoardSize));
    }
  }


function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button
      type="button"
      onClick={onSquareClick}
      style={{
        width: 80,
        height: 80,
        border: '2px solid white',
        fontSize: 32,
        color: 'white',
      }}
    >
      {value}
    </button>
  );
}


interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[]) => void;
}

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  } if  (!squares.includes(null)) {
    status = 'It\'s a draw!';
  }

  return (
    <div>
      <div className="text-white text-xl font-bold mb-4">{status}</div>
      <div
  className="grid gap-2 mx-auto"
  style={{
    gridTemplateColumns: `repeat(${boardSize}, 80px)`
  }}
>
        {squares.map((value, i) => (
          <Square key={i} value={value} onSquareClick={() => handleClick(i)} />
        ))}
      </div>
    </div>
  );
}



  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((_squares: (string | null)[], move: number) => {
    let description: string;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button type="button" onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  

  return (
    <div className="bg-cover bg-[url('/red%20and%20black.png')] min-h-screen">
      <header className="bg-black1 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-24"></div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start text-white">

        <div className="w-full max-w-md border-red1 border-4 bg-black2/70 rounded-lg shadow-lg p-8 mb-12 mt-8 lg:justify-self-start">
          <h1 className='text-white text-2xl font-bold'>Game Settings</h1>
          <h5 className='text-gray-300 text-lg font-semibold'>Change Board Size</h5>
         
          <p>
        
        <label className='p-1'>
                <input
                  type="radio"
                  name="myRadio"
                  value="3"
                  checked={boardSize === 3}
                  onChange={() => changeBoardSize(3)}
                  
                  
                /> 3x3
              </label>
              <label className='p-2'>
                <input
                  type="radio"
                  name="myRadio"
                  value="4"
                  checked={boardSize === 4}
                  onChange={() => changeBoardSize(4)}
                /> 4x4
              </label>
              <label className='p-2'>
                <input
                  type="radio"
                  name="myRadio"
                  value="5"
                  checked={boardSize === 5}
                  onChange={() => changeBoardSize(5)}
                /> 5x5
              </label>
      </p>

      <h5 className='text-gray-300 text-lg font-semibold'>Change Difficulty</h5>
      <label className='p-1'><input type="radio" name="myRadio2" value="option1" defaultChecked /> Local</label>
      <label className='p-1'><input type="radio" name="myRadio2" value="option1" /> Easy Ai</label>
      <label className='p-2'><input type="radio" name="myRadio2" value="option2"  /> Medium Ai</label>
      <label className='p-2'><input type="radio" name="myRadio2" value="option3" /> Hard Ai</label>

        </div>
        
        <div className="w-full max-w-fit justify-self-center border-red1 border-4 bg-black2/70 flex justify-center items-center flex-col rounded-lg shadow-lg p-8 mb-12 mt-8 text-white text-2xl font-bold pb">
       
        <div className="text-white text-2xl font-bold mb-4"> Game Board </div>
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          />
         
          </div>
           <div className="w-full max-w-md border-red1 border-4 bg-black2/70 rounded-lg shadow-lg p-8 mb-12 mt-8 lg:justify-self-end">

          <div className="text-white text-xl font-bold mt-8 mb-4">Game History</div>
        <ol className="mt-6 text-white">{moves}</ol>
          </div>
      </main>
    </div>
  );
}


function calculateWinner(squares: (string | null)[]) {
  const size = Math.sqrt(squares.length);
  const lines: number[][] = [];

  // rows
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    lines.push(row);
  }

  // columns
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) {
      col.push(r * size + c);
    }
    lines.push(col);
  }

  // diagonal top-left → bottom-right
  lines.push(Array.from({ length: size }, (_, i) => i * (size + 1)));

  // diagonal top-right → bottom-left
  lines.push(Array.from({ length: size }, (_, i) => (i + 1) * (size - 1)));

  for (const line of lines) {
    const first = squares[line[0]];
    if (!first) continue;

    if (line.every(i => squares[i] === first)) {
      return first;
    }
  }

  return null;
}
  

