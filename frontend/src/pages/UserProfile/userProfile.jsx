import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import styles from "./styles/page.module.scss";

const UserProfile = () => {
  const { currentUser } = useAuth();

  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("About");
  console.log(userId);
  console.log(useParams());

  const tabs = ["About", "Gigs", "Reviews"];

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
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

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
                    {/* <p>{userDetails.expertise}</p> */}
                    {/* <p>Languages: {userDetails.languages}</p> */}
                    {/* <p>About: {userDetails.about}</p> */}
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
                      <h2 className={styles.infoTitle}>SKILLS</h2>
                      <div className={styles.skillsList}>
                        <span className={styles.skill}>Graphic Design</span>
                        <span className={styles.skill}>Web Design</span>
                        <span className={styles.skill}>UI/UX</span>
                      </div>
                    </div>

                    <div className={styles.infoBox}>
                      <h2 className={styles.infoTitle}>LANGUAGES</h2>
                      <div className={styles.languagesList}>
                        <span className={styles.language}>English</span>
                        <span className={styles.language}>Pushto</span>
                        <span className={styles.language}>Urdu</span>
                        <span className={styles.language}>Punjabi</span>
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
                    {/* Add content for other tabs here when needed */}
                  </div>
                </div>
                );
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

export default UserProfile;
