import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PropTypes from "prop-types";
import styles from "./protectedRoute.module.scss";

const ProtectedRoute = React.memo(
  ({
    element: Element,
    allowedRoles = [],
    redirectPath = "/signIn",
    ...rest
  }) => {
    const { currentUser, loading } = useAuth();
    const userType = currentUser?.userType;

    if (loading) {
      return (
        <div className={styles.loadingWrapper}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      );
    }

    if (!currentUser) {
      return <Navigate to="/signIn" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
      const redirectTo =
        userType === "freelancer"
          ? "/freelancer-dashboard"
          : "/employer-dashboard";
      return <Navigate to={redirectTo} replace />;
    }

    return <Element {...rest} />;
  }
);

ProtectedRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string,
};

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
