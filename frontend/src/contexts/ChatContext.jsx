import { createContext, useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "redaxios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(`${import.meta.env.VITE_API_URL}`);

    socket.current.on("connect", () => {
      console.log("Connected to server");
    });

    socket.current.on("new message", (message) => {
      console.log("Received new message: ", message);
      setConversations((prevConversations) => {
        return prevConversations.map((convo) => {
          if (convo.id === message.conversationId) {
            return { ...convo, lastMessage: message };
          }
          return convo;
        });
      });

      if (message.conversationId === activeConversation) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    if (activeConversation) {
      socket.current.emit("join-conversation", activeConversation);
    }

    fetchConversations();
    if (activeConversation) {
      fetchMessages(activeConversation);
    }

    return () => {
      socket.current.off("connect");
      socket.current.off("new message");
      if (activeConversation) {
        socket.current.emit("leave-conversation", activeConversation);
      }
      socket.current.disconnect("disconnect");
    };
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conversations`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      setConversations(data);
      console.log("Conversations fetched: ", data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleSelectConversation = (id) => {
    console.log("Selected conversation:", id);
    setActiveConversation(id);
  };

  const handleSendMessage = async (text) => {
    console.log(
      "Sending message...",
      text,
      userDetails._id,
      activeConversation
    );
    if (activeConversation) {
      const message = {
        conversationId: activeConversation,
        sender: userDetails._id,
        text: text,
      };
      socket.current.emit("send-message", message);
    } else {
      console.error("No active conversation found");
    }
  };

  const fetchMessages = async (conversationId) => {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/api/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    const data = await response.json();
    setMessages(data);
    console.log("Messages fetched: ", data);
  };

  const handleUserSelect = async (user) => {
    if (user._id === userDetails._id) {
      console.error("Cannot open a conversation with yourself");
      return;
    }

    const existingConversation = conversations.find((conversation) =>
      conversation.participants.includes(user._id)
    );

    if (existingConversation) {
      setActiveConversation(existingConversation._id);
    } else {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ participant: user._id }),
        }
      );
      const newConversation = await response.json();
      setConversations([...conversations, newConversation]);
      setActiveConversation(newConversation._id);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/user/${userId}`
      );

      if (!response.data.user) {
        console.log("User not found");
        return;
      }
      console.log(response.data.user);
      setUserDetails(response.data.user);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        userDetails,
        fetchUserDetails,
        handleSelectConversation,
        handleSendMessage,
        handleUserSelect,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
