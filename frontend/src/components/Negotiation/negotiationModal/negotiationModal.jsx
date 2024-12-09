import { useState, useEffect } from "react";
import styles from "./styles/negotiationModal.module.scss";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";

export const NegotiationModal = ({
  isOpen,
  onClose,
  currentProposal,
  fetchConversations,
}) => {
  const { currentUser } = useAuth();
  const { conversationId } = currentProposal || {};
  const [newBudget, setNewBudget] = useState(currentProposal?.budget || "");
  const [newDeadline, setNewDeadline] = useState(
    currentProposal?.deadline
      ? new Date(currentProposal.deadline).toISOString().split("T")[0]
      : ""
  );
  const [notes, setNotes] = useState("");
  const [conversationDetails, setConversationDetails] = useState(null);

  useEffect(() => {
    if (currentProposal) {
      setNewBudget(currentProposal.budget || "");
      setNewDeadline(
        currentProposal.deadline
          ? new Date(currentProposal.deadline).toISOString().split("T")[0]
          : ""
      );
      setNotes("");
    }
  }, [currentProposal]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchConversationDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setConversationDetails(response.data);
        console.log("conversation details", response.data);
      } catch (error) {
        console.error("Error fetching conversation details:", error);
      }
    };

    fetchConversationDetails();
  }, [conversationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conversations/counter-offer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            conversationId: conversationId,
            sender: currentUser._id,
            serviceId: conversationDetails.serviceId._id,
            proposal: {
              messageText: notes,
              budget: newBudget,
              deadline: newDeadline,
            },
          }),
        }
      );

      if (response.status === 201) {
        fetchConversations();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting counter-offer:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Update Project Terms</h2>
        <form onSubmit={handleSubmit}>
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
