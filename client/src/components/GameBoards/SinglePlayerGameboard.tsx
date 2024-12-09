import React, { useEffect, useState } from "react";
import WinnerModal from "../WinnerModal";
import SetPlayerModal from "../SetPlayerModal";

const SinglePlayerGameBoard: React.FC = () => {
	const [gamestart, setGameStart] = useState<boolean>(false);
	const [player1, setPlayer1] = useState<string>("");
	const [player2, setPlayer2] = useState<string>("");

	// standard connect 4 size
	const rows: number = 6;
	const cols: number = 7;

	const [board, setBoard] = useState<(null | "Red" | "Yellow")[][]>(
		Array.from({ length: rows }, () => Array(cols).fill(null))
	);
	const [currentPlayer, setCurrentPlayer] = useState<"Red" | "Yellow">("Red");

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
						handleGameEnd(`${currentPlayer}`);
						// switches player
					} else {
						setCurrentPlayer(currentPlayer === "Red" ? "Yellow" : "Red");
					}
				}, 100);

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

	const handleGameEnd = (winningPlayer: string) => {
		setWinner(winningPlayer);
	};

	const handleCloseWinnerModal = () => {
		setWinner(null);
		resetGame();
	};

	const handleSetPlayer = (player:number, username:string) => {
		if (player == 1)
			setPlayer1(username);
		else if (player == 2)
			setPlayer2(username);
	}

	useEffect(() => {
		// if both players are set, start the game
		if (player1 && player2)
			setGameStart(true);
	},[player1,player2]);

	return (
		<>
			{gamestart ? (
				<div className="game-container">
					<div>
						Current Player:{" "}
						<span className={currentPlayer.toLowerCase()}>{currentPlayer == "Red" ? player1 : player2}</span>
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
					<WinnerModal winner={winner} onClose={handleCloseWinnerModal} />
				</div>
			) : (
				<>
					<h2>Starting Game...</h2>
					<SetPlayerModal playerNum={1} onSetPlayer={handleSetPlayer} />
					<SetPlayerModal playerNum={2} onSetPlayer={handleSetPlayer} />
				</>
			)}
		</>
	);
};

export default SinglePlayerGameBoard;
