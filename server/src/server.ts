import express from "express";
import path from "node:path";
import type { Request, Response } from "express";
import db from "./config/connection.js";
import { ApolloServer } from "@apollo/server"; // Note: Import from @apollo/server-express
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from "./utils/auth.js";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const startApolloServer = async () => {
	await server.start();
	await db();

	const PORT = process.env.PORT || 3001;
	const app = express();

	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());

	app.use(
		"/graphql",
		expressMiddleware(server as any, {
			context: authenticateToken as any,
		})
	);

	if (process.env.NODE_ENV === "production") {
		app.use(express.static(path.join(__dirname, "../../client/dist")));

		app.get("*", (_req: Request, res: Response) => {
			res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
		});
	}

	const httpServer = http.createServer(app);
	const io = new Server(httpServer, {
		cors: {
			origin: "https://jimk-connect4.onrender.com",
			methods: ["GET", "POST"],
		},
	});

	const rooms: any = {};

	const generateInviteCode = (length = 6) => {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let inviteCode = "";
		for (let i = 0; i < length; i++) {
			inviteCode += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		return inviteCode;
	};

	const checkWinCondition = (board: any, player: any) => {
		const target = player === "Red" ? "Red" : "Yellow"; // Determine the target color

		// Check horizontal, vertical, and diagonal win conditions
		return (
			checkHorizontal(board, target) ||
			checkVertical(board, target) ||
			checkDiagonal(board, target)
		);
	};

	const checkHorizontal = (board: any, target: any) => {
		for (let row = 0; row < board.length; row++) {
			for (let col = 0; col < board[row].length - 3; col++) {
				if (
					board[row][col] === target &&
					board[row][col + 1] === target &&
					board[row][col + 2] === target &&
					board[row][col + 3] === target
				) {
					return true; // Found a horizontal win
				}
			}
		}
		return false; // No horizontal win found
	};

	const checkVertical = (board: any, target: any) => {
		for (let col = 0; col < board[0].length; col++) {
			for (let row = 0; row < board.length - 3; row++) {
				if (
					board[row][col] === target &&
					board[row + 1][col] === target &&
					board[row + 2][col] === target &&
					board[row + 3][col] === target
				) {
					return true; // Found a vertical win
				}
			}
		}
		return false; // No vertical win found
	};

	const checkDiagonal = (board: any, target: any) => {
		// Check for diagonal wins (bottom-left to top-right)
		for (let row = 3; row < board.length; row++) {
			for (let col = 0; col < board[row].length - 3; col++) {
				if (
					board[row][col] === target &&
					board[row - 1][col + 1] === target &&
					board[row - 2][col + 2] === target &&
					board[row - 3][col + 3] === target
				) {
					return true; // Found a diagonal win
				}
			}
		}

		// Check for diagonal wins (top-left to bottom-right)
		for (let row = 0; row < board.length - 3; row++) {
			for (let col = 0; col < board[row].length - 3; col++) {
				if (
					board[row][col] === target &&
					board[row + 1][col + 1] === target &&
					board[row + 2][col + 2] === target &&
					board[row + 3][col + 3] === target
				) {
					return true; // Found a diagonal win
				}
			}
		}

		return false; // No diagonal win found
	};

	io.on("connection", (socket) => {
		console.log(`user connected: ${socket.id}`);

		socket.on("sendMessage", (message) => {
			io.emit("receiveMessage", message); // Broadcast message to all clients
		});

		// Handle creating a room with a unique ID
		socket.on("createRoom", (hostUsername) => {
			const inviteCode = uuidv4();
			const roomId = generateInviteCode();
			rooms[roomId] = {
				players: [socket.id],
				usernames: [hostUsername],
				roomId,
				turn: "Red",
				board: Array(6)
					.fill(null)
					.map(() => Array(7).fill(null)),
				currentPlayer: "Red",
			};
			socket.join(roomId);
			socket.emit("roomCreated", { roomId, inviteCode });
		});

		socket.on("joinRoom", (inviteCode, myUsername) => {
			const roomId = Object.keys(rooms).find(
				(roomId) => rooms[roomId].roomId === inviteCode
			);
			if (roomId) {
				socket.join(roomId);
				rooms[roomId].players.push(socket.id);
				rooms[roomId].usernames.push(myUsername);
				console.log(
					`Player joined room: ${roomId} with invite code: ${inviteCode}`
				);

				setTimeout(() => {
					io.to(roomId).emit("roomData", {
						roomId,
						usernames: rooms[roomId].usernames,
						players: rooms[roomId].players,
						currentPlayer: rooms[roomId].currentPlayer,
            inviteCode
					});
				}, 1000);

				socket.emit("roomJoined", { roomId });

				if (rooms[roomId].players.length === 2) {
					// Emit start game event to all players in the room
					setTimeout(() => {
						io.to(roomId).emit("startGame", { players: rooms[roomId].players });
					}, 1000);
				}
			} else {
				socket.emit("roomNotFound", inviteCode);
			}
		});

		socket.on("makeMove", ({ roomId, column, player }) => {
			const room = rooms[roomId];
			if (room) {
				// Check if it's the player's turn
				// Strings that only == Red or Yellow
				if (player !== room.currentPlayer) {
					socket.emit("notYourTurn", { message: "It is not your turn!" });
					return;
				}

				// Find the next available row in the specified column
				for (let row = 5; row >= 0; row--) {
					if (!room.board[row][column]) {
						room.board[row][column] = player; // Update the board with the player's move
						io.to(roomId).emit("updateBoard", room.board); // Notify all players of the updated board

						if (checkWinCondition(room.board, player)) {
							io.to(roomId).emit("gameOver", player); // Notify players of the game over
              room.board = Array(6)
              .fill(null)
              .map(() => Array(7).fill(null));
						} else {
							room.currentPlayer = player === "Red" ? "Yellow" : "Red"; // Switch to the next player
							io.to(roomId).emit("playerTurn", room.currentPlayer);
						}
						break;
					}
				}
			}
		});

		socket.on("disconnect", () => {
			console.log("User disconnected:", socket.id);
		});
	});

	httpServer.listen(PORT, () => {
		console.log(`API server running on port ${PORT}!`);
		console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
	});
};

startApolloServer();
