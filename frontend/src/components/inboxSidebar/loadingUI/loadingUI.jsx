import styles from "./styles/loadingUI.module.scss";

export const LoadingUI = () => {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loader}></div>
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
};
