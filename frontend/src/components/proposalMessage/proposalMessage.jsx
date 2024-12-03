import styles from "./styles/proposalMessage.module.scss";

const ProposalMessage = ({ message }) => {
  const { messageText, budget, deadline } = message;

  return (
    <div className={styles.proposalMessage}>
      <p>{messageText}</p>
      <p>Budget: {budget}</p>
      <p>Deadline: {deadline}</p>
    </div>
  );
};

export default ProposalMessage;
