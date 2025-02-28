import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthenticationProvider } from "./auth/context/AuthContext";
import { TenantProvider } from "./auth/context/TenantContext";
import { SettingsProvider } from "./auth/context/SettingsContext";
import "bootstrap/dist/css/bootstrap.min.css";

// Function to determine the base path dynamically
const getBasename = () => {
  // Get the script tag with the bundle.js source
  const scriptTags = document.querySelectorAll('script');
  let scriptSrc = '';
  
  for (let i = 0; i < scriptTags.length; i++) {
    const src = scriptTags[i].getAttribute('src') || '';
    if (src.includes('bundle.js')) {
      scriptSrc = src;
      break;
    }
  }
  
  // If we found the script tag with bundle.js
  if (scriptSrc) {
    // Extract the path up to the last directory
    const pathParts = scriptSrc.split('/');
    // Remove the filename
    pathParts.pop();
    // Join the remaining parts to form the base path
    return pathParts.join('/');
  }
  
  // Fallback: use the current pathname up to the last segment
  const pathname = window.location.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // If there are segments, use all but the last one (assuming the last is a page route)
  if (pathSegments.length > 0) {
    // Check if the last segment looks like a route (no file extension)
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (!lastSegment.includes('.')) {
      // Remove the last segment as it's likely a route
      pathSegments.pop();
    }
    
    if (pathSegments.length > 0) {
      return '/' + pathSegments.join('/');
    }
  }
  
  // Default to empty string if we couldn't determine a base path
  return '';
};

const container = document.getElementById("root");
console.log("index.js");
console.log(container);
const root = createRoot(container);

// Get the base path for the router
const basename = getBasename();
console.log("Base path for router:", basename);

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
          <BrowserRouter basename={basename}>
            <App />
          </BrowserRouter>
        </SettingsProvider>
      </AuthenticationProvider>
    </TenantProvider>
  </React.StrictMode>
);
