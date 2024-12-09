import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import styles from "./styles/projectDetails.module.scss";
import { useAuth } from "../../contexts/AuthContext";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);
  console.log("Current userType in project details:", isClient);

  useEffect(() => {
    try {
      setLoading(true);
      const fetchProject = async () => {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/projects/project/${projectId}`
        );
        setProject(response.data.project);
        setIsClient(
          response.data.project.clientId._id.toString() ===
            (currentUser._id.toString() || currentUser?.id.toString())
        );
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
              <h3>Client Information</h3>
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
                  <button className={styles.messageButton}>
                    Message Client
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
                  <button className={styles.messageButton}>
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
