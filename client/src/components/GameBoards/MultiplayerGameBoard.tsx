import React, { useState, useEffect } from "react";
import WinnerModal from "../WinnerModal";
import { useSocket } from "../../context/SocketContext";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_USER } from "../../utils/queries";

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
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [roomUsernames, setUsernames] = useState<string[]>([]);
  const [isMoveInProgress, setIsMoveInProgress] = useState(false);
  const [gameStart, setGameStart] = useState<boolean>(false);
  const [player1Username, setPlayer1Username] = useState<string>("");
  const [player1GamesPlayed, setPlayer1GamesPlayed] = useState<number>();
  const [player1GamesWon, setPlayer1GamesWon] = useState<number>();
  const [player1GamesLost, setPlayer1GamesLost] = useState<number>();
  const [player2Username, setPlayer2Username] = useState<string>("");
  const [player2GamesPlayed, setPlayer2GamesPlayed] = useState<number>();
  const [player2GamesWon, setPlayer2GamesWon] = useState<number>();
  const [player2GamesLost, setPlayer2GamesLost] = useState<number>();

  const player1Query = useQuery(QUERY_USER, {
    variables: { username: roomUsernames[0] },
    skip: roomUsernames.length < 2,
  });

  const player2Query = useQuery(QUERY_USER, {
    variables: { username: roomUsernames[1] },
    skip: roomUsernames.length < 2,
  });

  useEffect(() => {
    const { data: player1Data } = player1Query;
    // const { data: player2Data } = player2Query;
    if (player1Data) {
      setPlayer1Username(player1Data.user.username);
      setPlayer1GamesPlayed(player1Data.user.games_played);
      setPlayer1GamesWon(player1Data.user.games_won);
      setPlayer1GamesLost(player1Data.user.games_lost);
      console.log("Player 1 stats:", player1Data);
    }
  }, [player1Query]);

  useEffect(() => {
    const { data: player2Data } = player2Query;
    // const { data: player2Data } = player2Query;
    if (player2Data) {
      setPlayer2Username(player2Data.user.username);
      setPlayer2GamesPlayed(player2Data.user.games_played);
      setPlayer2GamesWon(player2Data.user.games_won);
      setPlayer2GamesLost(player2Data.user.games_lost);
      console.log("Player 2 stats:", player2Data);
    }
  }, [player2Query]);

  useEffect(() => {
    socket?.on("roomData", ({ players, currentPlayer, usernames }) => {
      // setInviteCode(inviteCode);
      setPlayers(players); // Update the players in the room
      setCurrentPlayer(currentPlayer); // Set the current player
      setUsernames(usernames);
      setIsMyTurn(socket.id === players[0]); // first player is "Red"
    });

    socket?.on("playerTurn", (nextPlayer) => {
      setCurrentPlayer(nextPlayer); // Update the current player
      setIsMyTurn(nextPlayer); // Update turn state based on the next player
    });

    socket?.on("startGame", () => {
      // Determine if it's the player's turn based on their ID
      setCurrentPlayer("Red");
      setGameStart(true);
    });

    socket?.on("updateBoard", (newBoard) => {
      setBoard(newBoard); // Update the board with the new state from the server
    });

    socket?.on("notYourTurn", ({ message }) => {
      alert(message); // Notify the player that it's not their turn
    });

    socket?.on("gameOver", (winner) => {
      setWinner(winner); // Set the winner state
    });

    return () => {
      // socket?.off("roomData");
      socket?.off("startGame");
      socket?.off("updateBoard");
      socket?.off("notYourTurn");
      socket?.off("gameOver");
      socket?.off("playerTurn");
    };
  }, [socket, roomId]);

  function highlightColumn(colIndex: number, add: boolean): void {
		const cells = document.querySelectorAll(".cell");
		cells.forEach((cell, index) => {
			if (index % 7 === colIndex) { // Assuming 7 columns
				add ? cell.classList.add("highlight") : cell.classList.remove("highlight");
			}
		});
	}

	document.querySelectorAll(".cell").forEach((cell, index) => {
		const col = index % 7; // Get column index
		cell.addEventListener("mouseenter", () => highlightColumn(col, true));
		cell.addEventListener("mouseleave", () => highlightColumn(col, false));
	});
  
  function handleMove(col: number): void {
    if (!isMyTurn) {
      alert("NOT YOUR TURN");
      return;
    } else {
      // finds lowest available row
      if (isMoveInProgress || winner) return;
      for (let r = rows - 1; r >= 0; r--) {
        if (!board[r][col]) {
          // board[r][col] = currentPlayer;
          const cell = document.querySelector(
            `.game-board .cell:nth-child(${r * cols + col + 1})`
          );
          if (cell) {
            const chip = document.createElement("div");
            chip.className = `chip ${currentPlayer.toLowerCase()}`;

            const gameBoard = document.querySelector(".game-board");
            if (gameBoard) {
              const gameBoardRect = gameBoard.getBoundingClientRect();
              const cellRect = (cell as HTMLElement).getBoundingClientRect();

              chip.style.left = `${cellRect.left - gameBoardRect.left}px`; // Horizontal alignment

              const gameContainer = document.querySelector(".game-board");
              if (gameContainer) {
                gameContainer.appendChild(chip);

                setIsMoveInProgress(true);
                setTimeout(() => {
                  chip.style.top = `${cellRect.top - gameBoardRect.top}px`; // Move to the correct row
                  chip.style.left = `${cellRect.left - gameBoardRect.left}px`; // Align horizontally
                }, 0);

                chip.addEventListener("animationend", () => {
                  gameContainer.removeChild(chip);
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
                      const currentPlayerIndex = players.indexOf(
                        String(socket?.id)
                      );
                      // Calculate the index of the next player
                      const nextPlayerIndex =
                        (currentPlayerIndex + 1) % players.length;
                      const nextPlayerSocketId = players[nextPlayerIndex];
                      // Update the current player
                      setCurrentPlayer(
                        nextPlayerSocketId === players[0] ? "Red" : "Yellow"
                      );
                      setIsMyTurn(nextPlayerSocketId === socket?.id);
                    }
                    setIsMoveInProgress(false);
                  }, 100);
                });
              }
            }
          }
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
    // setCurrentPlayer("Red");
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
    <>
      {!gameStart ? (
        <div className="text-center">
          <h1>Invite Code: {roomId}</h1>
        </div>
      ) : (
        <div>
          <div>
            <h1 className="current-move">
              Current Move:{" "}
              <span className={currentPlayer.toLowerCase()}>
                {currentPlayer == "Red" ? roomUsernames[0] : roomUsernames[1]}
              </span>
            </h1>
          </div>
          <div className="game-container">
            <div className="in-game-profile-p1">
              <div className="card-title-p1">
                <h3 className="igp-card-items">{player1Username}</h3>
              </div>
              <p className="igp-card-items">Games Played: {player1GamesPlayed}</p>
              <p className="igp-card-items">Wins: {player1GamesWon}</p>
              <p className="igp-card-items">Losses: {player1GamesLost}</p>
            </div>
            <div>
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
              <WinnerModal
                winner={winner}
                playerName={
                  winner == "Red" ? roomUsernames[0] : roomUsernames[1]
                }
                onClose={handleCloseModal}
              />
            </div>
            <div>
							<div className="in-game-profile-p2">
								<div className="card-title-p2">
									<h3 className="igp-card-items">{player2Username}</h3>
								</div>
								<p className="igp-card-items">Games Played: {player2GamesPlayed}</p>
								<p className="igp-card-items">Wins: {player2GamesWon}</p>
								<p className="igp-card-items">Losses: {player2GamesLost}</p>
							</div>
						</div>
          </div>
        </div>
      )}
    </>
  );
};
export default MultiplayerGameBoard;
