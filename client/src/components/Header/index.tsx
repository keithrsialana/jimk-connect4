import { Link } from "react-router-dom";
import Auth from "../../utils/auth";

const Header = () => {

	return (
		<header className="header bg-primary-lighter text-light mb-4 flex-row align-center">
			<div className="container container-fluid flex-row justify-space-between-lg justify-center align-center">
				<div>
					<Link className="text-light" to="/">
						<img src="../public/MainLogo-Light.png" alt="JIMK Connect 4 Logo" />
					</Link>
				</div>

				<div>
					{Auth.loggedIn() ? (
						<>
							<Link className="btn btn-lg btn-info m-2" to="/">
								{/* Retrieving the logged-in user's profile to display the username */}
								Home
							</Link>
						</>
					) : (
						<>
							<Link className="btn btn-lg btn-info m-2" to="/login">
								Login
							</Link>
							<Link className="btn btn-lg btn-light m-2" to="/signup">
								Signup
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
