import { useEffect } from "react";
import styles from "./styles/sidebar.module.scss";
import PropTypes from "prop-types";

function Sidebar({
  currentUser,
  messages,
  conversations,
  activeConversation,
  onSelectConversation,
}) {
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

  const formatNegotiationMessage = (negotiation) => {
    if (!negotiation) return "Negotiation details not available";

    const changes = negotiation.changes;
    if (negotiation.type === "update") {
      const updates = [];
      if (changes.budget) updates.push(`Budget: $${changes.budget}`);
      if (changes.deadline)
        updates.push(
          `Deadline: ${new Date(changes.deadline).toLocaleDateString()}`
        );
      if (changes.notes) updates.push(`Notes: ${changes.notes}`);
      return `Updated: ${updates.join(", ")}`;
    }

    if (negotiation.type === "response") {
      return `Negotiation ${negotiation.response || "pending"}`;
    }

    if (negotiation.type === "final") {
      return "Negotiation finalized";
    }

    return "Negotiation in progress";
  };

  const getLastMessageTime = (convo) => {
    console.log("Convo: ", convo);
    let lastMessageTime;
    lastMessageTime = new Date(
      convo?.lastMessage?.timestamp
    ).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    console.log("Last message time: ", lastMessageTime);

    return lastMessageTime;
  };

  const getLastMessage = (convo) => {
    if (!convo.lastMessage) return "No messages yet";

    switch (convo.lastMessage.messageType) {
      case "negotiation":
        return "💼 Negotiation Update";
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
        const otherUser = convo.participants.find(
          (participant) =>
            participant._id !== (currentUser?._id || currentUser?.id)
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
