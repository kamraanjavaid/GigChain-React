import { useEffect, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/messageList.module.scss";
import PropTypes from "prop-types";
import { ProposalSection } from "../../pages/Inbox/ProposalSection/proposalSection";
import { ChatContext } from "../../contexts/ChatContext";

function MessageList({
  currentUser,
  conversations,
  activeConversation,
  messages,
}) {
  const { handleProposalChanges } = useContext(ChatContext);
  const [otherUser, setOtherUser] = useState({});
  const messageListRef = useRef(null);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (conversations && conversations.length > 0 && currentUserId) {
      const activeConvo = conversations.find(
        (convo) => convo._id === activeConversation
      );

      if (activeConvo) {
        const other = activeConvo.participants.find(
          (participant) => participant._id !== currentUserId
        );
        if (other) {
          setOtherUser(other);
          console.log("Other user in messageList useEffect: ", other);
        }
      }
    } else {
      console.log("Missing required data");
    }
  }, [conversations, currentUserId, activeConversation]);

  console.log("Other user in messageList after useEffect: ", otherUser);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    otherUser && (
      <div className={styles.leftSideContainer}>
        <div className={styles.messagesWrapper}>
          <div className={styles.receiptNameBar}>
            <Link to={`/user/${otherUser._id}`}>
              <h2 className={styles.receiptName}>
                {otherUser.firstName} {otherUser.lastName}
              </h2>
            </Link>
          </div>
          {/* <div className={styles.chatContainer}> */}
          <div className={styles.message_list} ref={messageListRef}>
            <ProposalSection
              handleProposalChanges={handleProposalChanges}
              conversationId={activeConversation}
            />

            <div className={styles.main_message_content_container}>
              {messages.map((message) => {
                const messageDate = new Date(message.timestamp);
                const currentDate = new Date();

                const messageDateOnly = new Date(
                  messageDate.getFullYear(),
                  messageDate.getMonth(),
                  messageDate.getDate()
                );
                const currentDateOnly = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate()
                );

                const isToday =
                  messageDateOnly.getTime() === currentDateOnly.getTime();
                const isYesterday =
                  messageDateOnly.getTime() ===
                  currentDateOnly.getTime() - 24 * 60 * 60 * 1000;

                const timeString = messageDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                let displayDateTime;
                if (isToday) {
                  displayDateTime = timeString;
                } else if (isYesterday) {
                  displayDateTime = `Yesterday ${timeString}`;
                } else {
                  const dateString = messageDate.toLocaleDateString();
                  displayDateTime = `${dateString} ${timeString}`;
                }

                return (
                  <div className={styles.main_cont_msg} key={message._id}>
                    <div
                      className={` ${styles.chatBubble} ${
                        message.sender === currentUserId
                          ? styles.sent
                          : styles.received
                      }`}
                    >
                      {message.content}
                    </div>
                    <p
                      className={`${
                        message.sender === currentUserId
                          ? styles.sentTimestamp
                          : styles.receivedTimestamp
                      }`}
                    >
                      {displayDateTime}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default MessageList;

MessageList.propTypes = {
  currentUser: PropTypes.object.isRequired,
  conversations: PropTypes.array.isRequired,
  activeConversation: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
};
