import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./navigation.module.scss";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DropdownMenu from "../dropdownMenu/dropdownMenu";
import { ChatContext } from "../../contexts/ChatContext";
import PaymentComponent from "../metaMaskpayment/paymentComponent";

export default function Navigation() {
  const { unReadCount } = useContext(ChatContext);
  const { currentUser, logout, updateUserRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const searchBarRef = useRef(null);
  const avatarMenuRef = useRef(null);
  const navigate = useNavigate();
  console.log("Current user in navigation:", currentUser);

  const userId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    console.log("Unread count: ", unReadCount);
  }, [unReadCount]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setSearchSuggestions([]);
      }
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target)
      ) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setSearchSuggestions([]);
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() !== "") {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/gig/search?query=${query}`
        );
        setSearchSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  console.log("Again Current user in navigation:", userId);

  const handleSwitchToFreelancer = async () => {
    try {
      console.log("Switching to freelancer", currentUser._id);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/switchRole`,
        {
          role: "freelancer",
          userId: userId,
        }
      );
      if (response.status === 200) {
        updateUserRole("freelancer");
      }
    } catch (error) {
      console.error("Error switching to freelancer:", error);
    }
  };

  const handleSwitchToEmployer = async () => {
    try {
      console.log("Switching to employer", currentUser._id);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/switchRole`,
        {
          role: "employer",
          userId: userId,
        }
      );
      if (response.status === 200) {
        updateUserRole("employer");
      }
    } catch (error) {
      console.error("Error switching to employer:", error);
    }
  };

  useEffect(() => {
    console.log("User type changed:", currentUser?.userType);
  }, [currentUser?.userType]);

  const toggleAvatarMenu = () => {
    setShowAvatarMenu(!showAvatarMenu);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_container}>
        <h1 className={styles.logo}>GigChain</h1>

        <div className={styles.navbar_right}>
          {!currentUser && (
            <>
              <Link to="/signIn" className={styles.navbar_link}>
                <i className="fas fa-sign-in-alt"></i> Sign In
              </Link>
              <Link to="/register" className={styles.navbar_link}>
                <i className="fas fa-user-plus"></i> Register
              </Link>
            </>
          )}

          {currentUser && currentUser.userType === "freelancer" ? (
            <>
              <Link to="/inbox" className={styles.navbar_link}>
                <div className={styles.inbox_container}>
                  <i className="fas fa-comments"></i> Inbox
                  {unReadCount ? (
                    <span className={styles.unread_count}>{unReadCount}</span>
                  ) : null}
                </div>
              </Link>
              <Link to="/projects" className={styles.navbar_link}>
                <i className="fas fa-"></i> Projects
              </Link>
              <Link to="/services" className={styles.navbar_link}>
                <i className="fas fa-briefcase"></i> Services
              </Link>
              <Link
                to={`/freelancer-profile/${currentUser._id}`}
                className={styles.navbar_link}
              >
                <i className="fas fa-user"></i> Profile
              </Link>
              <div className={styles.avatar_container} ref={avatarMenuRef}>
                <button
                  className={styles.avatar_button}
                  onClick={toggleAvatarMenu}
                >
                  <img
                    src={currentUser.profilePictureUrl}
                    alt={currentUser.firstName}
                    className={styles.avatar_image}
                  />
                </button>
                {showAvatarMenu && (
                  <div className={styles.avatar_menu}>
                    {currentUser.userType === "freelancer" ? (
                      <button
                        onClick={handleSwitchToEmployer}
                        className={styles.avatar_menu_item}
                      >
                        <i className="fas fa-building"></i> Switch to Employer
                      </button>
                    ) : (
                      <button
                        onClick={handleSwitchToFreelancer}
                        className={styles.avatar_menu_item}
                      >
                        <i className="fas fa-briefcase"></i> Switch to
                        Freelancer
                      </button>
                    )}

                    <div className={styles.payment_component}>
                      <PaymentComponent />
                    </div>

                    <button
                      className={styles.avatar_menu_item}
                      onClick={logout}
                    >
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : currentUser && currentUser.userType === "employer" ? (
            <>
              <div className={styles.searchBar_container}>
                <DropdownMenu />
                <div className={styles.input_wrapper} ref={searchBarRef}>
                  <input
                    className={styles.searchBar}
                    type="text"
                    placeholder="Search for jobs"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchSuggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                      {searchSuggestions.map((suggestion) => (
                        <li
                          key={suggestion._id}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button className={styles.searchButton}>
                  <i className="fas fa-search"></i>
                </button>
              </div>

              <Link to="/" className={styles.navbar_link}>
                <i className="fas fa-home"></i> Home
              </Link>
              <Link to="/inbox" className={styles.navbar_link}>
                <div className={styles.inbox_container}>
                  <i className="fas fa-comments"></i> Inbox
                  {unReadCount ? (
                    <span className={styles.unread_count}>{unReadCount}</span>
                  ) : null}
                </div>
              </Link>
              <Link to="/projects" className={styles.navbar_link}>
                <i className="fas fa-"></i> Projects
              </Link>

              <div className={styles.avatar_container} ref={avatarMenuRef}>
                <button
                  className={styles.avatar_button}
                  onClick={toggleAvatarMenu}
                >
                  <img
                    src={currentUser.profilePictureUrl}
                    alt={currentUser.firstName}
                    className={styles.avatar_image}
                  />
                </button>
                {showAvatarMenu && (
                  <div className={styles.avatar_menu}>
                    <Link
                      to="/employer/profile"
                      className={styles.avatar_menu_item}
                    >
                      <i className="fas fa-user"></i> Profile
                    </Link>

                    {currentUser.userType === "freelancer" ? (
                      <button
                        onClick={handleSwitchToEmployer}
                        className={styles.avatar_menu_item}
                      >
                        <i className="fas fa-building"></i> Switch to Employer
                      </button>
                    ) : (
                      <button
                        onClick={handleSwitchToFreelancer}
                        className={styles.avatar_menu_item}
                      >
                        <i className="fas fa-briefcase"></i> Switch to
                        Freelancer
                      </button>
                    )}

                    <div className={styles.payment_component}>
                      <PaymentComponent />
                    </div>

                    <button
                      className={styles.avatar_menu_item}
                      onClick={logout}
                    >
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
