import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./styles/userSearch.module.scss";

function UserSearch({ onUserSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/search?query=${searchTerm}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setResults([]);
      }
    };
    const timeOut = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearInterval(timeOut);
  }, [searchTerm]);

  return (
    <div className={styles.searchBarParentContainer}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          className={styles.searchInput}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map((user) => (
            <li
              key={user._id}
              onClick={() => {
                onUserSelect(user);
                setResults([]);
                setSearchTerm("");
              }}
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserSearch;

UserSearch.propTypes = {
  onUserSelect: PropTypes.func.isRequired,
};

