import React, { useEffect, useState } from "react";
import WinnerModal from "../WinnerModal";
import SetPlayerModal from "../SetPlayerModal";
import { useMutation } from "@apollo/client";
import { UPDATE_GAME_STATS } from "../../utils/mutations"; // Ensure this mutation is imported
import Auth from "../../utils/auth";

// Define the input type for the update
interface UserProfile {
	_id?: number;
	username?: string;
	email?: string;
	games_played?: number;
	games_won?: number;
	games_lost?: number;
}

const SinglePlayerGameBoard: React.FC = () => {
	const [gamestart, setGameStart] = useState<boolean>(false);
	const [player1, setPlayer1] = useState<string>("");
	const [player2, setPlayer2] = useState<string>("");
	const [player1Profile, setPlayer1Profile] = useState<UserProfile>();
	const [player2Profile, setPlayer2Profile] = useState<UserProfile>();
	const [isMoveInProgress, setIsMoveInProgress] = useState(false);
	const [gameStartButton, setGameStartButton] = useState<boolean>(false);

	// Game statistics
	const [updateGameStats] = useMutation(UPDATE_GAME_STATS);

	// standard connect 4 size
	const rows: number = 6;
	const cols: number = 7;

	const [board, setBoard] = useState<(null | "Red" | "Yellow")[][]>(
		Array.from({ length: rows }, () => Array(cols).fill(null))
	);
	const [currentPlayer, setCurrentPlayer] = useState<"Red" | "Yellow">("Red");

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
								setBoard(newBoard);

								setTimeout(() => {
									if (checkWinner(newBoard, r, col)) {
										handleGameEnd(`${currentPlayer}`);
										// switches player
									} else {
										setCurrentPlayer(currentPlayer === "Red" ? "Yellow" : "Red");
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

	const handleGameEnd = async (winningPlayer: string) => {
		console.log("The winning player is: " + winningPlayer);

		// Ensure player profiles are available and valid
		if (player1Profile && player2Profile) {
			const updatePlayerStats = (playerProfile: any, isWinner: any) => {
				const gamesPlayed = playerProfile.games_played + 1;
				const gamesWon = isWinner ? playerProfile.games_won + 1 : playerProfile.games_won;
				const gamesLost = isWinner ? playerProfile.games_lost : playerProfile.games_lost + 1;

				console.log(playerProfile._id);
				return {
					_id: playerProfile._id,
					username: playerProfile.username,
					email: playerProfile.email,
					games_played: gamesPlayed,
					games_won: gamesWon,
					games_lost: gamesLost,
				};
			};

			const player1Stats = updatePlayerStats(player1Profile, winningPlayer === "Red");
			const player2Stats = updatePlayerStats(player2Profile, winningPlayer === "Yellow");

			// Function to update player stats and handle errors
			const updateStats = async (stats: any, playerNumber: any) => {
				try {
					await updateGameStats({ variables: { input: stats } });
				} catch (error: any) {
					console.error(`Error updating Player ${playerNumber}: ${error.graphQLErrors[0]?.message || error.message}`);
				}
			};

			// Update both players' stats
			await updateStats(player1Stats, 1);
			await updateStats(player2Stats, 2);
		}
		setWinner(winningPlayer);
	};

	const handleCloseWinnerModal = () => {
		setWinner(null);
		resetGame();
	};


	const handleSetPlayer = (
		player: number,
		username: string,
		playerProfile: UserProfile
	) => {
		if (player == 1) {
			setPlayer1(username);
			setPlayer1Profile(playerProfile);
		} else if (player == 2) {
			setPlayer2(username);
			setPlayer2Profile(playerProfile);
		}
	};

	const handleGameStart = () => {
		setGameStart(true);
	};

	useEffect(() => {
		// if both players are set, start the game
		if (player1 && player2)
			setGameStartButton(true);
	}, [player1, player2]);

	return (
		<>
			{gamestart ? (
				<div>
					<div>
						<h1 className="current-move">
							Current Move:{" "}
							<span className={currentPlayer.toLowerCase()}>{currentPlayer == "Red" ? player1 : player2}</span>
						</h1>
					</div>
					<div className="game-container">
						<div className="in-game-profile-p1">
								<div className="card-title-p1">
									<h3 className="igp-card-items">{player1Profile ? player1Profile.username : "player 1 profile not found"}</h3>
								</div>
								<p className="igp-card-items">Games Played: {player1Profile ? player1Profile.games_played : ""}</p>
								<p className="igp-card-items">Wins: {player1Profile ? player1Profile.games_won : ""}</p>
								<p className="igp-card-items">Losses: {player1Profile ? player1Profile.games_lost : ""}</p>
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
							<button className="btn btn-danger button-margin" onClick={resetGame}>
								Restart Game
							</button>
							<WinnerModal winner={winner} playerName={winner == "Red" ? player1 : player2} onClose={handleCloseWinnerModal} />
						</div>
						<div>
							<div className="in-game-profile-p2">
								<div className="card-title-p2">
									<h3 className="igp-card-items">{player2Profile ? player2Profile.username : "player 2 profile not found"}</h3>
								</div>
								<p className="igp-card-items">Games Played: {player2Profile ? player2Profile.games_played : ""}</p>
								<p className="igp-card-items">Wins: {player2Profile ? player2Profile.games_won : ""}</p>
								<p className="igp-card-items">Losses: {player2Profile ? player2Profile.games_lost : ""}</p>
							</div>
						</div>
					</div>
				</div>
			) : (
				<>
					<h2>Starting Game...</h2>
					<SetPlayerModal playerNum={1} onSetPlayer={handleSetPlayer} nameValue={Auth.getProfile().data.username}/>
					<SetPlayerModal playerNum={2} onSetPlayer={handleSetPlayer} />
					{ gameStartButton ? (
						<button className="btn btn-primary" onClick={handleGameStart}>Start Game</button>
					): (<></>) }
				</>
			)}
		</>
	);
};

export default SinglePlayerGameBoard;