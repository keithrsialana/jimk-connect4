import React, { useState, useEffect, useRef } from "react";
import WinnerModal from "../WinnerModal";
import { useSocket } from "../../context/SocketContext";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_USER } from "../../utils/queries";
import { UPDATE_GAME_STATS } from "../../utils/mutations"; // Ensure this mutation is imported
import { useMutation } from "@apollo/client";

// Define the input type for the update
interface UserProfile {
  _id?: number;
  username?: string;
  email?: string;
  games_played?: number;
  games_won?: number;
  games_lost?: number;
}

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
  // Game statistics
  const [updateGameStats] = useMutation(UPDATE_GAME_STATS);

  const [player1Data, setPlayer1Data] = useState<UserProfile>();
  const [player2Data, setPlayer2Data] = useState<UserProfile>();
  // const [player1Data, setPlayer1Data] = useState({
  //   username: "",
  //   gamesPlayed: 0,
  //   wins: 0,
  //   losses: 0
  // });
  // const [player2Data, setPlayer2Data] = useState({
  //   username: "",
  //   gamesPlayed: 0,
  //   wins: 0,
  //   losses: 0
  // });

  const player1Query = useQuery(QUERY_USER, {
    variables: { username: roomUsernames[0] },
    skip: roomUsernames.length < 2,
  });

  const player2Query = useQuery(QUERY_USER, {
    variables: { username: roomUsernames[1] },
    skip: roomUsernames.length < 2,
  });

  useEffect(() => {
    const { data: player1DBData } = player1Query;
    if (player1DBData) {
      setPlayer1Data({
        _id: player1DBData.user._id,
        username: player1DBData.user.username,
        email: player1DBData.user.email,
        games_played: player1DBData.user.games_played,
        games_won: player1DBData.user.games_won,
        games_lost: player1DBData.user.games_lost,
      });
    }
  }, [player1Query]);

  useEffect(() => {
    const { data: player2DBData } = player2Query;
    if (player2DBData) {
      console.log("check the id first:" + player2DBData._id)
      setPlayer2Data({
        _id: player2DBData.user._id,
        username: player2DBData.user.username,
        email: player2DBData.user.email,
        games_played: player2DBData.user.games_played,
        games_won: player2DBData.user.games_won,
        games_lost: player2DBData.user.games_lost,
      });
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

    socket?.on("gameOver", async (winner) => {
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
      if (index % 7 === colIndex) {
        // Assuming 7 columns
        add
          ? cell.classList.add("highlight")
          : cell.classList.remove("highlight");
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
      alert("BRO STOP 😠 IT'S NOT YOUR TURN");
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
    statsUpdatedRef.current = false;
  };

  const [winner, setWinner] = useState<string | null>(null);

  const handleGameEnd = (winningPlayer: string) => {
     setWinner(winningPlayer);
  };

  const handleCloseModal = () => {
    setWinner(null);
    resetGame();
  };

  const statsUpdatedRef = useRef(false);

  useEffect(() => {
    // Ensure player profiles are available and valid
    if (player1Data && player2Data && winner !== null && !statsUpdatedRef.current) {
      const updatePlayerStats = (playerProfile: any, isWinner: any) => {
        const gamesPlayed = playerProfile.games_played + 1;
        const gamesWon = isWinner
          ? playerProfile.games_won + 1
          : playerProfile.games_won;
        const gamesLost = isWinner
          ? playerProfile.games_lost
          : playerProfile.games_lost + 1;
  
        return {
          _id: playerProfile._id,
          username: playerProfile.username,
          email: playerProfile.email,
          games_played: gamesPlayed,
          games_won: gamesWon,
          games_lost: gamesLost,
        };
      };
  
      const player1Stats = updatePlayerStats(
        player1Data,
        winner === "Red"
      );
      const player2Stats = updatePlayerStats(
        player2Data,
        winner === "Yellow"
      );
  
      setPlayer1Data(player1Stats);
      setPlayer2Data(player2Stats);
      
      console.log("checking the id " + JSON.stringify(player1Data._id));
  
      // Function to update player stats and handle errors
      const updateStats = async (stats: any, playerNumber: any) => {
        try {
          await updateGameStats({
            variables: { input: stats },
            refetchQueries: [
              {
                query: QUERY_USER,
                variables: { username: stats.username },
              },
            ],
          });
        } catch (error: any) {
          console.error(
            `Error updating Player ${playerNumber}: ${
              error.graphQLErrors[0]?.message || error.message
            }`
          );
        }
      };
  
      // Create an async function to handle the updates
      const updatePlayerStatsAsync = async () => {
        await updateStats(player1Stats, 1);
        await updateStats(player2Stats, 2);
        statsUpdatedRef.current = true;
      };
  
      // Call the async function
      updatePlayerStatsAsync();
    }
  }, [winner]);

  return (
    <>
      {!gameStart ? (
        <div className="text-center min-75-vh">
          <h1>Invite Code: {roomId}</h1>
        </div>
      ) : (
        <div>
          <div className="game-mode-title-bg">
            <h1 className="game-mode-title">Multiplayer Game</h1>
          </div>
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
                <h3 className="igp-card-items">{player1Data?.username}</h3>
              </div>
              <p className="igp-card-items">
                Games Played: {player1Data?.games_played}
              </p>
              <p className="igp-card-items">Wins: {player1Data?.games_won}</p>
              <p className="igp-card-items">
                Losses: {player1Data?.games_lost}
              </p>
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
                currentPlayer={players[0] === socket?.id ? "Red" : "Yellow"}
              />
            </div>
            <div>
              <div className="in-game-profile-p2">
                <div className="card-title-p2">
                  <h3 className="igp-card-items">{player2Data?.username}</h3>
                </div>
                <p className="igp-card-items">
                  Games Played: {player2Data?.games_played}
                </p>
                <p className="igp-card-items">Wins: {player2Data?.games_won}</p>
                <p className="igp-card-items">
                  Losses: {player2Data?.games_lost}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MultiplayerGameBoard;
