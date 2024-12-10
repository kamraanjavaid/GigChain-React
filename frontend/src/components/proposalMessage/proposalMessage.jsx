import { useState, useEffect } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { useNavigate } from "react-router-dom";
import styles from "./styles/proposalMessage.module.scss";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
// import LoadingUI from "../inboxSidebar/loadingUI/loadingUI";

const ProposalMessage = ({
  message,
  setIsNegotiationModalOpen,
  setCurrentProposal,
  setIsLoading,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const currentUserId = currentUser._id || currentUser?.id;

  const { connectWallet, account } = useWeb3();

  console.log("connectWallet:", connectWallet);
  const [isProcessing, setIsProcessing] = useState(false);

  const { sender } = message;

  console.log("Message", message);

  const { conversationId } = message;
  const [conversationDetails, setConversationDetails] = useState(null);

  const isCurrentUser = currentUserId === sender;
  const projectStatus = conversationDetails?.status;

  const { messageText, budget, deadline } = message.proposal;
  setCurrentProposal(message.proposal);

  let daysRemaining = 0;

  const formattedDeadline = (deadline) => {
    const formattedDate = new Date(deadline).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    daysRemaining = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return formattedDate;
  };

  useEffect(() => {
    if (!conversationId) return;

    const fetchConversationDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setConversationDetails(response.data);
        console.log("conversation details", response.data);
      } catch (error) {
        console.error("Error fetching conversation details:", error);
      }
    };

    fetchConversationDetails();
  }, [conversationId]);

  const handleAccept = async () => {
    try {
      setIsProcessing(true);

      console.log("account", account);

      // if (!account) {
      //   try {
      //     await connectWallet();
      //   } catch (error) {
      //     alert("Please connect your MetaMask wallet to continue");
      //     return;
      //   }
      // }

      const projectData = {
        serviceId: conversationDetails.serviceId._id,
        employerId: sender,
        freelancerId: currentUser._id,
        conversationId: message.conversationId,
        status: "pending",
        budget: message.proposal.budget,
        deadline: message.proposal.deadline,
        proposalId: message.proposal._id,
        walletAddress: account,
      };

      console.log("project data", projectData);

      const token = localStorage.getItem("token");

      console.log("token", token);

      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/accept-proposal`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        navigate("/projects");
        // try {
        //   console.log("response.data", response.data.project);
        //   const contractResponse = await axios.post(
        //     `${import.meta.env.VITE_API_URL}/api/projects/${response.data.project._id}/deploy-contract`,
        //     {},
        //     {
        //       headers: { Authorization: `Bearer ${token}` },
        //     }
        //   );
        //   if (contractResponse.data.success) {
        //     navigate("/projects");
        //   }
        // } catch (error) {
        //   console.error("Error deploying contract:", error);
        //   alert("Error creating smart contract. Please try again.");
        // }
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.proposalMessage}  ${
          isCurrentUser ? styles.sent : styles.received
        } ${message.proposal.status === "accepted" ? styles.accepted : ""}`}
      >
        <div className={styles.statusBadge}>
          <span className={styles.dot}></span>
          Proposal
        </div>

        <p className={styles.messageText}>{messageText}</p>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.icon}>💰</span>
            <div>
              <p className={styles.label}>Budget</p>
              <p className={styles.value}>${budget}</p>
              <span className={styles.estimate}>Fixed Price</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.icon}>⏰</span>
            <div>
              <p className={styles.label}>Deadline</p>
              <p className={styles.value}>{formattedDeadline(deadline)}</p>
              <span className={styles.estimate}>
                {daysRemaining} days remaining
              </span>
            </div>
          </div>
        </div>

        {!isCurrentUser && projectStatus !== "accepted" ? (
          <div className={styles.buttonsContainer}>
            <button
              className={`${styles.button} ${styles.counterOffer}`}
              onClick={() => {
                setIsNegotiationModalOpen(true);
                console.log("Counter offer button clicked");
              }}
            >
              Counter Offer
            </button>

            <button
              className={`${styles.button} ${styles.accept}`}
              onClick={handleAccept}
            >
              Accept
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProposalMessage;
