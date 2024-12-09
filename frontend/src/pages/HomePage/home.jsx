import React, { useState } from "react";
import axios from "axios";
import styles from "./styles/styles.module.scss";
import FeaturedServicesSection from "../../components/featuredServicesSection/featuredServicesSection";
import ServiceCard from "../../components/searchResultGigCard/searchResultGigCard";
import { useAuth } from "../../contexts/AuthContext";

function HomePage() {
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [oldSearchQuery, setOldSearchQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/services/search?query=${searchQuery}`
      );
      // console.log(response.data[0]);
      setSearchResults(response.data);
      setOldSearchQuery(searchQuery);
    } catch (error) {
      console.error("Error searching gigs:", error);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // handleSearch(query);
  };

  return (
    <React.Fragment>
      <div className={styles.home_wrapper}>
        <div className={styles.hero_container}>
          <div className={styles.headings_container}>
            <h5>Welcome, {currentUser.firstName}</h5>
            <h1>
              Pick top talent at <br />
              your fingertips
            </h1>
          </div>

          <div className={styles.searchBar_container}>
            <form onSubmit={handleSearch}>
              <input
                placeholder={"Start typing to search services..."}
                className={styles.hero_searchBar}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
              />
              <button
                className={styles.hero_searchButton}
                // onClick={handleSearch}
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {searchResults.length > 0 ? (
          <div className={styles.searchResultsParentContainer}>
            <h2>
              Search Results for &quot;{oldSearchQuery || searchQuery}&quot;
            </h2>
            <div className={styles.searchResultsMainContainer}>
              {searchResults.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.featuredServicesContainer}>
            <FeaturedServicesSection serviceType={"Web Development"} />
            <FeaturedServicesSection serviceType={"Graphic Design"} />
            <FeaturedServicesSection serviceType={"Content Writing"} />
            <FeaturedServicesSection serviceType={"Digital Marketing"} />
            <FeaturedServicesSection serviceType={"SEO Services"} />
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

export default HomePage;
