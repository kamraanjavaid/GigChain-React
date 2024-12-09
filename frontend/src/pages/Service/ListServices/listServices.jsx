import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "redaxios";
import styles from "./styles/listServices.module.scss";

const ListServices = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userServices, setUserServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/user`,
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

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const handleAction = (action, serviceId) => {
    if (action === "view") {
      handleView(serviceId);
    } else if (action === "edit") {
      handleEdit(serviceId);
    } else if (action === "delete") {
      handleDelete(serviceId);
    }
  };

  const handleView = (serviceId) => {
    navigate(`/freelancer/service/${serviceId}`);
  };

  const handleEdit = (serviceId) => {
    navigate(`/service/${serviceId}/edit`);
  };

  const handleDelete = (serviceId) => {
    try {
      axios.delete(`${import.meta.env.VITE_API_URL}/api/services/${serviceId}`);
      setUserServices(
        userServices.filter((service) => service._id !== serviceId)
      );
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

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
        <Link to="/create-service">
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
                      const selectedAction = e.target.value;
                      if (selectedAction) {
                        handleAction(selectedAction, service._id);
                        e.target.value = "";
                      }
                    }}
                    value=""
                  >
                    <option value="">Actions</option>
                    <option value="view">View</option>
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
