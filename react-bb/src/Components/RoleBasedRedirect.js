import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = ({ user }) => {
  if (!user) return <Navigate to="/" />;

  if (user.role === 'developer') {
    return <Navigate to="/Landing_dev" />;
  } else if (user.role === 'runner') {
    return <Navigate to="/Landing_runner" />;
  } else {
    return <Navigate to="/dashboard" />; // fallback
  }
};

export default RoleBasedRedirect;
