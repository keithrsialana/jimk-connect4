import React, { useState } from "react";
import WinnerModal from "./WinnerModal";

const GameBoard: React.FC = () => {
	// standard connect 4 size
	const rows: number = 6;
	const cols: number = 7;

	const [board, setBoard] = useState<(null | "Red" | "Yellow")[][]>(
		Array.from({ length: rows }, () => Array(cols).fill(null))
	);
	const [currentPlayer, setCurrentPlayer] = useState<"Red" | "Yellow">("Red");
	const [isMoveInProgress, setIsMoveInProgress] = useState(false);
	const [winner, setWinner] = useState<string | null>(null);

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
		if (isMoveInProgress || winner) return;
		for (let r = rows - 1; r >= 0; r--) {
			if (!board[r][col]) {
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

						const gameContainer = document.querySelector(".game-container");
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

								if (checkWinner(newBoard, r, col)) {
									handleGameEnd(`${currentPlayer}`);
								} else {
									setCurrentPlayer(currentPlayer === "Red" ? "Yellow" : "Red");
								}
								setIsMoveInProgress(false);
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

	const handleGameEnd = (winningPlayer: string) => {
		setWinner(winningPlayer);
	};

	const handleCloseModal = () => {
		setWinner(null);
		resetGame();
		setWinner(null);
		// setIsMoveInProgress(false); // Reset lock
	};

	return (
		<div className="game-container">
			<div className="mt-3">
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
						>
						</div>
					))
				)}
			</div>
			<button className="btn btn-danger button-margin" onClick={resetGame}>
				Restart Game
			</button>
			<WinnerModal winner={winner} onClose={handleCloseModal} />
		</div>
	);
};

export default GameBoard;
