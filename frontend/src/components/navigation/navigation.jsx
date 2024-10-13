import React, { useState, useRef, useEffect } from "react";
import styles from "./navigation.module.scss";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DropdownMenu from "../dropdownMenu/dropdownMenu";

export default function Navigation() {
  const { currentUser, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const searchBarRef = useRef(null);
  const avatarMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setSearchSuggestions([]);
      }
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
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

  const toggleAvatarMenu = () => {
    setShowAvatarMenu(!showAvatarMenu);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_container}>
        <h1 className={styles.logo}>GigChain</h1>

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

        <div className={styles.navbar_right}>
          <Link to="/" className={styles.navbar_link}>
            <i className="fas fa-home"></i> Home
          </Link>
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

          {currentUser && (
            <>
              <Link to="/inbox" className={styles.navbar_link}>
                <i className="fas fa-inbox"></i> Inbox
              </Link>
              <Link to="/gigs" className={styles.navbar_link}>
                <i className="fas fa-briefcase"></i> Gigs
              </Link>
              <div className={styles.avatar_container} ref={avatarMenuRef}>
                <button className={styles.avatar_button} onClick={toggleAvatarMenu}>
                  <img
                    src={currentUser.profilePictureUrl || 'https://via.placeholder.com/80'}
                    alt="User Avatar"
                    className={styles.avatar_image}
                  />
                </button>
                {showAvatarMenu && (
                  <div className={styles.avatar_menu}>
                    <Link to="/profile" className={styles.avatar_menu_item}>
                      <i className="fas fa-user"></i> Profile
                    </Link>
                    <button className={styles.avatar_menu_item} onClick={logout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
