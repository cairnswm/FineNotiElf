import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = useAdmin();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" />;
  }
  
  return children;
};

export default AdminRoute;
