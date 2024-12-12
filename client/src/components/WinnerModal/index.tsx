// WinnerModal.tsx
import React from "react";
import confetti from "canvas-confetti";

interface WinnerModalProps {
  winner: string | null;
  playerName: string | null;
  onClose: () => void;
  currentPlayer: string;
}

const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  playerName,
  onClose,
  currentPlayer,
}) => {
  if (!winner) return null; // Don't render if there's no winner

  const triggerRain = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Launch confetti
      confetti({
        particleCount: 75,
        angle: 100,
        spread: 60,
		gravity: 5,
		colors: ["#88c9f2", "#aad3ea"],
        origin: { x: Math.random(), y: 1 },
		shapes: ["circle"],
      });
    }, 950);
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Launch confetti
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 90,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 90,
        origin: { x: 1 },
      });
    }, 500);
  };

  if (winner !== currentPlayer) {
    triggerRain();
  } else {
    triggerConfetti();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content">
        <h2 className={winner === 'draw' ? 'draw' : currentPlayer.toLowerCase()}>
          {winner === 'draw' ? 'It\s a draw' : `${playerName} wins!`}
        </h2>
      </div>
    </div>
  );
};

export default WinnerModal;
