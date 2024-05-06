import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "redaxios";
import Navigation from "../../components/navigation/navigation";
import Footer from "../../components/footer/footer";
import ServiceCard from "../../components/serviceCard/serviceCard";
import styles from "./styles/page.module.scss";
import { useParams } from "react-router-dom";

const ViewGigs = () => {
  const { gigId } = useParams();
  console.log(gigId);
  const { currentUser } = useAuth();
  const [userGigs, setUserGigs] = useState([]);

  useEffect(() => {
    const fetchUserGigs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/gig/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserGigs(response.data.gigs);
      } catch (error) {
        console.error("Error fetching user gigs:", error);
      }
    };

    fetchUserGigs();
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navigation />

      <h1>Your Gigs</h1>
      <div className={styles.gigsParentWrapper}>
        {userGigs.length === 0 ? (
          <p>No gigs found.</p>
        ) : (
          <div className={styles.gigsWrapper}>
            {userGigs.map((gig) => (
              <ServiceCard
                key={gig._id}
                gigId={gig._id}
                title={gig.title}
                price={gig.price}
                thumbnailUrl={gig.thumbnailUrl}
                category={gig.category}
                serviceProvider={gig.serviceProvider}
                rating={gig.rating}
                reviews={gig.numReviews}
                description={gig.description}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ViewGigs;