import SinglePlayerGameBoard from "../components/GameBoards/SinglePlayerGameboard";
import MultiplayerGameBoard from "../components/GameBoards/MultiplayerGameBoard";
import { useParams } from "react-router-dom";

const Game = () => {
    const { roomId } = useParams();

    return (
        <div>
      {roomId ? (
        <MultiplayerGameBoard />
      ) : (
        <SinglePlayerGameBoard />
      )}
    </div>
    )

};

export default Game