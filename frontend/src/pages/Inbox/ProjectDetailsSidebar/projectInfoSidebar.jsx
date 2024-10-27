import { useState, useCallback, useEffect } from "react";
import styles from "./styles/projectInfoSidebar.module.scss";
import axios from "axios";
import PropTypes from "prop-types";
import { useAuth } from "../../../contexts/AuthContext";

const ProjectInfoSidebar = ({ currentUser, conversationId }) => {
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  // const { currentUser } = useAuth;
  const [error, setError] = useState(null);
  const [proposalDetails, setProposalDetails] = useState(null);
  const [employer, setEmployer] = useState(null);

  // const currentUserId = currentUser._id;
  console.log("Current User: ", currentUser);

  const fetchProposalDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/conversations/${conversationId}/proposal`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProposalDetails(response.data);
    } catch (err) {
      setError("Failed to load proposal details");
    }
  }, [conversationId]);

  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProjectInfo(response.data);

        const employer = response.data.participants.find(
          (user) => user._id !== currentUser._id
        );

        fetchProposalDetails();
        setEmployer(employer);
        console.log("Project info in project info sidebar: ", response.data);
        console.log("Employer Id: ", employer._id);
        setLoading(false);
      } catch (err) {
        setError("Failed to load project information");
        setLoading(false);
      }
    };

    fetchProjectInfo();
  }, [conversationId, fetchProposalDetails]);

  if (loading)
    return (
      <div className={styles.loadingState}>Loading project information...</div>
    );
  if (error) return <div className={styles.errorState}>{error}</div>;
  if (!projectInfo)
    return (
      <div className={styles.loadingState}>
        No project information available
      </div>
    );

  return (
    <div className={styles.projectInfoSidebar}>
      <h2>{projectInfo?.serviceId?.title}</h2>

      <div className={styles.status}>
        <span className={styles.statusLabel}>Status:</span>{" "}
        {projectInfo?.status}
      </div>

      <div className={styles.employerInfo}>
        <img
          className={styles.employerProfilePicture}
          src={employer.profilePictureUrl}
        />
        <h3 className={styles.employerName}>
          {employer.firstName} {employer.lastName}
        </h3>
      </div>

      {projectInfo?.status === "proposal" && (
        <div className={styles.actionButtons}>
          <button className={styles.buttonPrimary}>Accept Project</button>
          <button className={styles.buttonSecondary}>Reject Project</button>
        </div>
      )}

      {projectInfo?.status === "accepted" && (
        <button className={styles.buttonPrimary}>Submit Deliverable</button>
      )}
    </div>
  );
};

ProjectInfoSidebar.propTypes = {
  conversationId: PropTypes.string.isRequired,
  handleProposalChanges: PropTypes.func.isRequired,
};

export default ProjectInfoSidebar;
