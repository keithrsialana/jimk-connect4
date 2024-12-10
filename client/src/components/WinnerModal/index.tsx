// WinnerModal.tsx
import React from "react";

interface WinnerModalProps {
	winner: string | null;
	playerName: string | null;
	onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, playerName, onClose }) => {
	if (!winner) return null; // Don't render if there's no winner

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content">
				<h2 className={winner.toLowerCase()}>{playerName} wins!</h2>
			</div>
		</div>
	);
};

export default WinnerModal;
