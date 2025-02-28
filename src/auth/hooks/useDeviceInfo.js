import { useState, useEffect } from 'react';

const useDeviceInfo = () => {
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    // Generate a simple device ID if none exists
    const existingDeviceId = localStorage.getItem('deviceId');
    if (existingDeviceId) {
      setDeviceId(existingDeviceId);
    } else {
      const newDeviceId = 'dev-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', newDeviceId);
      setDeviceId(newDeviceId);
    }
  }, []);

  return { deviceId };
};

export default useDeviceInfo;
