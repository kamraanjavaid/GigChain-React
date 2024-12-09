import { useState, useEffect } from "react";
import styles from "./styles/projects.module.scss";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const Projects = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);

  const [activeTab, setActiveTab] = useState("ongoing");

  const fetchProjects = async () => {
    console.log("fetchprojects for user", currentUser._id);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/projects/${currentUser._id}?userType=${currentUser.userType}`
      );
      setProjects(response.data.projects);
      console.log("projects", response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    console.log("fetching projects for user", currentUser._id);
    fetchProjects();
  }, []);

  const filteredProjects = projects?.filter((project) => {
    if (activeTab === "ongoing") {
      return project.status === "in_progress" || project.status === "pending";
    }
    return project.status === "completed";
  });

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.header}>
        <h1>My Projects</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "ongoing" ? styles.active : ""}`}
            onClick={() => setActiveTab("ongoing")}
          >
            Ongoing Projects
          </button>
          <button
            className={`${styles.tab} ${activeTab === "completed" ? styles.active : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed Projects
          </button>
        </div>
      </div>

      <div className={styles.projectsGrid}>
        {filteredProjects?.map((project) => (
          <Link
            to={`/projects/${project._id}`}
            key={project._id}
            className={styles.projectCard}
          >
            <div className={styles.projectHeader}>
              <h3>{project.serviceId.title}</h3>
              <span className={`${styles.status} ${styles[project.status]}`}>
                {project.status.replace("_", " ")}
              </span>
            </div>
            <div className={styles.projectInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Client:</span>
                <span>{project.employerId.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Budget:</span>
                <span>${project.budget}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Deadline:</span>
                <span>
                  {format(new Date(project.deadline), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
            {project.clientReview && (
              <div className={styles.rating}>
                <span>★</span>
                <span>{project.clientReview.rating.toFixed(1)}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Projects;
