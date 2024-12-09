// InviteModal.tsx
import React, { useState } from "react";

interface InviteModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
	const [inviteCode, setInviteCode] = useState("");

	if (!isOpen) return null; // Don't render if the modal is not open

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInviteCode(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		// Handle the invite Code submission (e.g., send it to a server or copy to clipboard)
		console.log("Invite Code:", inviteCode);
		onClose(); // Close the modal after submission
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h2>Join a room</h2>
                <p>To join a room, ask for the invite code, and enter it below.</p>
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						value={inviteCode}
						onChange={handleInputChange}
						placeholder="Enter invite code"
						required
					/>
					<button className="btn btn-info ml-2" type="submit">Submit</button>
				</form>
				<button className="btn btn-danger" onClick={onClose}>Close</button>
			</div>
		</div>
	);
};

export default InviteModal;
