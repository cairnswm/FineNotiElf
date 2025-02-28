import React, { createContext, useContext, useState } from 'react';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionLevel, setSubscriptionLevel] = useState('Family');
  const [additionalEmails, setAdditionalEmails] = useState(["yolande@cairns.co.za"]);
  const [expiryDate, setExpiryDate] = useState(null); // New state for expiry date

  const subscriptionCosts = {
    Free: 0,
    Basic: 20, // Updated cost
    Family: 50, // Updated cost
  };

  const subscriptionFeatures = {
    Free: [
      { id: 0, text: '1 document' },
      { id: 1, text: 'Shared with 1 user' },
      { id: 2, text: 'Collaborate on only 1 document shared' },
    ],
    Basic: [
      { id: 0, text: 'Unlimited documents' },
      { id: 1, text: 'Unlimited shares' },
      { id: 2, text: 'Unlimited collaborations' },
    ],
    Family: [
      { id: 0, text: 'As for Basic' },
      { id: 1, text: 'Up to 5 users' },
    ],
  };

  const updateSubscription = (level) => {
    setSubscriptionLevel(level);
    if (level === 'Family') {
      setAdditionalEmails([]);
    }
    // Set expiry date when subscription is updated
    const currentDate = new Date();
    const newExpiryDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
    setExpiryDate(newExpiryDate);
  };

  const addEmail = (email) => {
    if (subscriptionLevel === 'Family' && additionalEmails.length < 4) {
      setAdditionalEmails((prevEmails) => [...prevEmails, email]);
    }
  };

  const removeEmail = (email) => {
    setAdditionalEmails((prevEmails) => prevEmails.filter((e) => e !== email));
  };

  const getSubscriptionCost = () => {
    return subscriptionCosts[subscriptionLevel];
  };

  const getSubscriptionFeatures = (level = subscriptionLevel) => {
    return subscriptionFeatures[level];
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionLevel,
        additionalEmails,
        expiryDate, // Expose expiry date
        updateSubscription,
        addEmail,
        removeEmail,
        getSubscriptionCost,
        getSubscriptionFeatures, // Expose features
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  return useContext(SubscriptionContext);
};
