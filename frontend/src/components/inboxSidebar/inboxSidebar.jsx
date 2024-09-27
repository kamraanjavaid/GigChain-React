import styles from "./styles/sidebar.module.scss";
import PropTypes from "prop-types";
function Sidebar({
  currentUser,
  messages,
  conversations,
  activeConversation,
  onSelectConversation,
}) {

  console.log("Active Conversation in Sidebar Component: ", activeConversation);

  return (
    <div className={styles.sidebar}>
      {conversations.map((convo) => {
        const lastMessageText = convo.lastMessage
          ? convo.lastMessage.content
          : "No messages yet";

        const otherUser = convo.participants.find(
          (participant) => participant._id !== currentUser.id
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
                {otherUser.name}
              </h3>
              <p
                className={`${styles.conversationDate} ${
                  activeConversation === convo._id
                    ? styles.activeDate
                    : styles.inActiveDate
                }`}
              >
                {new Date(convo.createdAt).toLocaleDateString()}
              </p>
              <p
                className={`${styles.lastMessage} ${
                  activeConversation === convo._id
                    ? styles.activeMessage
                    : styles.inActiveMessage
                }`}
              >
                {lastMessageText}
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
  activeConversation: PropTypes.string.isRequired,
  onSelectConversation: PropTypes.func.isRequired,
};


