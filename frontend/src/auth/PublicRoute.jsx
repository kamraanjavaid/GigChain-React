// PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropTypes from 'prop-types';

const PublicRoute = React.memo(({ element: Element, ...rest }) => {
  const { currentUser } = useAuth();

  return currentUser ? <Navigate to="/" replace /> : <Element {...rest} />;
});

PublicRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
};

PublicRoute.displayName = 'PublicRoute';

export default PublicRoute;
