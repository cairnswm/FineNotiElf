import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthenticationProvider } from "./auth/context/AuthContext";
import { TenantProvider } from "./auth/context/TenantContext";
import { SettingsProvider } from "./auth/context/SettingsContext";
import "bootstrap/dist/css/bootstrap.min.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <TenantProvider
      applicationId="d814e6e1-bfa5-11ef-b768-1a220d8ac2c9"
      config={{}}
      onError={(message, error) => console.error(message, error)}
    >
      <AuthenticationProvider
        googleClientId="YOUR_GOOGLE_CLIENT_ID"
        onError={(message, error) => console.error(message, error)}
      >
        <SettingsProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SettingsProvider>
      </AuthenticationProvider>
    </TenantProvider>
  </React.StrictMode>
);
