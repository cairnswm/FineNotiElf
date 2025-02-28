import { useEffect } from 'react';

const useEventing = (channel, event, callback) => {
  useEffect(() => {
    const handleEvent = (e) => {
      if (e.detail && e.detail.channel === channel && e.detail.event === event) {
        callback(e.detail.data);
      }
    };

    window.addEventListener('custom-event', handleEvent);
    return () => window.removeEventListener('custom-event', handleEvent);
  }, [channel, event, callback]);
};

export default useEventing;
