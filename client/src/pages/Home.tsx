import { useEffect, type MouseEvent } from "react";
import Auth from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import {} from "react";

const Home = () => {
	const navigate = useNavigate();

	// if user isn't logged in, forcefully push user to login page
	useEffect(() => {
		if (!Auth.loggedIn()) navigate("/login");
	}, []);

	const logout = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		// Logs the user out by calling the logout method from Auth
		Auth.logout();
	};

	return (
		<main>
			<div className="flex-column justify-center align">
				<Link to="/game" className="btn btn-primary py-3">
					Local 1v1
				</Link>
				<Link to="" className="btn btn-primary mt-2 py-3">
					Create a room
				</Link>
				<Link to="" className="btn btn-primary mt-2 py-3">
					Join a room
				</Link>
				<Link to="" className="btn btn-primary mt-2 py-3">
					Join a random room
				</Link>
				<Link to="/me" className="btn btn-primary mt-2 py-3">
					View your profile
				</Link>
				<button className="btn btn-danger mt-2 py-3" onClick={logout}>
					Logout
				</button>
			</div>
		</main>
	);
};

export default Home;
