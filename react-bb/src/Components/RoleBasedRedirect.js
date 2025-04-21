import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleBasedRedirect = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'Developer') {
        navigate('/dashboard');
      } else if (user.role === 'Runner') {
        navigate('/landing_runner');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  return null; // No UI to render
};

export default RoleBasedRedirect;
