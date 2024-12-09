import { useEffect } from "react";
import Auth from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
	const navigate = useNavigate();

	// if user isn't logged in, forcefully push user to login page
	useEffect(() => {
		if (!Auth.loggedIn()) navigate("/login");
	}, []);

	return (
		<main>
			<div className="flex-column justify-center align">
				<Link to="" className="btn btn-primary py-3">
					Create a room
				</Link>
				<Link to="" className="btn btn-primary mt-2 py-3">
					Join a room
				</Link>
				<Link to="" className="btn btn-primary mt-2 py-3">
          Join a random room
				</Link>
				<Link to="" className="btn btn-primary mt-2 py-3">
					View your profile
				</Link>
			</div>
		</main>
	);
};

export default Home;
