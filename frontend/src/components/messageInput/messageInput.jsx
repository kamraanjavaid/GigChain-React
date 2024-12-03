import { useState, useEffect } from "react";
import styles from "./styles/messageInput.module.scss";

function MessageInput({ onSendMessage, fetchConversations }) {
  const [message, setMessage] = useState("");


  const handleSubmit = (event) => {
    event.preventDefault();
    onSendMessage(message);
    setMessage("");
    fetchConversations();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Send a message..."
      />
      <button className={styles.messageSendBtn} type="submit">
        Send
      </button>
    </form>
  );
}

export default MessageInput;
