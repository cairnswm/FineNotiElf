import { useAuth } from '../context/AuthContext';

export const useAdmin = () => {
  const { properties } = useAuth();
  
  return properties?.some(prop => 
    prop.name?.toLowerCase() === 'admin' && 
    (prop.value === '1' || prop.value === 1)
  ) || false;
};
