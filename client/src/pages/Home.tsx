import { useEffect, useState, type MouseEvent } from "react";
import Auth from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import InviteModal from "../components/InviteModal/InviteModal";
import {} from "react";
import { useSocket } from "../context/SocketContext";

const Home = () => {
  const navigate = useNavigate();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const socket = useSocket();

  // if user isn't logged in, forcefully push user to login page
  useEffect(() => {
    if (!Auth.loggedIn()) navigate("/login");
  }, []);

  socket?.on('roomCreated', ({ roomId }) => {
	navigate(`/game/${roomId}`);
  });

  socket?.on('roomJoined', ({ roomId }) => {
	navigate(`/game/${roomId}`);
  })

  socket?.on('roomNotFound', (inviteCode) => {
	alert(`Room with invite code ${inviteCode} not found.`);
  });

  const handleCreateRoom = () => {
    const myUsername = Auth.getProfile().data.username;
	  socket?.emit('createRoom', myUsername);
  }

  const logout = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Logs the user out by calling the logout method from Auth
    Auth.logout();
  };

  const openInviteModal = () => {
    setIsInviteModalOpen(true); // Open the modal
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false); // Close the modal
  };

  return (
    <main>
      <div className="flex-column justify-center align min-75-vh">
        <Link to="/game" className="btn btn-primary py-3">
          Local 1v1
        </Link>
        <Link to="" onClick={handleCreateRoom} className="btn btn-primary mt-2 py-3">
          Create a room
        </Link>
        <Link
          to=""
          className="btn btn-primary mt-2 py-3"
          onClick={openInviteModal}
        >
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
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={closeInviteModal}
        ></InviteModal>
      </div>
    </main>
  );
};

export default Home;
