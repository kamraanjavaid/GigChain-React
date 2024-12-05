import { useState } from "react";
import styles from "./styles/proposalMessage.module.scss";
import { useAuth } from "../../contexts/AuthContext";
import { NegotiationModal } from "../Negotiation/negotiationModal/negotiationModal";
import { NegotiationButton } from "../Negotiation/negotiationButton/negotiationButton";

const ProposalMessage = ({
  message,
  setIsNegotiationModalOpen,
  setCurrentProposal,
}) => {
  const { currentUser } = useAuth();

  const currentUserId = currentUser._id;

  const { sender } = message;

  const isCurrentUser = currentUserId === sender;

  console.log("Current user id and sender id", currentUserId, sender);
  const { messageText, budget, deadline } = message.proposal;
  setCurrentProposal(message.proposal);

  let daysRemaining = 0;

  const formattedDeadline = (deadline) => {
    const formattedDate = new Date(deadline).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    daysRemaining = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return formattedDate;
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.proposalMessage} ${
          isCurrentUser ? styles.sent : styles.received
        }`}
      >
        <div className={styles.statusBadge}>
          <span className={styles.dot}></span>
          Proposal expires in 48h
        </div>

        <p className={styles.messageText}>{messageText}</p>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.icon}>💰</span>
            <div>
              <p className={styles.label}>Budget</p>
              <p className={styles.value}>${budget}</p>
              <span className={styles.estimate}>Fixed Price</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.icon}>⏰</span>
            <div>
              <p className={styles.label}>Deadline</p>
              <p className={styles.value}>{formattedDeadline(deadline)}</p>
              <span className={styles.estimate}>
                {daysRemaining} days remaining
              </span>
            </div>
          </div>
        </div>

        {!isCurrentUser && (
          <div className={styles.buttonsContainer}>
            <button
              className={`${styles.button} ${styles.counterOffer}`}
              onClick={() => {
                setIsNegotiationModalOpen(true);
              }}
            >
              Counter Offer
            </button>

            <button className={`${styles.button} ${styles.accept}`}>
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalMessage;
