import React, { useState, createContext, useEffect, useMemo, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useTenant } from "../hooks/useTenant";

export const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  console.log("SettingsProvider.js");
  const [settings, setSettings] = useState([]);
  const { tenant } = useTenant();
  const { user } = useAuth();

  if (!process.env.REACT_APP_SETTINGS_API) {
    throw new Error("SettingsProvider: REACT_APP_SETTINGS_API environment variable is required");
  }

  useEffect(() => {
    if (user?.id) {
      fetch(`${process.env.REACT_APP_SETTINGS_API}/mysettings/${user.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", APP_ID: tenant },
        })
        .then((res) => res.json())
        .then((res) => {
          setSettings(res);
        })
        .catch((err) => {
          console.error('Error fetching settings:', err);
          setSettings([]);
        });
    }
  }, [user, tenant]);

  const values = useMemo(
    () => ({
      settings,
    }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={values}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
