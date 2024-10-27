import { useEffect, useState } from "react";
import ServiceCard from "../serviceCard/serviceCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./styles/featuredServicesSectionStyles.module.scss";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import SkeletonCard from "../skeletonCard/skeletonCard";

// function SampleNextArrow(props: { className: any; style: any; onClick: any; }) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ ...style, backgroundColor: "black", borderRadius: "100%"}}
//       onClick={onClick}
//     />
//   );
// }

// function SamplePrevArrow(props) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ ...style, display: "block", background: "transparent", width: "40px", height: "40px" }}
//       onClick={onClick}
//     />
//   );
// }

function FeaturedServicesSection({ serviceType }) {
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    // nextArrow: <SampleNextArrow />,
    // prevArrow: <SamplePrevArrow />,
  };

  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServicesByCategory(category) {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/service/category/${category}`
        );
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching featured services:", error);
      }
      setTimeout(() => setLoading(false), 1500);
      // setLoading(false);
    }

    fetchServicesByCategory(serviceType);
  }, [serviceType]);


  return (
    <div>
      <h2 style={{ marginLeft: 50, marginTop:50, marginBottom:30  }}>Featured in {serviceType}</h2>
      <section className={styles.featuredServices_main_container}>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : services.map((service, index) => (
              <ServiceCard key={index} service={service}  />
            ))}
      </section>
    </div>
  );
}

export default FeaturedServicesSection;
