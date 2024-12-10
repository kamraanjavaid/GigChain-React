import { useEffect, useState, useRef, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles/messageList.module.scss";
import PropTypes from "prop-types";
import { ProposalSection } from "../../pages/Inbox/ProposalSection/proposalSection";
import { ChatContext } from "../../contexts/ChatContext";
import { NegotiationModal } from "../Negotiation/negotiationModal/negotiationModal";
import ProposalMessage from "../../components/proposalMessage/proposalMessage";
// import { LoadingUI } from "../../components/inboxSidebar/loadingUI/loadingUI";

function MessageList({
  currentUser,
  conversations,
  conversationId,
  activeConversation,
  fetchConversations,
  messages,
}) {
  const [otherUser, setOtherUser] = useState({});
  const messageListRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // console.log("messages in messageList", messages);

  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState(null);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    try {
      setIsLoading(true);
      console.log("Fetching conversations after negotiation modal closes");
      fetchConversations();
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isNegotiationModalOpen]);

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
        }
      }
    } else {
      console.log("Missing required data");
    }
  }, [conversations, currentUserId, activeConversation]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {otherUser && (
        <div className={styles.leftSideContainer}>
          <div className={styles.messagesWrapper}>
            <div className={styles.receiptNameBar}>
              <Link to={`/freelancer-profile/${otherUser._id}`}>
                <h2 className={styles.receiptName}>
                  {otherUser.firstName} {otherUser.lastName}
                </h2>
              </Link>
            </div>
            <div className={styles.message_list} ref={messageListRef}>
              {/* <ProposalSection
              handleProposalChanges={handleProposalChanges}
              conversationId={activeConversation}
            /> */}

              <div className={styles.main_message_content_container}>
                {messages.map((message) => {
                  const messageDate = new Date(message.timestamp);
                  const currentDate = new Date();

                  // console.log("well, this is the message", message);

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

                  if (message.messageType === "proposal") {
                    return (
                      <ProposalMessage
                        key={message._id}
                        message={message}
                        setIsNegotiationModalOpen={setIsNegotiationModalOpen}
                        setCurrentProposal={setCurrentProposal}
                        setIsLoading={setIsLoading}
                      />
                    );
                  }

                  return (
                    <>
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
                    </>
                  );
                })}
              </div>
            </div>
            <NegotiationModal
              isOpen={isNegotiationModalOpen}
              onClose={() => setIsNegotiationModalOpen(false)}
              currentProposal={currentProposal}
              fetchConversations={fetchConversations}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default MessageList;

MessageList.propTypes = {
  currentUser: PropTypes.object.isRequired,
  conversations: PropTypes.array.isRequired,
  activeConversation: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
  conversationId: PropTypes.string.isRequired,
  handleNegotiation: PropTypes.func.isRequired,
};
