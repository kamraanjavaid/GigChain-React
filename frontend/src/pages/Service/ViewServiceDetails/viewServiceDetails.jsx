import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import LoadingSkeleton from "./viewServiceDetailsSkeloton/viewServiceDetailsSkeleton";
import styles from "./styles/viewServiceDetails.module.scss";

import { useAuth } from "../../../contexts/AuthContext";
import { ChatContext } from "../../../contexts/ChatContext";

import pImage1 from "../../../assets/pImage1.jpg";
import pImage2 from "../../../assets/pImage2.jpg";
import pImage3 from "../../../assets/pImage3.jpg";
import pImage4 from "../../../assets/pImage4.jpg";

const ViewServiceDetails = () => {
  const { currentUser } = useAuth();
  const { serviceId } = useParams();
  const navigate = useNavigate();

  // console.log("chat context in newGigDetails", ChatContext);

  const {
    activeConversation,
    setActiveConversation,
    handleSendProposalMessage,
    checkConversationExists,
  } = useContext(ChatContext);

  // console.log("chat context's currentUser", currentUser);

  const [serviceDetails, setServiceDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [providerDetails, setProviderDetails] = useState(null);
  const [budget, setBudget] = useState();
  const [deadline, setDeadline] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const recordClick = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/service/${serviceId}/click`
        );
      } catch (error) {
        console.error("Error recording click:", error);
      }
    };
    recordClick();
  }, [serviceId]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/service/${serviceId}`
        );
        setServiceDetails(response.data.service);
        setProviderDetails(response.data.provider);
        setBudget(response.data.service.startingPrice);
        // console.log("Provider details:", response.data.provider);
      } catch (error) {
        console.error("Error fetching service details:", error);
      }
    };
    fetchServiceDetails();
  }, [serviceId]);

  const handleEdit = () => {
    navigate(`/service/${serviceId}/edit`);
  };

  const handleMessageInput = (e) => {
    setMessage(e.target.value);
  };

  const handleBudgetInput = (e) => {
    setBudget(e.target.value);
  };

  const handleDeadlineInput = (e) => {
    setDeadline(e.target.value);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/service/${serviceId}`
      );
      navigate("/gigs");
    } catch (error) {
      console.error("Error deleting gig:", error);
    }
  };

  useEffect(() => {
    console.log("Active conversation in newGigDetails: ", activeConversation);
  }, [activeConversation]);

  const handleSendProposal = async () => {
    try {
      console.log("Sending request to create a new proposal");

      //check if a conversation between these two users already exists
      let conversationId;
      const conversationExists = await checkConversationExists(
        serviceDetails.user,
        currentUserId
      );

      console.log("Conversation exists: ", conversationExists);

      if (conversationExists) {
        conversationId = conversationExists;
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/conversations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              participant: serviceDetails.user,
              serviceId: serviceDetails._id,
              proposal: {
                budget: budget,
                deadline: deadline,
              },
            }),
          }
        );
        const data = await response.json();
        console.log("Response from creating a new conversation: ", data);
        await new Promise((resolve) => {
          setActiveConversation(data._id);
          resolve();
        });
        conversationId = data._id;
      }

      await handleSendProposalMessage(message, conversationId)
        .then(() => {
          console.log("Message sent successfully");
        })
        .catch((err) => {
          console.error("Error in send proposal", err);
        });
    } catch (err) {
      console.error("Error in send proposal", err);
    }
  };

  // const handleSendMessageToConversation = (conversationId) => {
  //   console.log("Sending message to conversation: ", conversationId);
  //   // setActiveConversation((currentActiveConversation) => {
  //     // if (currentActiveConversation) {
  //       await handleSendProposalMessage(message, conversationId);
  //     // } else {
  //       // console.error("Active conversation not set");
  //     // }
  //     // return currentActiveConversation;
  //   // }
  // // );
  // };

  if (!serviceDetails) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <div className={styles.header}>
            <div className={styles.breadcrumb}>
              Category → {serviceDetails.category}
            </div>

            <div className={styles.headerMainContainer}>
              <h1 className={styles.title}>{serviceDetails.title}</h1>

              <div className={styles.ratingAndPriceContainer}>
                <div className={styles.ratingContainer}>
                  <span className={styles.star}>⭐</span>{" "}
                  {serviceDetails.rating} ({serviceDetails.numReviews})
                </div>
                <div className={styles.priceContainer}>
                  <h3>${serviceDetails.startingPrice}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.portfolio}>
            <div className={styles.portfolioItem}>
              <img
                src={serviceDetails.images[0]}
                alt="Portfolio"
                className={styles.portfolioImage}
              />
            </div>
            <div className={styles.portfolioItem}>
              <img
                src={serviceDetails.images[1]}
                alt="Portfolio"
                className={styles.portfolioImage}
              />
            </div>
            <div className={styles.portfolioItem}>
              <img
                src={serviceDetails.images[2]}
                alt="Portfolio"
                className={styles.portfolioImage}
              />
            </div>
          </div>
          <div className={styles.serviceDetails}>
            <p className={styles.description}>
              {serviceDetails.description}
              <br />
              <br />
              {serviceDetails.description}
              <br />
              <br />
              {serviceDetails.description}
            </p>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.freelancerProfile}>
            <div className={styles.profileTopContainer}>
              <div className={styles.profilePicAndRatingContainer}>
                <div className={styles.profilePicContainer}>
                  <Link to={`/user/${serviceDetails.user}`}>
                    <img
                      src={providerDetails.profilePictureUrl}
                      alt={providerDetails.username}
                      className={styles.profilePic}
                    />
                  </Link>
                </div>
                <div className={styles.ratingAndNameContainer}>
                  <h2 className={styles.designerName}>
                    {providerDetails?.firstName} {providerDetails?.lastName}
                  </h2>
                  <span className={styles.ratingScore}>4.8 ⭐⭐⭐⭐ (427)</span>
                </div>
              </div>
              <div className={styles.miscInfoContainer}>
                <span className={styles.time}>
                  {providerDetails?.localTime
                    ? providerDetails?.localTime
                    : "N/A"}
                  {" "}
                </span>
                <p className={styles.location}>
                  {providerDetails?.location?.city
                    ? providerDetails?.location?.city
                    : "N/A"}
                  ,{" "}
                  {providerDetails?.location?.country
                    ? providerDetails?.location?.country
                    : "N/A"}
                </p>
                <p className={styles.joinDate}>
                  Joined:{" "}
                  {providerDetails?.joinedAt
                    ? new Date(providerDetails?.joinedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.messageForm}>
            <h3>Send a private message</h3>
            <textarea
              className={styles.messageInput}
              onChange={handleMessageInput}
              placeholder={`Hi! ${providerDetails?.firstName} ${providerDetails?.lastName} i noticed your profile and would like to offer you my project`}
            ></textarea>
            <div className={styles.budgetSection}>
              <label htmlFor="budget">
                My Budget (Minimum ${serviceDetails.startingPrice})
              </label>
              <div className={styles.budgetInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="text"
                  id="budget"
                  defaultValue={serviceDetails.startingPrice}
                  min={serviceDetails.startingPrice}
                  onChange={handleBudgetInput}
                />
              </div>
            </div>
            <div className={styles.deadlineSection}>
              <label htmlFor="deadline">Deadline</label>
              <input
                type="date"
                id="deadline"
                onChange={handleDeadlineInput}
                required
                className={styles.deadlineInput}
              />
            </div>
            <button className={styles.sendButton} onClick={handleSendProposal}>
              Send
            </button>
          </div>
        </div>
      </div>
      <div className={styles.reviewsContainer}>
        <h2>Recent Reviews</h2>
        {/* {reviews.map((review) => (
          <Review key={review.reviewer} {...review} />
        ))} */}
      </div>
    </>
  );
};

export default ViewServiceDetails;

const reviews = [
  {
    reviewer: "Kamran Javaid",
    rating: 4.9,
    comment:
      "Khan brings unmatched creativity and dedication, a true pleasure to work with! He really has a passion for graphic design and that is what is shown in his work he creates. It’s been two years working with Khan and he always delivers the best and extraordinary work on time beyond our expectations. We always recommend him to our network of colleagues in our circle.",
    project: "Create brand identity for a fin-tech startup",
    date: "Sep 18, 2023",
    image: pImage1,
  },

  {
    reviewer: "Leonardo DiCaprio",
    rating: 4.5,
    comment:
      "Khan brings unmatched creativity and dedication, a true pleasure to work with! He really has a passion for graphic design and that is what is shown in his work he creates. It’s been two years working with Khan and he always delivers the best and extraordinary work on time beyond our expectations. We always recommend him to our network of colleagues in our circle.",
    project: "Create brand identity for a fin-tech startup",
    date: "Sep 18, 2023",
    image: pImage2,
  },
  {
    reviewer: "Tom Hanks",
    rating: 3.7,
    comment:
      "Khan brings unmatched creativity and dedication, a true pleasure to work with! He really has a passion for graphic design and that is what is shown in his work he creates. It’s been two years working with Khan and he always delivers the best and extraordinary work on time beyond our expectations. We always recommend him to our network of colleagues in our circle.",
    project: "Create brand identity for a fin-tech startup",
    date: "Sep 18, 2023",
    image: pImage3,
  },
  {
    reviewer: "Ben Affleck",
    rating: 4.8,
    comment:
      "Khan brings unmatched creativity and dedication, a true pleasure to work with! He really has a passion for graphic design and that is what is shown in his work he creates. It’s been two years working with Khan and he always delivers the best and extraordinary work on time beyond our expectations. We always recommend him to our network of colleagues in our circle.",
    project: "Create brand identity for a fin-tech startup",
    date: "Sep 18, 2023",
    image: pImage4,
  },
];
