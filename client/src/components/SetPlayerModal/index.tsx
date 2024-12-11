import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_USER } from "../../utils/queries";

// Define the input type for the update
interface UserProfile {
	username?: string;
	email?: string;
	password?: string;
	games_played?: number;
	games_won?: number;
	games_lost?: number;
}

interface SetPlayerModalProps {
	onSetPlayer: (player: number, username: string, data: UserProfile) => void;
	nameValue?: string;
	playerNum: number;
}

const SetPlayerModal: React.FC<SetPlayerModalProps> = ({
	onSetPlayer,
	nameValue = "",
	playerNum,
}) => {
	const [playerName, setPlayerName] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const { data } = useQuery(QUERY_USER, {
		variables: { username: playerName }, // Pass the username as a variable
		onError: () => {
			setError("An error occurred while searching for the user.");
		},
	});

	useEffect(() => {
		if (nameValue !== "") {
			setPlayerName(nameValue);
		}
	}, [nameValue]);

	useEffect(() => {
		if (data && data.user) {
			onSetPlayer(playerNum, playerName, data.user); // Call the parent function if user exists
			setError("User found!");
		} else if (data && !data.user) {
			onSetPlayer(playerNum, "", {});
			setError("User not found. Please try a different username.");
		}
	}, [data]);

	return (
		<div className="">
			<form>
				<input
					type="text"
					value={playerName}
					onChange={(e) => setPlayerName(e.target.value)}
					placeholder={"Enter Player " + playerNum + " username"}
					readOnly={nameValue? true : false}
				/>
			</form>
			{error && <p className="error">{error}</p>}
		</div>
	);
};

export default SetPlayerModal;
