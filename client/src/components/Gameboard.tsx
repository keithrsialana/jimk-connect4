import React, { useState } from "react";

const GameBoard: React.FC = () => {
  // standard connect 4 size
  const rows: number = 6;
  const cols: number = 7;

  const [board, setBoard] = useState<(null | "red" | "yellow")[][]>(
    Array.from({ length: rows }, () => Array(cols).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<"red" | "yellow">("red");

  function handleMove(col: number): void {
    // finds lowest available row
    for (let r = rows - 1; r >= 0; r--) {
      if (!board[r][col]) {
        board[r][col] = currentPlayer;
        const newBoard = board.map((row) => [...row]);
        newBoard[r][col] = currentPlayer;
        setBoard(newBoard);

        setTimeout(() => {
          if (checkWinner(newBoard, r, col)) {
            alert(`${currentPlayer} wins!`);
            resetGame();
            // switches player
          } else {
            setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");
          }
        }, 100);

        return;
      }
    }
    alert("Column is full");
  }

  const checkWinner = (
    board: (null | "red" | "yellow")[][],
    row: number,
    col: number
  ): boolean => {
    const directions = [
      { dr: -1, dc: 0 }, // vertical
      { dr: 0, dc: 1 }, // horizontal
      { dr: -1, dc: 1 }, // diagonal right
      { dr: -1, dc: -1 }, // diagonal left
    ];

    // loop to find 4 in a row
    for (const { dr, dc } of directions) {
      let count = 1;
      count += countDirection(board, row, col, dr, dc);
      count += countDirection(board, row, col, -dr, -dc);
      if (count >= 4) return true;
    }
    return false;
  };

  const countDirection = (
    board: (null | "red" | "yellow")[][],
    row: number,
    col: number,
    dr: number,
    dc: number
  ): number => {
    let r: number = row + dr;
    let c: number = col + dc;
    let count: number = 0;

    while (
      r >= 0 &&
      r < rows &&
      c >= 0 &&
      c < cols &&
      board[r][c] === currentPlayer
    ) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  };

  const resetGame = () => {
    // clear game board
    setBoard(Array.from({ length: rows }, () => Array(cols).fill(null)));
    setCurrentPlayer("red");
  };

  return (
    <div className="game-container">
      <div>
        Current Player: <span className={currentPlayer}>{currentPlayer}</span>
      </div>
      <div className="game-board">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`cell ${cell || ""}`}
              onClick={() => handleMove(c)}
            ></div>
          ))
        )}
      </div>
      <button onClick={resetGame}>Restart Game</button>
    </div>
  );
};

export default GameBoard;
