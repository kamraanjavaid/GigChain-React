import { useState } from "react";
import styles from "./styles/negotiationModal.module.scss";

export const NegotiationModal = ({
  isOpen,
  onClose,
  currentProposal,
  onSubmit,
}) => {
  const [newBudget, setNewBudget] = useState(currentProposal?.budget || "");
  const [newDeadline, setNewDeadline] = useState(
    currentProposal?.deadline
      ? new Date(currentProposal.deadline).toISOString().split("T")[0]
      : ""
  );
  const [notes, setNotes] = useState("");

  const { budget, deadline, messageText } = currentProposal;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      budget: parseFloat(newBudget),
      deadline: new Date(newDeadline),
      notes,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Update Project Terms</h2>
        <form onSubmit={handleSubmit}>
          {/* <div className={styles.currentTerms}>
            <h3>Current Terms:</h3>
            <div className={styles.termDetails}>
              <p>Budget: ${budget}</p>
              <p>Deadline: {new Date(deadline).toLocaleDateString()}</p>
            </div>
          </div> */}

          <div className={styles.newTerms}>
            <h3>New Terms:</h3>
            <div className={styles.inputGroup}>
              <label>Budget:</label>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Deadline:</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Reason for Change:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain your proposed changes..."
                required
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Send Counter-Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
