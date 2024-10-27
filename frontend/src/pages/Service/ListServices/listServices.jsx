import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "redaxios";
import styles from "./styles/listServices.module.scss";

const ListServices = () => {
  const { currentUser } = useAuth();
  const [userServices, setUserServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/service/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserServices(response.data.services);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user services:", error);
        setIsLoading(false);
      }
    };

    fetchUserServices();
  }, []);

  const handleEdit = (serviceId) => {
    // Implement edit functionality
    console.log(`Edit service with id: ${serviceId}`);
  };

  const handleDelete = (serviceId) => {
    // Implement delete functionality
    console.log(`Delete service with id: ${serviceId}`);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loader}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.servicesListContainer}>
      <div className={styles.header}>
        <h2>Your Services</h2>
        <Link to="/create_service">
          <button className={styles.createServiceBtn}>Create Service</button>
        </Link>
      </div>

      {userServices.length === 0 ? (
        <p>No services found. Begin by creating your first service.</p>
      ) : (
        <table className={styles.servicesTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Conversions</th>
              <th>Conversion Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {userServices.map((service) => (
              <tr key={service._id}>
                <td className={styles.thumbnailTableCell}>
                  <img
                    src={service.images[0] || service.thumbnailUrl}
                    alt={service.title}
                    className={styles.thumbnail}
                  />
                </td>
                <td className={styles.title}>{service.title}</td>
                <td>{service.impressions || 0}</td>
                <td>{service.clicks || 0}</td>
                <td>{service.conversions || 0}</td>
                <td>
                  {service.clicks > 0
                    ? `${((service.conversions / service.clicks) * 100).toFixed(
                        2
                      )}%`
                    : "0%"}
                </td>
                <td>
                  <select
                    className={styles.actionSelect}
                    onChange={(e) => {
                      if (e.target.value === "edit") {
                        handleEdit(service._id);
                      } else if (e.target.value === "delete") {
                        handleDelete(service._id);
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">Actions</option>
                    <option value="edit">Edit</option>
                    <option value="delete">Delete</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListServices;

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../../../contexts/AuthContext";
// import axios from "redaxios";
// import ServiceCard from "../../../components/serviceCard/serviceCard";
// import styles from "./styles/listServices.module.scss";
// import { useParams } from "react-router-dom";

// const ListServices = () => {
//   const { serviceId } = useParams();
//   const { currentUser } = useAuth();
//   const [userServices, setUserServices] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserServices = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get(
//           `${import.meta.env.VITE_API_URL}/api/service/user`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setUserServices(response.data.services);
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error fetching user services:", error);
//         setIsLoading(false);
//       }
//     };

//     fetchUserServices();
//   }, []);

//   if (!currentUser) {
//     return <div>Loading...</div>;
//   }

//   if (isLoading) {
//     return (
//       <div className={styles.loadingWrapper}>
//         <div className={styles.loader}></div>
//         <p className={styles.loadingText}>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className={styles.gigsParentWrapper}>
//         {userServices.length === 0 ? (
//           <>
//             <p>
//               No services found.
//               <br />
//               Begin by creating your first service.
//             </p>
//             <Link to="/create_service">
//               <button>Create Service</button>
//             </Link>
//           </>
//         ) : (
//           <>
//             <div className={styles.gigsActionsWrapper}>
//               <h2>Your Gigs</h2>
//               <Link to="/create_service">
//                 <button className={styles.createGigBtn}>Create Service</button>
//               </Link>
//             </div>

//             <div className={styles.gigsWrapper}>
//               {userServices.map((service) => (
//                 <ServiceCard
//                   key={service._id}
//                   serviceId={service._id}
//                   title={service.title}
//                   price={service.startingPrice}
//                   images={service.images}
//                   category={service.category}
//                   serviceProvider={service.serviceProvider}
//                   rating={service.rating}
//                   reviews={service.numReviews}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ListServices;
