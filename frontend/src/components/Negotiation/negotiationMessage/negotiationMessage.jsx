// components/NegotiationMessage/NegotiationMessage.jsx
import { useContext } from "react";
import styles from "./styles/negotiationMessage.module.scss";
import { ChatContext } from "../../../contexts/ChatContext";

export const NegotiationMessage = ({
  message,
  currentUser,
  onAccept,
  onReject,
  currentNegotiation,
}) => {
  const isCurrentUserSender = message.sender === currentUser._id;
  // const { metadata } = currentNegotiation;
  console.log("currentNegotiation: ", currentNegotiation);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div
      className={`${styles.negotiationMessage} ${
        isCurrentUserSender ? styles.sent : styles.received
      }`}
    >
      well well well
      {/* <div className={styles.negotiationHeader}>
        <span className={styles.icon}>💼</span>
        <span>
          {metadata.type === "update"
            ? "New Terms Proposed"
            : "Response to Proposal"}
        </span>
      </div>

      {metadata.type === "update" && (
        <>
          <div className={styles.negotiationDetails}>
            <div className={styles.detail}>
              <label>Budget</label>
              <div className={styles.value}>
                {formatCurrency(metadata.changes.budget)}
              </div>
            </div>
            <div className={styles.detail}>
              <label>Deadline</label>
              <div className={styles.value}>
                {formatDate(metadata.changes.deadline)}
              </div>
            </div>
          </div>

          {metadata.changes.notes && (
            <div className={styles.notes}>
              <label>Notes</label>
              <p>{metadata.changes.notes}</p>
            </div>
          )}

          {!isCurrentUserSender && metadata.response === "pending" && (
            <div className={styles.actions}>
              <button
                className={styles.accept}
                onClick={() => onAccept(metadata.negotiationId, metadata.round)}
              >
                Accept
              </button>
              <button
                className={styles.reject}
                onClick={() => onReject(metadata.negotiationId, metadata.round)}
              >
                Reject
              </button>
            </div>
          )}
        </>
      )}

      {metadata.type === "response" && (
        <div className={styles.response}>
          <p className={`${styles.status} ${styles[metadata.response]}`}>
            Terms were {metadata.response}
          </p>
        </div>
      )} */}
    </div>
  );
};
