import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import LoadingSkeleton from "../ViewServiceDetails/viewServiceDetailsSkeloton/viewServiceDetailsSkeleton";
import styles from "./styles/viewFreelancerService.module.scss";
import Review from "../../../components/review/review";

import { useAuth } from "../../../contexts/AuthContext";
import { ChatContext } from "../../../contexts/ChatContext";

import pImage1 from "../../../assets/pImage1.jpg";
import pImage2 from "../../../assets/pImage2.jpg";
import pImage3 from "../../../assets/pImage3.jpg";
import pImage4 from "../../../assets/pImage4.jpg";

const ViewFreelancerService = () => {
  const { currentUser } = useAuth();
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const {
    activeConversation,
    setActiveConversation,
    handleSendProposalMessage,
    checkConversationExists,
  } = useContext(ChatContext);

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
          `${import.meta.env.VITE_API_URL}/api/services/${serviceId}/click`
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
          `${import.meta.env.VITE_API_URL}/api/services/${serviceId}`
        );
        setServiceDetails(response.data.service);
        setProviderDetails(response.data.provider);
        console.log("serviceDetails", response.data.service);
        console.log("providerDetails", response.data.provider);
        setBudget(response.data.service.startingPrice);
      } catch (error) {
        console.error("Error fetching service details:", error);
      }
    };
    fetchServiceDetails();
  }, [serviceId]);

  const handleEdit = () => {
    navigate(`/services/${serviceId}/edit`);
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
      let conversationId;
      const conversationExists = await checkConversationExists(
        serviceDetails.user,
        currentUserId
      );

      if (conversationExists) {
        conversationId = conversationExists;

        localStorage.setItem("activeConversation", conversationId);
        navigate("/inbox");
        return;
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
              freelancerId: providerDetails._id,
              serviceId: serviceDetails._id,
              employerId: currentUserId,
              proposal: {
                messageText: message,
                budget: budget,
                deadline: deadline,
              },
            }),
          }
        );
        const data = await response.json();
        console.log("data", data);
        conversationId = data;

        localStorage.setItem("activeConversation", conversationId);
        navigate("/inbox");

        // handleSendProposalMessage(message, conversationId).catch((error) => {
        // console.error("Error sending proposal message:", error);
        // });
      }
    } catch (err) {
      console.error("Error in send proposal:", err);
      alert("Failed to create conversation. Please try again.");
    }
  };

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
      </div>
      <div className={styles.reviewsContainer}>
        <h2>Recent Reviews</h2>
        {reviews.map((review) => (
          <Review key={review.reviewer} {...review} />
        ))}
      </div>
    </>
  );
};

export default ViewFreelancerService;

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
