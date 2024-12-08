const GameBoard: React.FC = () => {
    
    // standard connect 4 size
const rows: number = 6;
const cols: number = 7;

let currentPlayer: "red" | "yellow" = "red";
let board: (null | "red" | "yellow")[][] = Array(rows).fill(null)
    .map(() => Array(cols).fill(null));

function createBoard(): void {
    const gameBoard = document.getElementById("game-board");
    if (!gameBoard) {
        throw new Error("NO GAMEBOARD");
    }

    gameBoard.innerHTML = "";
    // creating game board on dom
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell: HTMLDivElement = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r.toString();
            cell.dataset.col = c.toString();
            cell.addEventListener("click", handleMove);
            gameBoard.appendChild(cell)
        }
    }
}

function updateCurrentPlayer(): void {
    const playerIndicator = document.getElementById("current-player");
    if (playerIndicator) {
        playerIndicator.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase()}${currentPlayer.slice(1)}`
    }
}

function handleMove(event: MouseEvent): void {
    const target = event.target as HTMLDivElement;
    // getting column number
    const col: number = parseInt(target.dataset.col || "0", 10);

    // finds lowest available row
    for (let r = rows - 1; r >= 0; r--) {
        if (!board[r][col]) {
            board[r][col] = currentPlayer;
            const cell: HTMLDivElement | null = document.querySelector(
                `.cell[data-row='${r}'][data-col='${col}']`
            );
            // updates cell with game piece
            if (cell) {
                cell.classList.add(currentPlayer);
            }

            if (checkWinner(r, col)) {
                alert(`${currentPlayer} wins!`);
                resetGame();
            // switches player 
            } else {
                currentPlayer = currentPlayer === "red" ? "yellow" : "red";
                updateCurrentPlayer();
            }
            return;
        }
    }
    alert("Column is full");
}

function checkWinner(row: number, col: number): boolean {
    const directions = [
        { dr: -1, dc: 0 }, // vertical
        { dr: 0, dc: 1 },  // horizontal
        { dr: -1, dc: 1 }, // diagonal right
        { dr: -1, dc: -1 } // diagonal left
    ];

    // loop to find 4 in a row
    for (const { dr, dc } of directions) {
        let count: number = 1;
        count += countDirection(row, col, dr, dc);
        count += countDirection(row, col, -dr, -dc);
        if (count >= 4) return true;
    }
    return false;
}

function countDirection(
    row: number,
    col: number,
    dr: number,
    dc: number
): number {
    let r: number = row + dr;
    let c: number = col + dc;
    let count: number = 0;

    while (
        r >= 0 && r < rows &&
        c >= 0 && c < cols &&
        board[r][c] === currentPlayer
    ) {
        count++;
        r += dr;
        c += dc;
    }
    return count;
}

function resetGame(): void {
    // clear game board
    board = Array(rows).fill(null).map(() => Array(cols).fill(null));
    currentPlayer = "red";
    createBoard();
    updateCurrentPlayer();
}
document.getElementById("restart-button")?.addEventListener("click", resetGame);

    return (
        <div>
            <h2 id="current-player">Current Player: Red</h2>
            <div id="game-board"></div>
            <button id="restart-button" onClick={resetGame}>Restart Game</button>
        </div>
    )

};

export default GameBoard