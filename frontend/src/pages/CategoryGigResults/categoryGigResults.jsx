import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./styles/categoryGigResults.module.scss";
import ServiceCard from "../../components/serviceCard/serviceCard";

const GigList = () => {
  const { mainCategory, subCategory } = useParams();
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(styles);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/services/category/${mainCategory}/${subCategory}`
        );
        setGigs(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching gigs:", error);
        setError("Failed to fetch gigs. Please try again.");
        setIsLoading(false);
      }
    };

    fetchGigs();
  }, [mainCategory, subCategory]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (gigs.length === 0) {
    return <div>No services found for the selected category.</div>;
  }

  return (
    <>
      <div className={styles.gigListWrapper}>
        <h2 className={styles.heading}>Services in {subCategory}</h2>
        <div className={styles.gigListContent}>
          {gigs.map((service, index) => (
            <ServiceCard key={index} service={service} />

            //   <li key={gig._id} className={styles.gigItem}>
            //     <img src={gig.thumbnailUrl} alt={gig.title} className={styles.gigThumbnail} />
            //     <div className={styles.gigDetails}>
            //       <h3>{gig.title}</h3>
            //       <p>{gig.description}</p>
            //       <p>Price: ${gig.price}</p>
            //     </div>
            //   </li>
          ))}
        </div>
      </div>
    </>
  );
};

export default GigList;
