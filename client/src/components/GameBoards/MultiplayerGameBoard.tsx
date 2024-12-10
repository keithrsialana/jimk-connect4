import React, { useState, useEffect } from "react";
import WinnerModal from "../WinnerModal";
import { useSocket } from "../../context/SocketContext";
import { useParams } from "react-router-dom";

const MultiplayerGameBoard: React.FC = () => {
  const socket = useSocket();
  const { roomId } = useParams();

  // standard connect 4 size
  const rows: number = 6;
  const cols: number = 7;

  const [board, setBoard] = useState<(null | "Red" | "Yellow")[][]>(
    Array.from({ length: rows }, () => Array(cols).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<"Red" | "Yellow">("Red");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    socket?.on("roomData", ({ players, currentPlayer }) => {
      setPlayers(players); // Update the players in the room
      setCurrentPlayer(currentPlayer); // Set the current player
      setIsMyTurn(socket.id === players[0]); // first player is "Red"
    });

    socket?.on("playerTurn", (nextPlayer) => {
      setCurrentPlayer(nextPlayer); // Update the current player
      setIsMyTurn(nextPlayer); // Update turn state based on the next player
    });

    socket?.on("startGame", ({ players }) => {
      // Determine if it's the player's turn based on their ID
      const playerColor = players[0] === socket.id ? "Red" : "Yellow";
      setCurrentPlayer(playerColor);
      setIsMyTurn(playerColor == "Red"); // The creator is Red
      console.log("game started");
    });

    socket?.on("updateBoard", (newBoard) => {
      setBoard(newBoard); // Update the board with the new state from the server
    });

    socket?.on("notYourTurn", ({ message }) => {
      alert(message); // Notify the player that it's not their turn
    });

    socket?.on("gameOver", (winner) => {
      alert(`${winner} wins!`); // Notify players of the game over
      setWinner(winner); // Set the winner state
    });

    return () => {
      socket?.off("startGame");
      socket?.off("updateBoard");
      socket?.off("notYourTurn");
      socket?.off("gameOver");
      socket?.off("playerTurn");
    };
  }, [socket, roomId]);

  function handleMove(col: number): void {
    if (!isMyTurn) {
      alert("NOT YOUR TURN");
      return;
    } else {
      // finds lowest available row
      for (let r = rows - 1; r >= 0; r--) {
        if (!board[r][col]) {
          // board[r][col] = currentPlayer;
          const newBoard = board.map((row) => [...row]);
          newBoard[r][col] = currentPlayer;

          socket?.emit("makeMove", {
            roomId,
            column: col,
            player: currentPlayer,
          });

          setBoard(newBoard);

          setTimeout(() => {
            if (checkWinner(newBoard, r, col)) {
              handleGameEnd(`${currentPlayer}`);
              // switches player
            } else {
              const currentPlayerIndex = players.indexOf(String(socket?.id));
              // Calculate the index of the next player
              const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
              const nextPlayerSocketId = players[nextPlayerIndex];
              // Update the current player
              setCurrentPlayer(
                nextPlayerSocketId === players[0] ? "Red" : "Yellow"
              );
              setIsMyTurn(nextPlayerSocketId === socket?.id);
              console.log(`current player: ${nextPlayerSocketId}`);
            }
          }, 100);

          return;
        }
      }
    }
    alert("Column is full");
  }

  const checkWinner = (
    board: (null | "Red" | "Yellow")[][],
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
    board: (null | "Red" | "Yellow")[][],
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
    setCurrentPlayer("Red");
  };

  const [winner, setWinner] = useState<string | null>(null);

  const handleGameEnd = (winningPlayer: string) => {
    setWinner(winningPlayer);
  };

  const handleCloseModal = () => {
    setWinner(null);
    resetGame();
  };

  return (
    <div className="game-container">
      <div>
        Current Player:{" "}
        <span className={currentPlayer.toLowerCase()}>{currentPlayer}</span>
      </div>
      <div className="game-board">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`cell ${cell?.toLowerCase() || ""}`}
              onClick={() => handleMove(c)}
            ></div>
          ))
        )}
      </div>
      <button className="btn btn-danger" onClick={resetGame}>
        Restart Game
      </button>
      <WinnerModal winner={winner} playerName={socket ? '' : ''} onClose={handleCloseModal} />
    </div>
  );
};

export default MultiplayerGameBoard;