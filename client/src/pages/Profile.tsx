import { Navigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_USER, QUERY_ME } from "../utils/queries";
import { UPDATE_USER } from "../utils/mutations"; // Ensure DELETE_USER is imported
import Auth from "../utils/auth";
import { useState } from "react";

// Define the input type for the update
interface UpdateUser {
  username?: string;
  email?: string;
  password?: string;
}

const Profile = () => {
  const { username: userParam } = useParams();

  const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam },
  });

  const user = data?.me || data?.user || {};

  const [username, setUsername] = useState(""); // New username
  const [email, setEmail] = useState(""); // New email
  const [existingPassword, setExistingPassword] = useState(""); // Existing password for confirmation
  const [newPassword, setNewPassword] = useState(""); // New password
  const [updateUser] = useMutation(UPDATE_USER);

  // This if condition checks if the user is logged in and if the logged-in user's username matches the userParam.
  if (Auth.loggedIn() && Auth.getProfile().data.username === userParam) {
    return <Navigate to="/me" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!Auth.getProfile().data.username) {
    return (
      <h4>
        You need to be logged in to see this. Use the navigation links above to
        sign up or log in!
      </h4>
    );
  }

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create an input object based on provided fields
    const input: UpdateUser = {};
    if (username) input.username = username;
    if (email) input.email = email;
    if (newPassword) input.password = newPassword; // Include new password only if provided

    // Ensure that at least one field is being updated
    if (Object.keys(input).length === 0) {
      alert("Please provide at least one field to update.");
      return;
    }

    try {
      await updateUser({
        variables: { input }, // Pass the input object
        refetchQueries: [
          { query: userParam ? QUERY_USER : QUERY_ME, variables: { username: userParam } }
        ],
      });
      alert("Profile updated successfully!");
    } catch (error:any) {
      console.error(error);
      alert("Error updating user: " + (error.graphQLErrors[0]?.message || error.message));
    }
};

  return (
    <div>
      <div className="flex-row justify-center mb-3">
        <h2 className="col-12 col-md-10 bg-dark text-light p-3 mb-5">
          Viewing {userParam ? `${user.username}'s` : "your"} profile.
        </h2>
      </div>
      <div className="Profile-details">
        <h3>Profile Details:</h3>
        <p>
          <strong>Username: </strong>
          {user.username}
        </p>
        <p>
          <strong>Email: </strong>
          {user.email}
        </p>
        <p>
          <strong>Games Played: </strong>
          {user.games_played}
        </p>
        <p>
          <strong>Games Won: </strong>
          {user.games_won}
        </p>
        <p>
          <strong>Games Lost: </strong>
          {user.games_lost}
        </p>
      </div>

      {/* Update Profile Form */}
      <form onSubmit={handleUpdate}>
        <h3>Update Profile</h3>
        
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="New Username (optional)"
        />
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="New Email (optional)"
        />
        
        <input
          type="password"
          value={existingPassword}
          onChange={(e) => setExistingPassword(e.target.value)}
          placeholder="Enter Existing Password (required)"
          required // This field is required for confirmation
        />
        
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password (optional)"
        />
        <button type="submit">Update</button>
      </form>

      {/* Delete Profile Button */}
      {/* <button onClick={handleDelete} style={{ marginTop: '20px', backgroundColor: 'red', color: 'white' }}>
        Delete Profile
      </button> */}
    </div>
  );
};

export default Profile;
