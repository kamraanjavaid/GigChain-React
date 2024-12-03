import { useContext, useEffect } from "react";

import styles from "./styles/inbox.module.scss";
import UserSearch from "../../components/userSearch/userSearch";
import Sidebar from "../../components/inboxSidebar/inboxSidebar";
import MessageList from "../../components/messageList/messageList";
import MessageInput from "../../components/messageInput/messageInput";
import { ChatContext } from "../../contexts/ChatContext";
import ProjectInfoSidebar from "./ProjectDetailsSidebar/projectInfoSidebar";

function Inbox() {
  const {
    conversations,
    handleNegotiation,
    activeConversation,
    messages,
    currentUser,
    handleSelectConversation,
    handleSendMessage,
    handleProposalChanges,
    fetchConversations,
    handleUserSelect,
    setInitialActiveConversation,
  } = useContext(ChatContext);

  useEffect(() => {
    fetchConversations();
  }, [messages]);

  useEffect(() => {
    const storedConversationId = localStorage.getItem("activeConversation");

    console.log("Stored conversation ID: ", storedConversationId);

    if (storedConversationId) {
      setInitialActiveConversation(storedConversationId);
      localStorage.removeItem("activeConversation");
    }
  }, []);

  console.log("Currently active conversation: ", activeConversation);

  return (
    <div className="app">
      <div className={styles.inboxParentContainer}>
        <div className={styles.sidebarParentContainer}>
          <UserSearch onUserSelect={handleUserSelect} />
          <Sidebar
            currentUser={currentUser}
            messages={messages}
            conversations={conversations}
            activeConversation={activeConversation}
            fetchConversations={fetchConversations}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {activeConversation && (
          <>
            <div className={styles.messageParentContainer}>
              <MessageList
                currentUser={currentUser}
                conversations={conversations}
                activeConversation={activeConversation}
                messages={messages}
                handleNegotiation={handleNegotiation}
                conversationId={activeConversation}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                fetchConversations={fetchConversations}
              />
            </div>
            <div className={styles.aboutUserContainer}>
              <ProjectInfoSidebar
                currentUser={currentUser}
                conversationId={activeConversation}
                handleProposalChanges={handleProposalChanges}
              />
            </div>
          </>
        )}
      </div>
      {/* </>
      ) : (
        <div className={styles.loadingWrapper}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading...</p>{" "}
        </div>
      )} */}
    </div>
  );
}
export default Inbox;
