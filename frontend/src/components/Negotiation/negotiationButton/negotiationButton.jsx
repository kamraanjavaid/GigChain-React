import styles from "./styles/negotiationButton.module.scss";

export const NegotiationButton = ({ onOpenNegotiation }) => {
  return (
    <button className={styles.negotiateButton} onClick={onOpenNegotiation}>
      💰 Negotiate
    </button>
  );
};
