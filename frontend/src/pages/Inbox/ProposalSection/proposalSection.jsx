import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import styles from "./styles/proposalSection.module.scss";
import PropTypes from "prop-types";

const ProposalSection = ({ handleProposalChanges, conversationId }) => {
  const [budget, setBudget] = useState();
  const [deadline, setDeadline] = useState();
  const [proposalDetails, setProposalDetails] = useState(null);
  const [error, setError] = useState(null);

  const fetchProposalDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/conversations/${conversationId}/proposal`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProposalDetails(response.data);
    } catch (err) {
      setError("Failed to load proposal details");
    }
  }, [conversationId]);

  useEffect(() => {
    fetchProposalDetails();
  }, [fetchProposalDetails]);

  const handleSubmitChanges = async () => {
    try {
      await handleProposalChanges(budget, deadline, conversationId);
      fetchProposalDetails();
    } catch (error) {
      console.error("Error updating proposal:", error);
    }
  };

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value);
  };

  return (
    <div className={styles.proposalSection}>
      <div className={styles.budgetSection}>
        <div className={styles.budgetCurrent}>
          Current Budget: ${proposalDetails?.budget}
        </div>
        <input
          type="number"
          value={budget}
          onChange={handleBudgetChange}
          placeholder="Enter new budget"
        />
      </div>

      <div className={styles.deadlineSection}>
        <div className={styles.deadlineLabel}>
          Current Deadline:{" "}
          {new Date(proposalDetails?.deadline).toLocaleDateString()}
        </div>
        <input type="date" value={deadline} onChange={handleDeadlineChange} />
      </div>

      <button
        className={`${styles.buttonPrimary} ${styles.updateProposalButton}`}
        onClick={handleSubmitChanges}
      >
        Ask Qoute
      </button>
    </div>
  );
};

ProposalSection.propTypes = {
  handleProposalChanges: PropTypes.func.isRequired,
  conversationId: PropTypes.string.isRequired,
};

export { ProposalSection };
