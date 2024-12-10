import { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import styles from "./styles/projectDetails.module.scss";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../contexts/ChatContext";
import { useWeb3 } from "../../contexts/Web3Context";
import { ethers } from "ethers";

const ProjectDetails = () => {
  const { setActiveConversation } = useContext(ChatContext);

  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);
  console.log("Current userType in project details:", isClient);

  const [deliverableDescription, setDeliverableDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { account, contract, connectWallet } = useWeb3();
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    try {
      setLoading(true);
      const fetchProject = async () => {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/projects/project/${projectId}`
        );
        setProject(response.data.project);
        setIsClient(
          response.data.project?.employerId?._id.toString() ===
            (currentUser?._id.toString() || currentUser?.id.toString())
        );
        console.log("Is client in project details:", isClient);
      };

      fetchProject();
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentUser]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Loading project details...
      </div>
    );
  }

  const handleFundProject = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    try {
      setPaymentLoading(true);
      const projectId = ethers.utils.id(project._id.toString());
      const amount = ethers.utils.parseEther(project.budget.toString());

      const tx = await contract.fundProject(projectId, {
        value: amount,
      });

      await tx.wait();

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/${project._id}/fund`,
        {
          transactionHash: tx.hash,
        }
      );

      setPaymentStatus("funded");
    } catch (error) {
      console.error("Error funding project:", error);
      alert("Error funding project");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleReleasePayment = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    try {
      setPaymentLoading(true);
      const projectId = ethers.utils.id(project._id.toString());

      const tx = await contract.releasePayment(projectId);
      await tx.wait();

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/${project._id}/complete`,
        {
          transactionHash: tx.hash,
        }
      );

      setPaymentStatus("completed");
    } catch (error) {
      console.error("Error releasing payment:", error);
      alert("Error releasing payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !deliverableDescription) {
      alert("Please select a file and provide a description");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("description", deliverableDescription);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/project/${projectId}/deliverable`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Deliverable submitted:", response.data.deliverable);

      setProject((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, response.data.deliverable],
      }));

      setDeliverableDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error submitting deliverable:", error);
      alert("Error submitting deliverable");
    } finally {
      setUploading(false);
    }
  };

  const handleMessageSending = () => {
    localStorage.setItem("activeConversation", project.conversationId);
    setActiveConversation(project.conversationId);
    navigate(`/inbox`);
  };

  if (!project) {
    return <div className={styles.error}>Project not found</div>;
  }

  return (
    <div className={styles.projectDetails}>
      <div className={styles.header}>
        <div className={styles.mainInfo}>
          <h1>{project.serviceId.title}</h1>
          <span className={`${styles.status} ${styles[project.status]}`}>
            {project.status.replace("_", " ")}
          </span>
        </div>

        {isClient && (
          <>
            <div className={styles.paymentActions}>
              {project.status === "pending" && (
                <button
                  onClick={handleFundProject}
                  disabled={paymentLoading}
                  className={styles.fundButton}
                >
                  {paymentLoading ? "Processing..." : "Fund Project"}
                </button>
              )}

              {project.status === "in_progress" && (
                <button
                  onClick={handleReleasePayment}
                  disabled={paymentLoading}
                  className={styles.releaseButton}
                >
                  {paymentLoading ? "Processing..." : "Release Payment"}
                </button>
              )}
            </div>
          </>
        )}
        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span className={styles.label}>Created:</span>
            <span>{format(new Date(project.createdAt), "MMM dd, yyyy")}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.label}>Last Updated:</span>
            <span>{format(new Date(project.updatedAt), "MMM dd, yyyy")}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <section className={styles.section}>
            <h2>Project Overview</h2>
            <div className={styles.overviewGrid}>
              <div className={styles.overviewItem}>
                <span className={styles.label}>Budget</span>
                <span className={styles.value}>${project.budget}</span>
              </div>
              <div className={styles.overviewItem}>
                <span className={styles.label}>Deadline</span>
                <span className={styles.value}>
                  {format(new Date(project.deadline), "MMM dd, yyyy")}
                </span>
              </div>
              {project.completedAt && (
                <div className={styles.overviewItem}>
                  <span className={styles.label}>Completed On</span>
                  <span className={styles.value}>
                    {format(new Date(project.completedAt), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Deliverables</h2>
            <div className={styles.deliverables}>
              {currentUser.userType === "freelancer" && (
                <div className={styles.submitDeliverable}>
                  <h3>Submit New Deliverable</h3>
                  <form
                    onSubmit={handleDeliverableSubmit}
                    className={styles.deliverableForm}
                  >
                    <div className={styles.formGroup}>
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        value={deliverableDescription}
                        onChange={(e) =>
                          setDeliverableDescription(e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="file">Upload File</label>
                      <input
                        type="file"
                        id="file"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Submit Deliverable"}
                    </button>
                  </form>
                </div>
              )}

              {project.deliverables.map((deliverable, index) => (
                <div key={index} className={styles.deliverable}>
                  <div className={styles.deliverableHeader}>
                    <span
                      className={`${styles.deliverableStatus} ${styles[deliverable.status]}`}
                    >
                      {deliverable.status}
                    </span>
                    {deliverable.submittedAt && (
                      <span className={styles.submissionDate}>
                        Submitted:{" "}
                        {format(
                          new Date(deliverable.submittedAt),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    )}
                  </div>
                  <p className={styles.deliverableDescription}>
                    {deliverable.description}
                  </p>
                  {deliverable.fileUrl && (
                    <div className={styles.deliverableActions}>
                      <a
                        href={deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadButton}
                        download
                      >
                        <svg
                          className={styles.downloadIcon}
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                        >
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                        </svg>
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {project.clientReview && (
            <section className={styles.section}>
              <h2>Client Review</h2>
              <div className={styles.review}>
                <div className={styles.rating}>
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={
                        index < project.clientReview.rating
                          ? styles.starFilled
                          : styles.star
                      }
                    >
                      ★
                    </span>
                  ))}
                  <span className={styles.ratingValue}>
                    {project.clientReview.rating.toFixed(1)}
                  </span>
                </div>
                <p className={styles.comment}>{project.clientReview.comment}</p>
              </div>
            </section>
          )}
        </div>

        {currentUser.userType === "freelancer" ? (
          <aside className={styles.sidebar}>
            <div className={styles.clientInfo}>
              <h3>Employer Information</h3>
              <div className={styles.clientDetails}>
                <img
                  src={project.employerId.profilePictureUrl}
                  alt={project.employerId.name}
                  className={styles.clientAvatar}
                />
                <div>
                  <h4>
                    {project.employerId.firstName} {project.employerId.lastName}
                  </h4>
                  <button
                    onClick={handleMessageSending}
                    className={styles.messageButton}
                  >
                    Message Employer
                  </button>
                </div>
              </div>
            </div>
          </aside>
        ) : (
          <aside className={styles.sidebar}>
            <div className={styles.freelancerInfo}>
              <h3>Freelancer Information</h3>
              <div className={styles.freelancerDetails}>
                <img
                  src={project.freelancerId.profilePictureUrl}
                  alt={project.freelancerId.name}
                  className={styles.freelancerAvatar}
                />
                <div>
                  <h4>
                    {project.freelancerId.firstName}{" "}
                    {project.freelancerId.lastName}
                  </h4>
                  <button
                    onClick={handleMessageSending}
                    className={styles.messageButton}
                  >
                    Message Freelancer
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
