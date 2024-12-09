import { useEffect } from "react";
import styles from "./styles/sidebar.module.scss";
import PropTypes from "prop-types";

function Sidebar({
  currentUser,
  messages,
  conversations,
  activeConversation,
  onSelectConversation,
  fetchConversations,
}) {
  useEffect(() => {
    fetchConversations();
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      const activeElement = document.getElementById(
        `conversation-${activeConversation}`
      );
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [activeConversation]);

  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.lastMessage?.timestamp
      ? new Date(a.lastMessage.timestamp)
      : new Date(a.createdAt);
    const timeB = b.lastMessage?.timestamp
      ? new Date(b.lastMessage.timestamp)
      : new Date(b.createdAt);

    return timeB - timeA;
  });

  const getLastMessageTime = (convo) => {
    const lastMessageTime = convo?.lastMessage?.timestamp;
    if (!lastMessageTime) return "";

    const messageDate = new Date(lastMessageTime);
    const now = new Date();

    const isToday =
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const getLastMessage = (convo) => {
    if (!convo.lastMessage) return "No messages yet";

    switch (convo.lastMessage.messageType) {
      case "proposal":
        return "💼 Proposal";
      case "text":
        return convo.lastMessage.content;
      case "system":
        return "System message";
      default:
        return "No messages yet";
    }
  };

  return (
    <div className={styles.sidebar}>
      {sortedConversations.map((convo) => {
        const otherUser = convo.participants.find((participant) => {
          console.log("participant", participant._id);
          console.log("currentUser", currentUser?._id);

          return participant._id !== currentUser?._id;
        });
        console.log("convo", convo);
        console.log("otherUser", otherUser);
        console.log(
          "currentUserId and otherUserId",
          currentUser?._id,
          otherUser
        );

        return (
          <div
            className={`${styles.message_list} ${
              activeConversation === convo._id ? styles.active : styles.inActive
            }`}
            key={convo._id}
            onClick={() => onSelectConversation(convo._id)}
          >
            <img
              className={styles.avatarImg}
              src={otherUser.profilePictureUrl}
              alt="avatar"
            />
            <div className={styles.converationsDetailsContainer}>
              <h3
                className={`${styles.reciept} ${
                  activeConversation === convo._id
                    ? styles.activeReciept
                    : styles.inActiveReciept
                }`}
              >
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <p
                className={`${styles.conversationDate} ${
                  activeConversation === convo._id
                    ? styles.activeDate
                    : styles.inActiveDate
                }`}
              >
                {getLastMessageTime(convo)}
              </p>
              <p
                className={`${styles.lastMessage} ${
                  activeConversation === convo._id
                    ? styles.activeMessage
                    : styles.inActiveMessage
                }`}
              >
                {getLastMessage(convo)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Sidebar;

Sidebar.propTypes = {
  currentUser: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  conversations: PropTypes.array.isRequired,
  // activeConversation: PropTypes.string.isRequired,
  onSelectConversation: PropTypes.func.isRequired,
};
