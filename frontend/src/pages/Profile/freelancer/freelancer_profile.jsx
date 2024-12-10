import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import styles from "./styles/freelancer_profile.module.scss";
import { FaPen } from "react-icons/fa";
import ServiceCard from "../../../components/serviceCard/serviceCard";

const FreelancerProfile = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();

  console.log(currentUser);

  const [userDetails, setUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("About");
  console.log(currentUser);
  console.log(useParams());

  const [editingSkills, setEditingSkills] = useState(false);
  const [editingLanguages, setEditingLanguages] = useState(false);
  const [skills, setSkills] = useState(userDetails?.skills || []);
  const [languages, setLanguages] = useState(userDetails?.languages || []);
  const [newItem, setNewItem] = useState("");
  const [services, setServices] = useState([]);
  const [profilePicture, setProfilePicture] = useState(
    userDetails?.profilePictureUrl
  );

  const handleSave = async (type) => {
    try {
      const endpoint = type === "skills" ? "update-skills" : "update-languages";
      const data = type === "skills" ? { skills } : { languages };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${currentUser._id}/${endpoint}`,
        data
      );

      if (type === "skills") {
        setEditingSkills(false);
      } else {
        setEditingLanguages(false);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  const handleAdd = (type) => {
    if (newItem.trim()) {
      if (type === "skills") {
        setSkills([...skills, newItem.trim()]);
      } else {
        setLanguages([...languages, newItem.trim()]);
      }
      setNewItem("");
    }
  };

  const handleRemove = (index, type) => {
    if (type === "skills") {
      setSkills(skills.filter((_, i) => i !== index));
    } else {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  const [isEditing, setIsEditing] = useState({
    profile: false,
    skills: false,
    languages: false,
  });

  const tabs = ["About", "Services", "Reviews"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  console.log("User Details: ", userDetails);

  useEffect(() => {
    const fetchUserDetails = async () => {
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
        setSkills(response.data.freelancer.skills);
        setLanguages(response.data.freelancer.languages);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/get-services/${userId}`
        );
        setServices(response.data.services);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchUserDetails();
    fetchServices();
  }, [currentUser, profilePicture]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser._id
        }/profile-picture`,
        formData
      );
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser._id
        }/profile-picture`
      );
      setProfilePicture(response.data.profilePictureUrl);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleCoverPictureUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("coverPicture", file);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser._id
        }/cover-picture`,
        formData
      );
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser._id
        }/cover-picture`
      );
      setCoverPicture(response.data.coverPictureUrl);
    } catch (error) {
      console.error("Error uploading cover picture:", error);
    }
  };

  const handleEditSection = (section) => {
    switch (section) {
      case "skills":
        setIsEditing({ ...isEditing, skills: true });
        break;
      case "languages":
        setIsEditing({ ...isEditing, languages: true });
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {userDetails ? (
        <>
          <div className={styles.coverPictureContainer}>
            <img
              src={userDetails.coverPictureUrl}
              alt="Cover Picture"
              className={styles.coverPicture}
            />
          </div>

          <div className={styles.mainProfileWrapper}>
            <div className={styles.profileContainer}>
              <div className={styles.profileOverviewContainer}>
                <div className={styles.profilePictureAndDetailsContainer}>
                  <div className={styles.profilePictureContainer}>
                    <img
                      src={userDetails.profilePictureUrl}
                      alt="Profile Picture"
                      className={styles.profilePicture}
                    />
                    {currentUser && currentUser._id === userDetails._id && (
                      <label
                        htmlFor="profilePictureInput"
                        className={styles.editIconWrapper}
                      >
                        <FaPen className={styles.editIcon} />
                        <input
                          id="profilePictureInput"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                  </div>

                  <div className={styles.profileDetailsContainer}>
                    <h2 className={styles.profileName}>
                      {userDetails.firstName} {userDetails.lastName}
                    </h2>
                    <p className={styles.profileLocation}>
                      Karachi, Pakistan
                      {/* {userDetails.location} */}
                    </p>
                    <p className={styles.profileJoined}>Joined January 2024</p>
                  </div>
                </div>
                <div className={styles.profileStatsContainer}>
                  <div className={styles.profileInfo}>
                    <div className={styles.infoBox}>
                      <h2 className={styles.infoTitle}>RATING</h2>
                      <div className={styles.rating}>
                        <div className={styles.stars}>
                          {[...Array(5)].map((_, index) => (
                            <span key={index} className={styles.star}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className={styles.ratingScore}>5.0</span>
                        <span className={styles.reviewCount}>112 Reviews</span>
                      </div>
                    </div>

                    <div className={styles.infoBox}>
                      <h2 className={styles.infoTitle}>
                        SKILLS
                        {currentUser && currentUser._id === userDetails._id && (
                          <button
                            className={styles.editIconButton}
                            onClick={() => setEditingSkills(!editingSkills)}
                          >
                            <FaPen className={styles.editIcon} />
                          </button>
                        )}
                      </h2>
                      <div className={styles.skillsList}>
                        {editingSkills ? (
                          <>
                            <div className={styles.editInput}>
                              <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add new skill"
                              />
                              <button onClick={() => handleAdd("skills")}>
                                Add
                              </button>
                            </div>
                            {skills.map((skill, index) => (
                              <span key={index} className={styles.skill}>
                                {skill}
                                <button
                                  className={styles.removeBtn}
                                  onClick={() => handleRemove(index, "skills")}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <button
                              className={styles.saveBtn}
                              onClick={() => handleSave("skills")}
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          skills.map((skill, index) => (
                            <span key={index} className={styles.skill}>
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className={styles.infoBox}>
                      <h2 className={styles.infoTitle}>
                        LANGUAGES
                        {currentUser && currentUser._id === userDetails._id && (
                          <button
                            className={styles.editIconButton}
                            onClick={() =>
                              setEditingLanguages(!editingLanguages)
                            }
                          >
                            <FaPen className={styles.editIcon} />
                          </button>
                        )}
                      </h2>
                      <div className={styles.languagesList}>
                        {editingLanguages ? (
                          <>
                            <div className={styles.editInput}>
                              <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add new language"
                              />
                              <button onClick={() => handleAdd("languages")}>
                                Add
                              </button>
                            </div>
                            {languages.map((language, index) => (
                              <span key={index} className={styles.language}>
                                {language}
                                <button
                                  className={styles.removeBtn}
                                  onClick={() =>
                                    handleRemove(index, "languages")
                                  }
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <button
                              className={styles.saveBtn}
                              onClick={() => handleSave("languages")}
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          languages.map((language, index) => (
                            <span key={index} className={styles.language}>
                              {language}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.profileTabsAndContentContainer}>
                <div className={styles.profileTabs}>
                  <div className={styles.tabsContainer}>
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        className={`${styles.tab} ${
                          activeTab === tab ? styles.active : ""
                        }`}
                        onClick={() => handleTabClick(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className={styles.tabContent}>
                    {activeTab === "About" && (
                      <div className={styles.aboutContent}>
                        <p className={styles.aboutText}>
                          Hello there! I'm Sohail Khan, your friendly
                          neighborhood digital enthusiast with a knack for
                          weaving creativity into the fabric of the internet. My
                          journey began in the early days of the web, a time
                          when dial-up tones were the overture to exploration
                          and discovery. As a youngster, I found myself
                          mesmerized by the dance of pixels and the symphony of
                          code that made static pages come alive. It wasn't long
                          before I realized that my future was intertwined with
                          the ever-evolving world of web and graphic design.
                        </p>
                        <p className={styles.aboutText}>
                          Armed with a curious mind and an eye for detail, I
                          dove headfirst into the digital realm. I've always
                          believed that design is more than just a feast for the
                          eyes; it's an intricate puzzle where form meets
                          function. This philosophy guided me through the
                          hallowed halls of academia, where I'm currently honing
                          my craft as a software engineering student. Here, I've
                          learned to marry the beauty of design with the
                          robustness of solid coding principles.
                        </p>
                        <p className={styles.aboutText}>
                          As I stand on the precipice of graduation, I'm eager
                          to take the plunge into the professional world. My
                          dream? To create digital experiences that are as
                          seamless as they are stunning. Whether it's a sleek
                          website that captures your imagination or an app that
                          simplifies your day, I'm all about making the digital
                          domain more accessible and enjoyable.
                        </p>
                      </div>
                    )}
                    {activeTab === "Services" && (
                      <div className={styles.servicesContainer}>
                        {services.map((service) => (
                          <ServiceCard service={service} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.loadingWrapper}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfile;
