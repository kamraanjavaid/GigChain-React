import { useContext } from "react";

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
    activeConversation,
    messages,
    currentUser,
    handleSelectConversation,
    handleSendMessage,
    handleProposalChanges,
    handleUserSelect,
  } = useContext(ChatContext);

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
              />
              <MessageInput onSendMessage={handleSendMessage} />
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
