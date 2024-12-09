import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_USER } from "../../utils/queries";

interface SetPlayerModalProps {
	onSetPlayer: (player: number, username: string) => void;
	playerNum: number;
}

const SetPlayerModal: React.FC<SetPlayerModalProps> = ({
	onSetPlayer,
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
    console.log(data);
    if (data && data.user) {
      onSetPlayer(playerNum, playerName); // Call the parent function if user exists
      setError("User found!");
    } else if (data && !data.user) {
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
				/>
			</form>
			{error && <p className="error">{error}</p>}
		</div>
	);
};

export default SetPlayerModal;
